import React, {useState} from 'react';
import { EllipsisHorizontalCircleIcon, PlusIcon, WrenchIcon } from '@heroicons/react/24/solid'; // XIconをインポート
import BasicModal from '../basicModal';
import StyleModal from './styleModal';

interface LayerListProps {
  layers: string[];
  layerVisibility: { [key: string]: boolean };
  toggleLayerVisibility: (layerName: string, isVisible: boolean) => void;
  handleOpenModal: () => void;
  openBufferModal: () => void;
  openClipModal: () => void;
  openEraseModal: () => void;
  removeLayer: (layerName: string) => void; // レイヤー削除関数をpropsとして追加
  setLayerOpacity: (layerName: string, opacity: number) => void;
  setLayerColor: (layerName: string, color: string) => void;
}

const LayerList: React.FC<LayerListProps> = ({
  layers,
  layerVisibility,
  toggleLayerVisibility,
  handleOpenModal,
  openBufferModal,
  openClipModal,
  openEraseModal,
  removeLayer, // propsから削除関数を受け取る
  setLayerOpacity,
  setLayerColor,
}) => {
  const [visibleMenu, setVisibleMenu] = useState<string | null>(null);
  const [isStyleOpen, setStyleOpen] = useState(false);
  const [activeLayerName, setActiveLayerName] = useState<string | null>(null);
  const [analysisMenuVisible, setAnalysisMenuVisible] = useState(false); // Analysisメニューの表示状態

  // Analysisメニューを表示/非表示する関数
  const toggleAnalysisMenu = () => {
    setAnalysisMenuVisible(!analysisMenuVisible);
  };

  // モーダルを開く関数（バッファ、クリップ、イレース用）
  const openAnalysisModal = (type: 'buffer' | 'clip' | 'erase') => {
    // ここでtypeに応じたモーダルを開くロジックを実装
    console.log(`${type} modal open`); // 仮の実装
    if (type === 'buffer') {
      openBufferModal();
    } else if (type === 'clip') {
      openClipModal();
    } else if (type === 'erase') {
      openEraseModal()
    }
  };

  // 透過表示設定用のモーダルを開く関数
  const openStyleModal = (layerName: string) => {
    setActiveLayerName(layerName); // 対象レイヤー名を更新
    setStyleOpen(true); // モーダルを表示
  };
  
  const closeStyleModal = () => {
    setStyleOpen(false);
    setActiveLayerName(null); // アクティブなレイヤー名をリセット
  };

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
    <div className="w-auto min-w-[200px] bg-white bg-opacity-75 p-4 rounded shadow-lg z-20">
      <div className="font-bold mb-2 italic">Layer List</div>
      <div className="flex space-x-2 mb-4">
        <button onClick={handleOpenModal} className="bg-gray-200 hover:bg-gray-300 p-2 rounded inline-flex items-center" title="Add Layer">
          <PlusIcon className="h-5 w-5 text-blue-500" />
        </button>
        <div className="relative">
        <button onClick={toggleAnalysisMenu} className="bg-gray-200 hover:bg-gray-300 p-2 rounded inline-flex items-center" title="Analysis">
          <WrenchIcon className="h-5 w-5 text-blue-500" />
        </button>
        {analysisMenuVisible && (
          <div className="origin-top-right absolute left-0 mt-1 w-48 z-30 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <ul className="py-1" aria-labelledby="options-menu">
              <li className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" onClick={() => openAnalysisModal('buffer')}>バッファ作成</li>
              <li className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" onClick={() => openAnalysisModal('clip')}>クリップ</li>
              <li className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" onClick={() => openAnalysisModal('erase')}>イレース</li>
            </ul>
          </div>
        )}
      </div>
      </div>
      {layers.map(layerName => (
        <div key={layerName} className="flex items-center justify-between mb-2">
          {activeLayerName === layerName && isStyleOpen && (
            <BasicModal isOpen={true} onClose={closeStyleModal}>
              <StyleModal
                isOpen={true}
                onClose={closeStyleModal}
                layerName={layerName}
                setLayerOpacity={setLayerOpacity}
                setLayerColor={setLayerColor}
              />
            </BasicModal>
          )}
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
                  <li className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" onClick={() => openStyleModal(layerName)}>スタイル設定</li>
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