import React, { useState } from 'react';
import BasicModal from '../basicModal';

interface styleModalProps {
    isOpen: boolean;
    onClose: () => void;
    layerName: string;
    setLayerOpacity: (layerName: string, opacity: number) => void;
    setLayerColor: (layerName: string, color: string) => void; // 色設定を更新する関数
}

const StyleModal: React.FC<styleModalProps> = ({isOpen, onClose, layerName, setLayerOpacity, setLayerColor}) => {
  const [opacity, setOpacity] = useState("0.5");
  const [color, setColor] = useState("#FFFFFF"); // 色設定の状態

  // 色設定を更新するハンドラ
  const handleColorChange = (newColor: string) => {
    setColor(newColor); // ローカル状態を更新
    setLayerColor(layerName, newColor); // 色設定を更新
  };

  return (
    <BasicModal isOpen={isOpen} onClose={onClose}>
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">スタイル設定</h3>
        <div className="mt-2">
          <p className="text-sm text-gray-500">レイヤーの色と透過表示を調整してください。</p>
          {/* 色設定の選択 */}
          <div className="flex flex-col mt-4">
            <p className="text-sm text-gray-700">カラー設定:</p>
            <input
              type="color"
              value={color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="ml-2"
            />
          </div>
          {/* 透過度のスライダー */}
          <div className="flex flex-col mt-4">
            <p className="text-sm text-gray-700">透過表示:</p>
            <div className="flex items-center mt-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={opacity}
                onChange={(e) => {
                  const newOpacity = parseFloat(e.target.value);
                  setOpacity(e.target.value);
                  setLayerOpacity(layerName, newOpacity);
                }}
                className="flex-1"
              />
              <span className="ml-2 text-sm text-gray-700">{opacity}</span>
            </div>
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

export default StyleModal;