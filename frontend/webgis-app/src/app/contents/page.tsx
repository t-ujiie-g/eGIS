'use client';

import React, { useState } from 'react';
import BasicModal from '../ui/basicModal';
import TableList from '../ui/contents/tableList'; // TableList コンポーネントをインポート
import ImportPage from '../ui/contents/importPage';

export default function Page() {
    const [isModalOpen, setModalOpen] = useState(false);
    const [isUploadSuccess, setIsUploadSuccess] = useState(false);

    const handleUploadSuccess = () => {
        setIsUploadSuccess(true);
    };
    const initializeIsUploadSuccess = () => {
        setIsUploadSuccess(false);
    }

    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 my-6 italic">Contents</h1>
            <button 
                onClick={handleOpenModal} 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                データ追加
            </button>
            <BasicModal isOpen={isModalOpen} onClose={handleCloseModal}>
                <ImportPage onClose={handleCloseModal} onUploadSuccess={handleUploadSuccess} initializeIsUploadSuccess={initializeIsUploadSuccess}/>
            </BasicModal>
            <TableList isUploadSuccess={isUploadSuccess}/> {/* TableList コンポーネントを追加 */}
        </div>
    );
}