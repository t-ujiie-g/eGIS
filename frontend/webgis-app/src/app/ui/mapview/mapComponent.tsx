import React, { useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import axios from 'axios';
import { API_URL, DB_SCHEMA, GEOSERVER_URL, GEOSERVER_WORKSPACE, GEOSERVER_DATASTORE } from '../config';
import BasicModal from '../basicModal';
import AddLayer from './addLayer';
import CreateBuffer from './createBuffer';
import LayerList from './layerList';

interface MapComponentProps {
  handleOpenModal: () => void;
  isOpen: boolean;
  handleCloseModal: () => void;
  openBufferModal: () => void;
  isBufferOpen: boolean;
  closeBufferModal: () => void;
  handleBufferSuccess: () => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  handleOpenModal,
  isOpen,
  handleCloseModal,
  openBufferModal,
  isBufferOpen,
  closeBufferModal,
  handleBufferSuccess,
}) => {
  const [map, setMap] = useState<maplibregl.Map>();
  const [mapStyle, setMapStyle] = useState('https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'); // 初期スタイル
  const [layers, setLayers] = useState<string[]>([]); // 追加したレイヤーの名前を管理するステート
  const [layerVisibility, setLayerVisibility] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const initialMap = new maplibregl.Map({
      container: 'map', // コンテナID
      style: mapStyle, // スタイル状態を使用
      center: [139.767125, 35.681236], // 東京駅
      zoom: 13,
    });

    setMap(initialMap);

    return () => {
      initialMap.remove();
    };
  }, []);

  // WFSレイヤーを追加し、スタイルを設定する関数
  const addWfsLayer = async (layerName: string) => {
    if (!map) return;

    const url = `${GEOSERVER_URL}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${GEOSERVER_WORKSPACE}:${layerName}&outputFormat=application/json`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      // データから最初のフィーチャーのジオメトリタイプを取得
      const geometryType = data.features[0].geometry.type;
      let paint: {};
      let layerType: 'fill' | 'line' | 'circle';

      switch (geometryType) {
        case 'Polygon':
        case 'MultiPolygon':
          layerType = 'fill';
          paint = {
            'fill-color': '#00FFFF', // 水色
            'fill-opacity': 0.5, // 50%の透過表示
            'fill-outline-color': '#B0BEC5' // 枠線の色
          };
          break;
        case 'LineString':
        case 'MultiLineString':
          layerType = 'line';
          paint = {
            'line-color': '#008000', // 緑色
            'line-width': 2,
            'line-opacity': 0.5
          };
          break;
        case 'Point':
        case 'MultiPoint':
          layerType = 'circle';
          paint = {
            'circle-color': '#FF0000', // 赤色
            'circle-radius': 5,
            'circle-opacity': 0.5,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#B0BEC5' // 枠線の色
          };
          break;
        default:
          console.error('未対応のジオメトリタイプ:', geometryType);
          return;
      }

      map.addSource(layerName, {
        type: 'geojson',
        data: data
      });

      map.addLayer({
        id: layerName,
        type: layerType,
        source: layerName as any, // 型アサーションを使用してエラーを回避
        paint: paint
      });

      // レイヤー名をステートに追加する際に、配列の先頭に追加
      setLayers(prev => [layerName, ...prev]);
      setLayerVisibility(prev => ({ ...prev, [layerName]: true }));

    } catch (error) {
      console.error('WFSレイヤーの読み込みに失敗:', error);
    }
  };

  // WMSレイヤーを追加する関数
  const addWmsLayer = (layerName: string) => {
    if (!map) return;

    map.addSource(layerName, { // ソースIDとしてレイヤー名を使用
      'type': 'raster',
      'tiles': [
        `${GEOSERVER_URL}/test_workspace/wms?service=WMS&request=GetMap&layers=${layerName}&styles=&format=image/png&transparent=true&version=1.1.1&width=256&height=256&srs=EPSG:3857&bbox={bbox-epsg-3857}`
      ],
      'tileSize': 256,
    });

    map.addLayer({
      'id': layerName, // レイヤーIDとしてレイヤー名を使用
      'type': 'raster',
      'source': layerName, // 上で定義したソースID
    });

    // レイヤー名をステートに追加する際に、配列の先頭に追加
    setLayers(prev => [layerName, ...prev]);
    setLayerVisibility(prev => ({ ...prev, [layerName]: true }));

    return () => {
      if (map.getLayer(layerName)) {
        map.removeLayer(layerName);
      }
      if (map.getSource(layerName)) {
        map.removeSource(layerName);
      }
    };
  };

  // レイヤーの表示/非表示を切り替える関数
  const toggleLayerVisibility = (layerName: string, isVisible: boolean) => {
    if (!map || !map.getLayer(`${layerName}`)) return;

    map.setLayoutProperty(`${layerName}`, 'visibility', isVisible ? 'visible' : 'none');
    setLayerVisibility(prev => ({ ...prev, [layerName]: isVisible }));
  };

  // レイヤーを削除する関数
  const removeLayer = (layerName: string) => {
    if (!map) return;

    // マップからレイヤーを削除
    if (map.getLayer(layerName)) {
      map.removeLayer(layerName);
    }
    // マップからソースを削除
    if (map.getSource(layerName)) {
      map.removeSource(layerName);
    }

    // レイヤーの状態を更新して、削除されたレイヤーをリストから除外
    setLayers(prev => prev.filter(name => name !== layerName));
    // レイヤーの表示状態からも削除
    setLayerVisibility(prev => {
      const newVisibility = { ...prev };
      delete newVisibility[layerName];
      return newVisibility;
    });
  };

  // レイヤーの透過度を設定する関数
  const setLayerOpacity = (layerName: string, opacity: number) => {
    if (!map || !map.getLayer(layerName)) return;
  
    const layer = map.getLayer(layerName);
    if (!layer) return;
    const layerType = layer.type;
    let opacityProperty = '';
  
    switch (layerType) {
      case 'fill':
        opacityProperty = 'fill-opacity';
        break;
      case 'line':
        opacityProperty = 'line-opacity';
        break;
      case 'circle':
        opacityProperty = 'circle-opacity';
        break;
      default:
        console.error('未対応のレイヤータイプ:', layerType);
        return;
    }
  
    map.setPaintProperty(layerName, opacityProperty, opacity);
  };

  // レイヤーの色を設定する関数
  const setLayerColor = (layerName: string, color: string): void => {
    if (!map || !map.getLayer(layerName)) return;

    const layer = map.getLayer(layerName);
    if (!layer) return;
    const layerType = layer.type;
    let colorProperty = '';

    switch (layerType) {
      case 'fill':
        colorProperty = 'fill-color';
        break;
      case 'line':
        colorProperty = 'line-color';
        break;
      case 'circle':
        colorProperty = 'circle-color';
        break;
      case 'symbol':
        // シンボルレイヤーの場合、テキストやアイコンの色を設定することができます。
        // ここではテキストの色を設定する例を示します。
        colorProperty = 'text-color';
        break;
      default:
        console.error('未対応のレイヤータイプ:', layerType);
        return;
    }

    map.setPaintProperty(layerName, colorProperty, color);
  };

  // APIリクエストを実行する関数
  const handleCreateBuffer = async (tableName: string, bufferDistance: number, unit: 'meters' | 'kilometers', newTableName?: string) => {
    try {
      const url = `${API_URL}/create_buffer`;
      const bufferResponse = await axios.post(url, {
        schema_name: DB_SCHEMA,
        table_name: tableName,
        distance: bufferDistance,
        unit: unit,
        new_table_name: newTableName,
      });

      console.log('バッファ作成成功:', bufferResponse.data);

      // バッファ作成が成功した場合、Geoserverにサービスを公開
      const publishApiUrl = `${API_URL}/publish_service/?workspace_name=${encodeURIComponent(GEOSERVER_WORKSPACE)}&datastore_name=${encodeURIComponent(GEOSERVER_DATASTORE)}&table_name=${encodeURIComponent(newTableName || `${tableName}_buffer`)}`;
      const publishResponse = await axios.post(publishApiUrl, {}, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('GeoServerにサービス公開成功:', publishResponse.data);
      addWfsLayer(newTableName || `${tableName}_buffer`);

    } catch (error: any) {
      console.error('エラー:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="flex">
      <LayerList
        layers={layers}
        layerVisibility={layerVisibility}
        toggleLayerVisibility={toggleLayerVisibility}
        handleOpenModal={handleOpenModal}
        openBufferModal={openBufferModal}
        removeLayer={removeLayer} // removeLayer関数をLayerListに渡す
        setLayerOpacity={setLayerOpacity}
        setLayerColor={setLayerColor}
      />
      <div id="map" className="flex-grow" style={{ height: '800px', zIndex: 10 }}></div>
      <BasicModal isOpen={isOpen} onClose={handleCloseModal}>
        <AddLayer addWmsLayer={addWfsLayer} />
      </BasicModal>
      <BasicModal isOpen={isBufferOpen} onClose={closeBufferModal}>
        <CreateBuffer onCreateBuffer={handleCreateBuffer} onClose={closeBufferModal} onBufferSuccess={handleBufferSuccess} />
      </BasicModal>
    </div>
  );
};

export default MapComponent;