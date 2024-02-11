import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid'; // XIconをインポート

interface LayerListProps {
  layers: string[];
  layerVisibility: { [key: string]: boolean };
  toggleLayerVisibility: (layerName: string, isVisible: boolean) => void;
  handleOpenModal: () => void;
  openBufferModal: () => void;
  removeLayer: (layerName: string) => void; // レイヤー削除関数をpropsとして追加
}

const LayerList: React.FC<LayerListProps> = ({
  layers,
  layerVisibility,
  toggleLayerVisibility,
  handleOpenModal,
  openBufferModal,
  removeLayer, // propsから削除関数を受け取る
}) => {
  return (
    <div className="w-auto bg-white bg-opacity-75 p-4 rounded shadow-lg z-40">
      <div className="font-bold mb-2 italic">Layer List</div>
      <div className="flex space-x-2 mb-4">
        <button onClick={handleOpenModal} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add Layer
        </button>
        <button onClick={openBufferModal} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Analysis
        </button>
      </div>
      {layers.map(layerName => (
        <div key={layerName} className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id={layerName}
              checked={layerVisibility[layerName]}
              onChange={(e) => toggleLayerVisibility(layerName, e.target.checked)}
              className="mr-2"
            />
            <label htmlFor={layerName}>{layerName}</label>
          </div>
          <button onClick={() => removeLayer(layerName)} className="p-1">
            <XMarkIcon className="h-5 w-5 text-red-500 hover:text-red-700" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default LayerList;