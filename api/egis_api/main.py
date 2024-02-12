from fastapi import FastAPI, Depends, HTTPException, status, Body, UploadFile, File
from fastapi.responses import Response
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Table, MetaData, Column, Integer, String, Float, inspect, text
from geoalchemy2 import Geometry, Geography
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
from .routes import database_api, geoserver, geoprocessing

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

class BufferParameters(BaseModel):
    schema_name: str
    table_name: str
    distance: float
    unit: str  # 距離の単位を指定するためのフィールド
    new_table_name: str

app.include_router(database_api.router)
app.include_router(geoserver.router)
app.include_router(geoprocessing.router)
