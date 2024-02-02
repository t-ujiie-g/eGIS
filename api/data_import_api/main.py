import os
import tempfile
import zipfile
import json
import io
import requests
from uuid import UUID

from fastapi import FastAPI, Depends, HTTPException, status, Body, UploadFile, File
from fastapi.responses import Response
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Table, MetaData, Column, Integer, String, Float, inspect, text
from geoalchemy2 import Geometry
from geoalchemy2.shape import from_shape
from sqlalchemy.sql.sqltypes import NullType
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql.elements import quoted_name
import pandas as pd
import geopandas as gpd
from shapely.geometry import shape
from pandas.api.types import is_integer_dtype, is_float_dtype, is_object_dtype
from pydantic import BaseModel
from pyproj import CRS

from .database import engine
from . import config

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class DataStore(BaseModel):
    workspace_name: str
    datastore_name: str

@app.get("/schemas")
def get_schemas():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT schema_name FROM information_schema.schemata"))
        schemas = [row[0] for row in result.fetchall()]
    return {"schemas": schemas}

@app.post("/create_schema/{schema_name}")
def create_schema(schema_name: str):
    with engine.connect() as connection:
        connection.execute(text(f"CREATE SCHEMA {quoted_name(schema_name, quote=True)}"))
        connection.commit()
    return {"message": f"Schema {schema_name} created successfully"}

@app.get("/tables/{schema_name}")
def get_tables(schema_name: str):
    inspector = inspect(engine)
    tables = inspector.get_table_names(schema=schema_name)
    return {"tables": tables}

@app.get("/table/{schema_name}/{table_name}")
def get_table(schema_name: str, table_name: str):
    inspector = inspect(engine)
    columns = inspector.get_columns(table_name, schema=schema_name)
    schema = {column['name']: str(column['type']) for column in columns}

    with engine.connect() as connection:
        query = text(f"SELECT * FROM {quoted_name(schema_name, quote=True)}.{quoted_name(table_name, quote=True)} LIMIT 10")
        result = connection.execute(query)
        rows = [list(row) for row in result.fetchall()]

    return {"schema": schema, "rows": rows}

@app.post("/import/{schema_name}/{table_name}")
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

@app.post("/import_geojson/{schema_name}/{table_name}")
async def import_geojson(schema_name: str, table_name: str, file: UploadFile = File(...)):
    if not file.filename.endswith('.geojson'):
        raise HTTPException(status_code=400, detail="Invalid file format")

    geojson = json.loads(file.file.read().decode('utf-8'))
    features = geojson['features']

    # Get the CRS from the GeoJSON, if it exists
    crs = geojson.get('crs', {})
    srid = 4326  # Default to WGS84
    if crs:
        crs_name = crs.get('properties', {}).get('name', '')
        try:
            srid = CRS.from_string(crs_name).to_epsg()
        except:
            pass

    metadata = MetaData()

    # Create a new table with a geometry column and columns based on the properties of the GeoJSON
    columns = [Column('id', Integer, primary_key=True),
               Column('geometry', Geometry('GEOMETRY', srid=srid))]

    # Add columns based on the properties of the first feature
    if features:
        properties = features[0]['properties']
        for key, value in properties.items():
            print(f"{key} {value}")
            if is_integer_dtype(type(value)):
                columns.append(Column(key, Integer))
            elif is_float_dtype(type(value)):
                columns.append(Column(key, Float))
            elif is_object_dtype(type(value)):
                columns.append(Column(key, String))
            else:
                columns.append(Column(key, String))

    table = Table(table_name, metadata, *columns, schema=schema_name)
    table.create(engine)

    # Insert data into the table
    with engine.connect() as connection:
        for feature in features:
            geom = from_shape(shape(feature['geometry']), srid=srid)
            properties = feature['properties']
            properties['geometry'] = geom
            connection.execute(table.insert().values(**properties))
        connection.commit()

    return {"message": "GeoJSON data imported successfully"}

@app.post("/import_shapefile/{schema_name}/{table_name}")
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

    # Get the CRS from the GeoDataFrame
    srid = gdf.crs.to_epsg() if gdf.crs else 4326  # Default to WGS84

    metadata = MetaData()

    # Create a new table with a geometry column and columns based on the GeoDataFrame
    columns = [
        Column('id', Integer, primary_key=True),
        Column('geometry', Geometry('GEOMETRY', srid=srid)),
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

    return {"message": "Shapefile data imported successfully"}

@app.delete("/table/{schema_name}/{table_name}")
def delete_table(schema_name: str, table_name: str):
    inspector = inspect(engine)
    tables = inspector.get_table_names(schema=schema_name)
    if table_name not in tables:
        raise HTTPException(status_code=400, detail="Table not found")

    metadata = MetaData()
    table = Table(table_name, metadata, autoload_with=engine, schema=schema_name)
    table.drop(engine)
    return {"message": f"Table {table_name} deleted successfully"}


@app.post("/create_workspace/")
async def create_workspace(workspace_name: str):
    headers = {'Content-type': 'text/xml'}
    workspace_xml = f"""
<workspace>
  <name>{workspace_name}</name>
</workspace>
"""

    url = f"{config.GEOSERVER_URL}/rest/workspaces"
    response = requests.post(url, headers=headers, data=workspace_xml, auth=(config.GEOSERVER_USER_NAME, config.GEOSERVER_USER_PASS))

    if response.status_code == 201:
        return {"message": "ワークスペースが正常に作成されました。"}
    else:
        raise HTTPException(status_code=response.status_code, detail=f"ワークスペースの作成に失敗しました。ステータスコード: {response.status_code}, メッセージ: {response.text}")

# GeoServerにデータストアを登録
@app.post("/create_datastore/")
async def create_datastore(workspace_name: str, datastore_name: str, schema_name: str):
    headers = {'Content-type': 'text/xml'}
    datastore_xml = f"""
<dataStore>
  <name>{datastore_name}</name>
  <connectionParameters>
    <host>{config.DB_HOST}</host>
    <port>{config.DB_PORT}</port>
    <database>{config.DB_NAME}</database>
    <user>{config.DB_USER_NAME}</user>
    <passwd>{config.DB_USER_PASS}</passwd>
    <dbtype>postgis</dbtype>
    <schema>{schema_name}</schema>
  </connectionParameters>
</dataStore>
"""

    url = f"{config.GEOSERVER_URL}/rest/workspaces/{workspace_name}/datastores"
    response = requests.post(url, headers=headers, data=datastore_xml, auth=(config.GEOSERVER_USER_NAME, config.GEOSERVER_USER_PASS))

    if response.status_code == 201:
        return {"message": "データストアが正常に作成されました。"}
    else:
        raise HTTPException(status_code=400, detail=f"データストアの作成に失敗しました。ステータスコード: {response.status_code}, メッセージ: {response.text}")


@app.post("/publish_service/")
async def publish_service(workspace_name: str, datastore_name: str, table_name: str):
    headers = {'Content-type': 'text/xml'}
    featuretype_xml = f"""
<featureType>
  <name>{table_name}</name>
  <nativeName>{table_name}</nativeName>
  <title>{table_name}</title>
  <srs>EPSG:3857</srs>
  <enabled>true</enabled>
</featureType>
"""

    url = f"{config.GEOSERVER_URL}/rest/workspaces/{workspace_name}/datastores/{datastore_name}/featuretypes"
    response = requests.post(url, headers=headers, data=featuretype_xml, auth=(config.GEOSERVER_USER_NAME, config.GEOSERVER_USER_PASS))

    if response.status_code == 201:
        return {"message": f"テーブル '{table_name}' がデータストア '{datastore_name}' に正常に公開されました。"}
    else:
        raise HTTPException(status_code=response.status_code, detail=f"テーブルの公開に失敗しました。ステータスコード: {response.status_code}, メッセージ: {response.text}")
    