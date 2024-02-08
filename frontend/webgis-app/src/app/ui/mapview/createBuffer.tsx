import React, { useState } from 'react';
import SuccessModal from '../successModal';

interface CreateBufferProps {
  onCreateBuffer: (tableName: string, bufferDistance: number, unit: 'meters' | 'kilometers', newTableName?: string) => void;
  onClose: () => void;
  onBufferSuccess: () => void;
}

const CreateBuffer: React.FC<CreateBufferProps> = ({ onCreateBuffer, onClose, onBufferSuccess }) => {
  const [tableName, setTableName] = useState('');
  const [bufferDistance, setBufferDistance] = useState('');
  const [unit, setUnit] = useState<'meters' | 'kilometers'>('meters');
  const [newTableName, setNewTableName] = useState('');
  const [showModal, setShowModal] = useState<boolean>(false); // モーダル表示状態の管理

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const distance = parseFloat(bufferDistance);
    if (!isNaN(distance)) {
      try {
        // onCreateBuffer関数を非同期で呼び出し、バッファ作成とGeoServerへのサービス公開を行う
        await onCreateBuffer(tableName, distance, unit, newTableName || `${tableName}_buffer`);
        // 処理が成功したら、成功モーダルを表示
        setShowModal(true);
        // 成功後の追加の処理があればここに記述
        onBufferSuccess(); // 成功時のコールバック関数を呼び出す
      } catch (error) {
        // エラーハンドリング
        console.error('バッファ作成またはサービス公開に失敗しました:', error);
      }
    }
  };

  return (
    <div>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="tableName" className="block text-sm font-medium text-gray-700">入力テーブル名</label>
        <input
          type="text"
          id="tableName"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>
      <div>
        <label htmlFor="bufferDistance" className="block text-sm font-medium text-gray-700">バッファー距離</label>
        <input
          type="text"
          id="bufferDistance"
          value={bufferDistance}
          onChange={(e) => setBufferDistance(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>
      <div>
        <label htmlFor="unit" className="block text-sm font-medium text-gray-700">単位</label>
        <select
          id="unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value as 'meters' | 'kilometers')}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        >
          <option value="meters">メートル</option>
          <option value="kilometers">キロメートル</option>
        </select>
      </div>
      <div>
        <label htmlFor="newTableName" className="block text-sm font-medium text-gray-700">作成するテーブル名</label>
        <input
          type="text"
          id="newTableName"
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          placeholder={`${tableName}_buffer`}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        バッファ作成
      </button>
    </form>
    {showModal && <SuccessModal showModal={showModal} onClose={onClose} onUploadSuccess={onBufferSuccess}/>} {/* モーダルの表示制御 */}
    </div>
  );
};

export default CreateBuffer;