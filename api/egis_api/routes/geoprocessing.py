from fastapi import APIRouter, HTTPException
from sqlalchemy import inspect, text
from sqlalchemy.sql.elements import quoted_name
from pydantic import BaseModel

from ..database import engine

router = APIRouter()

class BufferParameters(BaseModel):
    schema_name: str
    table_name: str
    distance: float
    unit: str  # 距離の単位を指定するためのフィールド
    new_table_name: str

class ClipParameters(BaseModel):
    schema_name: str  # スキーマ名
    clippee_table_name: str  # クリップされるレイヤーのテーブル名
    clipper_table_name: str  # クリップするレイヤーのテーブル名
    new_table_name: str  # 結果を格納する新しいテーブル名

class EraseParameters(BaseModel):
    schema_name: str  # スキーマ名
    erasee_table_name: str  # イレースされるレイヤーのテーブル名
    eraser_table_name: str  # イレースするレイヤーのテーブル名
    new_table_name: str  # 結果を格納する新しいテーブル名

# 空間解析
@router.post("/create_buffer")
def create_buffer(buffer_parameters: BufferParameters):
    schema_name = buffer_parameters.schema_name
    table_name = buffer_parameters.table_name
    distance = buffer_parameters.distance
    new_table_name = buffer_parameters.new_table_name
    unit = buffer_parameters.unit  # 単位を取得

    # 単位に基づいて適切な距離値を設定
    if unit == "meters":
        distance_expr = distance
    elif unit == "kilometers":
        distance_expr = distance * 1000  # キロメートルをメートルに変換
    else:
        # サポートされていない単位が指定された場合はエラーを返す
        raise HTTPException(status_code=400, detail="Unsupported unit")

    # 既存テーブルから列名を取得
    inspector = inspect(engine)
    columns = [column['name'] for column in inspector.get_columns(table_name, schema=schema_name) if column['name'] != 'geometry']

    # 列名リストからSQLクエリのSELECT部分を生成
    select_columns = ', '.join([f'"{col}"' for col in columns])

    with engine.connect() as connection:
        # 新しいテーブルを作成
        connection.execute(
            text(f"""
                CREATE TABLE {quoted_name(schema_name, quote=True)}.{quoted_name(new_table_name, quote=True)} AS
                SELECT 
                    {select_columns}, 
                    ST_Buffer(geometry, {distance_expr}) AS geometry
                FROM {quoted_name(schema_name, quote=True)}.{quoted_name(table_name, quote=True)}
            """))
        # 空間インデックスを作成
        connection.execute(text(f"""
            CREATE INDEX ON {quoted_name(schema_name, quote=True)}.{quoted_name(new_table_name, quote=True)} USING GIST (geometry);
        """))
        connection.commit()
    return {"message": f"バッファが作成され、{new_table_name}に格納されました。"}


@router.post("/clip")
def clip_feature(clip_parameters: ClipParameters):
    # パラメータから値を取得
    schema_name = clip_parameters.schema_name
    clippee_table = clip_parameters.clippee_table_name
    clipper_table = clip_parameters.clipper_table_name
    new_table_name = clip_parameters.new_table_name

    # 既存テーブルから列名を取得
    inspector = inspect(engine)
    columns = [column['name'] for column in inspector.get_columns(clippee_table, schema=schema_name) if column['name'] != 'geometry']

    # 列名リストからSQLクエリのSELECT部分を生成
    select_columns = ', '.join([f'a."{col}"' for col in columns])

    with engine.connect() as connection:
        # クリップ機能を実行するSQLクエリ
        connection.execute(
            text(f"""
                CREATE TABLE {schema_name}.{new_table_name} AS
                SELECT 
                    {select_columns}, 
                    ST_Intersection(a.geometry, b.geometry) AS geometry
                FROM 
                    {schema_name}.{clippee_table} AS a,
                    {schema_name}.{clipper_table} AS b
                WHERE 
                    ST_Intersects(a.geometry, b.geometry);
            """))
        # 空間インデックスを作成
        connection.execute(text(f"""
            CREATE INDEX ON {schema_name}.{new_table_name} USING GIST (geometry);
        """))
        connection.commit()
    return {"message": f"クリップが完了し、結果が{new_table_name}に格納されました。"}


@router.post("/erase")
def erase_feature(erase_parameters: EraseParameters):
    # パラメータから値を取得
    schema_name = erase_parameters.schema_name
    erasee_table = erase_parameters.erasee_table_name
    eraser_table = erase_parameters.eraser_table_name
    new_table_name = erase_parameters.new_table_name

    # 既存テーブルから列名を取得
    inspector = inspect(engine)
    columns = [column['name'] for column in inspector.get_columns(erasee_table, schema=schema_name) if column['name'] != 'geometry']

    # 列名リストからSQLクエリのSELECT部分を生成
    select_columns = ', '.join([f'a."{col}"' for col in columns])

    # イレース機能を実行するSQLクエリ
    # 1つのクエリで処理を行う
    optimized_query = f"""
        CREATE TABLE {schema_name}.{new_table_name} AS
        SELECT 
            {select_columns}, 
            CASE 
                WHEN ST_Intersects(a.geometry, b.geometry) THEN ST_Difference(a.geometry::geometry, b.geometry::geometry)::geography
                ELSE a.geometry
            END AS geometry
        FROM 
            {schema_name}.{erasee_table} AS a
        LEFT JOIN 
            {schema_name}.{eraser_table} AS b ON ST_Intersects(a.geometry, b.geometry);
    """

    with engine.connect() as connection:
        connection.execute(text(optimized_query))
        # 空間インデックスを作成
        connection.execute(text(f"""
            CREATE INDEX ON {schema_name}.{new_table_name} USING GIST (geometry);
        """))
        connection.commit()

    return {"message": f"イレースが完了し、結果が{new_table_name}に格納されました。"}
