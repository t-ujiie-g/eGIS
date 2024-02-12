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

# 空間解析
@router.post("/create_buffer")
def create_buffer_and_store(buffer_parameters: BufferParameters):
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
            """)
        )
        connection.commit()
    return {"message": f"バッファが作成され、{new_table_name}に格納されました。"}
