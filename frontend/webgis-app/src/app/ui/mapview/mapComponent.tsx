import React, { useEffect, useState, useCallback } from 'react';
import L from 'leaflet';
import ReactDOM from 'react-dom';
import AddModal from './addModal';

interface MapComponentProps {
  handleOpenModal: () => void;
  isOpen: boolean;
  handleCloseModal: () => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ handleOpenModal, isOpen, handleCloseModal }) => {
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

  return (
    <>
      <button 
        onClick={handleOpenModal} 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2"
      >
        データ追加
      </button>
      <AddModal isOpen={isOpen} onClose={handleCloseModal}  addWmsLayer={addWmsLayer}/>
      <div id="map" style={{ height: '800px', width: '100%', zIndex: 10 }}></div>
    </>
  );
};

export default MapComponent;