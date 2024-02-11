import React, { useState } from 'react';
import BasicModal from '../basicModal';

interface OpacityModalProps {
    isOpen: boolean;
    onClose: () => void;
    layerName: string;
    setLayerOpacity: (layerName: string, opacity: number) => void;
}

const OpacityModal: React.FC<OpacityModalProps> = ({isOpen, onClose, layerName, setLayerOpacity}) => {
  // スライダーの値を追跡するためのローカル状態
  const [opacity, setOpacity] = useState("0.5");

  return (
    <BasicModal isOpen={isOpen} onClose={onClose}>
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">透過表示設定</h3>
        <div className="mt-2">
          <p className="text-sm text-gray-500">レイヤーの透過度を調整してください。</p>
          <div className="flex items-center mt-4">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity} // スライダーの値をローカル状態から設定
              onChange={(e) => {
                const newOpacity = parseFloat(e.target.value);
                setOpacity(e.target.value); // ローカル状態を更新
                setLayerOpacity(layerName, newOpacity); // 透過度を更新
              }}
              className="flex-1"
            />
            <span className="ml-2 text-sm text-gray-700">{opacity}</span> {/* スライダーの値を表示 */}
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={onClose}
          >
            閉じる
          </button>
        </div>
      </div>
    </BasicModal>
  );
};

export default OpacityModal;