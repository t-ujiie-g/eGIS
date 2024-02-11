import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid'; // Heroiconsをインポート

// propsの型を定義
interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode; // この行を追加
    // onUploadSuccess: () => void;
    // initializeIsUploadSuccess: () => void;
}

const BasicModal: React.FC<ImportModalProps> = ({ isOpen, onClose, children}) => {
    if (!isOpen) return null;

    return (
        // モーダルの背景を追加し、触れないようにする（Tailwind CSSを使用）
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
            {/* モーダルのコンテンツ */}
            <div className="bg-white p-5 z-50 min-w-[500px] relative">
                {/* 閉じるボタン（Heroiconを使用） */}
                <button onClick={onClose} className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                {children}
                {/* <ImportPage onClose={onClose} onUploadSuccess={onUploadSuccess}/> */}
            </div>
        </div>
    );
};

export default BasicModal;