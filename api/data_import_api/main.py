from fastapi import FastAPI, Depends, HTTPException, status, Body, UploadFile, File
from fastapi.responses import Response
from uuid import UUID
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy import Table, MetaData, Column, Integer, String, Float, inspect, text
from sqlalchemy.sql.sqltypes import NullType
from sqlalchemy.dialects.postgresql import JSONB
from .database import engine
import pandas as pd
import io

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/tables")
def get_tables():
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    return {"tables": tables}

@app.get("/table/{table_name}")
def get_table(table_name: str):
    inspector = inspect(engine)
    columns = inspector.get_columns(table_name)
    # print(columns)
    schema = {column['name']: str(column['type']) for column in columns}

    with engine.connect() as connection:
        query = text(f"SELECT * FROM {table_name} LIMIT 10")
        result = connection.execute(query)
        rows = [list(row) for row in result.fetchall()]

    return {"schema": schema, "rows": rows}

@app.post("/import/{table_name}")
async def import_data(table_name: str, file: UploadFile = File(...)):
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

    table = Table(table_name, metadata, *columns)
    table.create(engine)

    # Insert data into the table
    data = df.to_dict(orient='records')
    with engine.connect() as connection:
        for row in data:
            connection.execute(table.insert().values(**row))
        connection.commit()

    return {"message": "Data imported successfully"}

@app.delete("/table/{table_name}")
def delete_table(table_name: str):
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    if table_name not in tables:
        raise HTTPException(status_code=400, detail="Table not found")

    metadata = MetaData()
    table = Table(table_name, metadata, autoload_with=engine)
    table.drop(engine)
    return {"message": f"Table {table_name} deleted successfully"}
