import React, { useState } from 'react';
import SuccessModal from '../successModal';

interface EraseModalProps {
  layers: string[]; // イレース対象のレイヤー名リスト
  onCreateErase: (targetLayer: string, eraseLayer: string, newLayerName?: string) => void;
  onClose: () => void;
  onEraseSuccess: () => void;
}

const EraseModal: React.FC<EraseModalProps> = ({ layers, onCreateErase, onClose, onEraseSuccess }) => {
  const [targetLayer, setTargetLayer] = useState('');
  const [eraseLayer, setEraseLayer] = useState('');
  const [newLayerName, setNewLayerName] = useState('');
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // onCreateErase関数を非同期で呼び出し、イレース処理を行う
      await onCreateErase(targetLayer, eraseLayer, newLayerName || `${targetLayer}_erase`);
      // 処理が成功したら、成功モーダルを表示
      setShowModal(true);
      // 成功後の追加の処理があればここに記述
      onEraseSuccess(); // 成功時のコールバック関数を呼び出す
    } catch (error) {
      // エラーハンドリング
      console.error('イレース処理に失敗しました:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="targetLayer" className="block text-sm font-medium text-gray-700">対象レイヤー</label>
          <select
            id="targetLayer"
            value={targetLayer}
            onChange={(e) => setTargetLayer(e.target.value)}
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
          <label htmlFor="eraseLayer" className="block text-sm font-medium text-gray-700">イレースレイヤー</label>
          <select
            id="eraseLayer"
            value={eraseLayer}
            onChange={(e) => setEraseLayer(e.target.value)}
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
            placeholder={`${targetLayer}_erase`}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          イレース実行
        </button>
      </form>
      {showModal && <SuccessModal showModal={showModal} onClose={onClose} onUploadSuccess={onEraseSuccess}/>}
    </div>
  );
};

export default EraseModal;