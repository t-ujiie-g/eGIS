from fastapi import APIRouter
from ..database import engine

import os
import tempfile
import zipfile
import json
import io

from fastapi import FastAPI, Depends, HTTPException, status, Body, UploadFile, File
from sqlalchemy import create_engine, Table, MetaData, Column, Integer, String, Float, inspect, text
from geoalchemy2 import Geometry, Geography
from geoalchemy2.shape import from_shape
from sqlalchemy.sql.sqltypes import NullType
from sqlalchemy.sql.elements import quoted_name
import pandas as pd
import geopandas as gpd

router = APIRouter()

@router.get("/schemas")
def get_schemas():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT schema_name FROM information_schema.schemata"))
        schemas = [row[0] for row in result.fetchall()]
    return {"schemas": schemas}

@router.post("/create_schema/{schema_name}")
def create_schema(schema_name: str):
    with engine.connect() as connection:
        connection.execute(text(f"CREATE SCHEMA {quoted_name(schema_name, quote=True)}"))
        connection.commit()
    return {"message": f"Schema {schema_name} created successfully"}

@router.get("/tables/{schema_name}")
def get_tables(schema_name: str):
    inspector = inspect(engine)
    tables = inspector.get_table_names(schema=schema_name)
    return {"tables": tables}

@router.get("/table/{schema_name}/{table_name}")
def get_table(schema_name: str, table_name: str):
    inspector = inspect(engine)
    columns = inspector.get_columns(table_name, schema=schema_name)
    schema = {column['name']: str(column['type']) for column in columns}

    with engine.connect() as connection:
        query = text(f"SELECT * FROM {quoted_name(schema_name, quote=True)}.{quoted_name(table_name, quote=True)} LIMIT 10")
        result = connection.execute(query)
        rows = [list(row) for row in result.fetchall()]

    return {"schema": schema, "rows": rows}

@router.post("/import/{schema_name}/{table_name}")
async def import_data(schema_name: str, table_name: str, file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file format")

    df = pd.read_csv(io.StringIO(file.file.read().decode('utf-8')))

    metadata = MetaData()

    # Create a new table based on the CSV file
    columns = []
    for column_name, dtype in df.dtypes.items():
        if dtype == 'int64':
            columns.append(Column(column_name, Integer))
        elif dtype == 'float64':
            columns.append(Column(column_name, Float))
        elif dtype == 'object':
            columns.append(Column(column_name, String))
        else:
            columns.append(Column(column_name, NullType))

    table = Table(table_name, metadata, *columns, schema=schema_name)
    table.create(engine)

    # Insert data into the table
    data = df.to_dict(orient='records')
    with engine.connect() as connection:
        for row in data:
            connection.execute(table.insert().values(**row))
        connection.commit()

    return {"message": "Data imported successfully"}

@router.post("/import_geojson/{schema_name}/{table_name}")
async def import_geojson(schema_name: str, table_name: str, file: UploadFile = File(...)):
    if not file.filename.endswith('.geojson'):
        raise HTTPException(status_code=400, detail="Invalid file format")

    # ファイルからGeoJSONを読み込む
    geojson = json.loads(file.file.read().decode('utf-8'))
    
    # GeoDataFrameに変換
    gdf = gpd.GeoDataFrame.from_features(geojson['features'])
    
    # GeoDataFrameにCRSが設定されていない場合、デフォルトでEPSG:4326を設定
    if gdf.crs is None:
        gdf.set_crs(epsg=4326, inplace=True)
    else:
        # 元のデータの座標系がEPSG:4326以外の場合、EPSG:4326に投影変換する
        gdf = gdf.to_crs(epsg=4326)

    srid = 4326  # WGS84

    metadata = MetaData()

    # 新しいテーブルを作成するための列を定義する
    columns = [Column('id', Integer, primary_key=True),
               Column('geometry', Geography('GEOMETRY', srid=srid))]

    # GeoDataFrameのプロパティに基づいて列を追加する
    if not gdf.empty:
        for key, value in gdf.iloc[0].items():
            if key != 'geometry':  # 'geometry'列は別途処理される
                if pd.api.types.is_integer_dtype(value):
                    columns.append(Column(key, Integer))
                elif pd.api.types.is_float_dtype(value):
                    columns.append(Column(key, Float))
                else:
                    columns.append(Column(key, String))

    table = Table(table_name, metadata, *columns, schema=schema_name)
    table.create(engine)

    # テーブルにデータを挿入する
    with engine.connect() as connection:
        for _, row in gdf.iterrows():
            geom = from_shape(row['geometry'], srid=srid) if row['geometry'] else None
            row_data = row.drop('geometry').to_dict()
            row_data['geometry'] = geom
            connection.execute(table.insert().values(**row_data))
        connection.commit()

        # 空間インデックスを作成
        connection.execute(text(f"""
            CREATE INDEX ON {quoted_name(schema_name, quote=True)}.{quoted_name(table_name, quote=True)} USING GIST (geometry);
        """))
        connection.commit()

    return {"message": "GeoJSON data imported successfully"}

@router.post("/import_shapefile/{schema_name}/{table_name}")
async def import_shapefile(schema_name: str, table_name: str, file: UploadFile = File(...)):
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Invalid file format")

    # Unzip the shapefile
    with tempfile.TemporaryDirectory() as tmpdirname:
        with zipfile.ZipFile(io.BytesIO(file.file.read())) as zip_ref:
            zip_ref.extractall(tmpdirname)
        
        # Recursively find the .shp file in the extracted files
        shapefile_path = None
        for root, dirs, files in os.walk(tmpdirname):
            for filename in files:
                if filename.endswith('.shp'):
                    shapefile_path = os.path.join(root, filename)
                    break
            if shapefile_path:
                break
        
        if shapefile_path is None:
            raise HTTPException(status_code=400, detail="No .shp file found in the zip")

        # Read the shapefile into a GeoDataFrame
        gdf = gpd.read_file(shapefile_path)

    # GeoDataFrameにCRSが設定されていない場合、デフォルトでEPSG:4326を設定
    if gdf.crs is None:
        gdf.set_crs(epsg=4326, inplace=True)
    else:
        # 元のデータの座標系がEPSG:4326以外の場合、EPSG:4326に投影変換する
        gdf = gdf.to_crs(epsg=4326)

    # Get the CRS from the GeoDataFrame
    srid = 4326  # WGS84

    metadata = MetaData()

    # Create a new table with a geometry column and columns based on the GeoDataFrame
    columns = [
        Column('id', Integer, primary_key=True),
        Column('geometry', Geography('GEOMETRY', srid=srid)),
    ]

    # Add columns based on the properties of the GeoDataFrame
    for column_name, dtype in zip(gdf.columns, gdf.dtypes):
        if dtype == 'int64':
            columns.append(Column(column_name, Integer))
        elif dtype == 'float':
            columns.append(Column(column_name, Float))
        elif dtype == 'object':
            columns.append(Column(column_name, String))
        elif dtype == 'geometry':
            pass
        else:
            columns.append(Column(column_name, String))

    table = Table(table_name, metadata, *columns, schema=schema_name)
    table.create(engine)

    # Insert data into the table
    with engine.connect() as connection:
        for index, row in gdf.iterrows():
            geom = from_shape(row['geometry'], srid=srid) if row['geometry'] else None
            row_data = row.to_dict()
            row_data['geometry'] = geom
            connection.execute(table.insert().values(**row_data))
        connection.commit()

        # 空間インデックスを作成
        connection.execute(text(f"""
            CREATE INDEX ON {quoted_name(schema_name, quote=True)}.{quoted_name(table_name, quote=True)} USING GIST (geometry);
        """))
        connection.commit()

    return {"message": "Shapefile data imported successfully"}

@router.delete("/table/{schema_name}/{table_name}")
def delete_table(schema_name: str, table_name: str):
    inspector = inspect(engine)
    tables = inspector.get_table_names(schema=schema_name)
    if table_name not in tables:
        raise HTTPException(status_code=400, detail="Table not found")

    metadata = MetaData()
    table = Table(table_name, metadata, autoload_with=engine, schema=schema_name)
    table.drop(engine)
    return {"message": f"Table {table_name} deleted successfully"}