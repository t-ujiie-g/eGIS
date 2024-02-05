'use client';

import React, { useState } from 'react';
import ImportModal from '../ui/contents/importModal';
import TableList from '../ui/contents/tableList'; // TableList コンポーネントをインポート

export default function Page() {
    const [isModalOpen, setModalOpen] = useState(false);
    const [isUploadSuccess, setIsUploadSuccess] = useState(false);

    const handleUploadSuccess = () => {
        setIsUploadSuccess(true);
    };

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
            <ImportModal isOpen={isModalOpen} onClose={handleCloseModal} onUploadSuccess={handleUploadSuccess}/>
            <TableList isUploadSuccess={isUploadSuccess}/> {/* TableList コンポーネントを追加 */}
        </div>
    );
}