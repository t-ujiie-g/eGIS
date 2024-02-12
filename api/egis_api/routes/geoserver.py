import requests
from fastapi import  HTTPException, APIRouter

from .. import config

router = APIRouter()

@router.post("/create_workspace/")
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
@router.post("/create_datastore/")
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


@router.post("/publish_service/")
async def publish_service(workspace_name: str, datastore_name: str, table_name: str):
    headers = {'Content-type': 'text/xml'}
    featuretype_xml = f"""
<featureType>
  <name>{table_name}</name>
  <nativeName>{table_name}</nativeName>
  <title>{table_name}</title>
  <srs>EPSG:4326</srs>
  <latLonBoundingBox>
    <minx>-180</minx>
    <maxx>180</maxx>
    <miny>-90</miny>
    <maxy>90</maxy>
    <crs>EPSG:4326</crs>
  </latLonBoundingBox>
  <enabled>true</enabled>
</featureType>
"""

    url = f"{config.GEOSERVER_URL}/rest/workspaces/{workspace_name}/datastores/{datastore_name}/featuretypes"
    response = requests.post(url, headers=headers, data=featuretype_xml, auth=(config.GEOSERVER_USER_NAME, config.GEOSERVER_USER_PASS))

    if response.status_code == 201:
        return {"message": f"テーブル '{table_name}' がデータストア '{datastore_name}' に正常に公開されました。"}
    else:
        raise HTTPException(status_code=response.status_code, detail=f"テーブルの公開に失敗しました。ステータスコード: {response.status_code}, メッセージ: {response.text}")

@router.delete("/delete_layer/{workspace_name}/{layer_name}")
async def delete_layer(workspace_name: str, layer_name: str):
    # GeoServer REST APIを使用してレイヤーを削除
    url = f"{config.GEOSERVER_URL}/rest/layers/{workspace_name}:{layer_name}"
    headers = {
        "Content-Type": "application/json",
    }
    response = requests.delete(url, auth=(config.GEOSERVER_USER_NAME, config.GEOSERVER_USER_PASS), headers=headers)
    
    if response.status_code == 200 or response.status_code == 202:
        return {"message": f"Layer {layer_name} in workspace {workspace_name} deleted successfully."}
    else:
        # GeoServerからのエラーレスポンスをそのまま返す
        return HTTPException(status_code=response.status_code, detail=response.text)