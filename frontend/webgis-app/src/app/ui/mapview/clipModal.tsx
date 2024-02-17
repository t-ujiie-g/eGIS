import React, { useState } from 'react';
import SuccessModal from '../successModal';

interface ClipModalProps {
  layers: string[]; // クリップ対象のレイヤー名リスト
  onCreateClip: (inputLayer: string, clipLayer: string, newLayerName?: string) => void;
  onClose: () => void;
  onClipSuccess: () => void;
}

const ClipModal: React.FC<ClipModalProps> = ({ layers, onCreateClip, onClose, onClipSuccess }) => {
  const [inputLayer, setInputLayer] = useState('');
  const [clipLayer, setClipLayer] = useState('');
  const [newLayerName, setNewLayerName] = useState('');
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // onCreateClip関数を非同期で呼び出し、クリップ処理を行う
      await onCreateClip(inputLayer, clipLayer, newLayerName || `${inputLayer}_clip`);
      // 処理が成功したら、成功モーダルを表示
      setShowModal(true);
      // 成功後の追加の処理があればここに記述
      onClipSuccess(); // 成功時のコールバック関数を呼び出す
    } catch (error) {
      // エラーハンドリング
      console.error('クリップ処理に失敗しました:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="inputLayer" className="block text-sm font-medium text-gray-700">入力レイヤー</label>
          <select
            id="inputLayer"
            value={inputLayer}
            onChange={(e) => setInputLayer(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="">選択してください</option>
            {layers.map((layer) => (
              <option key={layer} value={layer}>{layer}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="clipLayer" className="block text-sm font-medium text-gray-700">クリップレイヤー</label>
          <select
            id="clipLayer"
            value={clipLayer}
            onChange={(e) => setClipLayer(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="">選択してください</option>
            {layers.map((layer) => (
              <option key={layer} value={layer}>{layer}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="newLayerName" className="block text-sm font-medium text-gray-700">新しいレイヤー名</label>
          <input
            type="text"
            id="newLayerName"
            value={newLayerName}
            onChange={(e) => setNewLayerName(e.target.value)}
            placeholder={`${inputLayer}_clipped`}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          クリップ実行
        </button>
      </form>
      {showModal && <SuccessModal showModal={showModal} onClose={onClose} onUploadSuccess={onClipSuccess}/>}
    </div>
  );
};

export default ClipModal;