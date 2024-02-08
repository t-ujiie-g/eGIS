import React, { useEffect, useState, useCallback } from 'react';
import L from 'leaflet';
import axios from 'axios';
import { API_URL, DB_SCHEMA, GEOSERVER_WORKSPACE, GEOSERVER_DATASTORE } from '../config';
import AddModal from './addModal';
import AddLayer from './addLayer';
import CreateBuffer from './createBuffer';

interface MapComponentProps {
  handleOpenModal: () => void;
  isOpen: boolean;
  handleCloseModal: () => void;
  openBufferModal: () => void;
  isBufferOpen: boolean;
  closeBufferModal: () => void;
  handleBufferSuccess: () => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ handleOpenModal, isOpen, handleCloseModal, openBufferModal, isBufferOpen, closeBufferModal, handleBufferSuccess }) => {
  const [map, setMap] = useState<L.Map>();

  useEffect(() => {
    const initialMap = L.map('map').setView([35.681236, 139.767125], 13);

    // デフォルトの背景地図（ライトグレー）
    const lightGrayLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors, &copy; CartoDB',
    }).addTo(initialMap);

    // 他の背景地図の例
    const darkGrayLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors, &copy; CartoDB',
    });
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    });
    const satelliteLayer = L.tileLayer('https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2018_3857/default/g/{z}/{x}/{y}.jpg');

    // レイヤーの切り替え機能を実装（例）
    const baseMaps = {
      "ライトグレー": lightGrayLayer,
      "ダークグレー": darkGrayLayer,
      "OSM": osmLayer,
      "Sentinel-2": satelliteLayer,
    };
    L.control.layers(baseMaps).addTo(initialMap);
    setMap(initialMap);

    return () => {
      initialMap.remove();
    };
  }, []);

  // WMSレイヤーを追加する関数
  const addWmsLayer = (layerName: string) => {
    if (!map) return;

    const wmsLayer = L.tileLayer.wms("http://localhost:8080/geoserver/test_workspace/wms", {
      layers: layerName,
      format: 'image/png',
      transparent: true,
      version: '1.1.1',
    }).addTo(map);

    wmsLayer.bringToFront();

    return () => {
      map.removeLayer(wmsLayer);
    };
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
  } catch (error: any) {
    console.error('エラー:', error.response ? error.response.data : error.message);
  }
};

  return (
    <>
      <button 
        onClick={handleOpenModal} 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2"
      >
        データ追加
      </button>
      <button 
        onClick={openBufferModal} 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2"
      >
        バッファ作成
      </button>
      <AddModal isOpen={isOpen} onClose={handleCloseModal}>
        <AddLayer addWmsLayer={addWmsLayer} />
      </AddModal>
      <AddModal isOpen={isBufferOpen} onClose={closeBufferModal}>
        <CreateBuffer onCreateBuffer={handleCreateBuffer} onClose={closeBufferModal} onBufferSuccess={handleBufferSuccess}/>
      </AddModal>
      <div id="map" style={{ height: '800px', width: '100%', zIndex: 10 }}></div>
    </>
  );
};

export default MapComponent;