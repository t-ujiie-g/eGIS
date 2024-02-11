import React, {useState} from 'react';
import { XMarkIcon, EllipsisHorizontalCircleIcon } from '@heroicons/react/24/solid'; // XIconをインポート
import BasicModal from '../basicModal';
import OpacityModal from './opacityModal';

interface LayerListProps {
  layers: string[];
  layerVisibility: { [key: string]: boolean };
  toggleLayerVisibility: (layerName: string, isVisible: boolean) => void;
  handleOpenModal: () => void;
  openBufferModal: () => void;
  removeLayer: (layerName: string) => void; // レイヤー削除関数をpropsとして追加
  setLayerOpacity: (layerName: string, opacity: number) => void;
}

const LayerList: React.FC<LayerListProps> = ({
  layers,
  layerVisibility,
  toggleLayerVisibility,
  handleOpenModal,
  openBufferModal,
  removeLayer, // propsから削除関数を受け取る
  setLayerOpacity,
}) => {
  const [visibleMenu, setVisibleMenu] = useState<string | null>(null);
  const [isOpacityOpen, setOpacityOpen] = useState(false);
  const [activeLayerName, setActiveLayerName] = useState<string | null>(null);

  // 透過表示設定用のモーダルを開く関数
  const openOpacityModal = (layerName: string) => {
    setActiveLayerName(layerName); // 対象レイヤー名を更新
    setOpacityOpen(true); // モーダルを表示
  };

  const closeOpacityModal = () => setOpacityOpen(false);

  // メニュー表示関数
  const showMenu = (layerName: string) => {
    if (visibleMenu === layerName) {
      setVisibleMenu(null); // 既に表示されているメニューをクリックした場合は閉じる
    } else {
      setVisibleMenu(layerName); // 新しいメニューを表示
    }
  };

  // メニュー表示状態確認関数
  const isMenuVisible = (layerName: string) => {
    return visibleMenu === layerName;
  };

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
          <BasicModal isOpen={isOpacityOpen} onClose={closeOpacityModal}>
            <OpacityModal
              isOpen={isOpacityOpen}
              onClose={closeOpacityModal}
              layerName={layerName}
              setLayerOpacity={setLayerOpacity}
            />
          </BasicModal>
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
          <div className="relative">
            <button onClick={() => showMenu(layerName)} className="p-1">
              <EllipsisHorizontalCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-700" />
            </button>
            {isMenuVisible(layerName) && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg z-40 rounded">
                <ul>
                  <li className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" onClick={() => openOpacityModal(layerName)}>透過表示設定</li>
                  <li className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" onClick={() => removeLayer(layerName)}>レイヤー削除</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LayerList;