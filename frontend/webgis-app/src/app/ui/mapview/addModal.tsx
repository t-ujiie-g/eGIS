import React from 'react';
import AddLayer from './addLayer'; // ImportPageコンポーネントのパスを適切に設定
import { XMarkIcon } from '@heroicons/react/24/solid'; // Heroiconsをインポート

// propsの型を定義
interface AddModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode; // この行を追加
}

const AddModal: React.FC<AddModalProps> = ({ isOpen, onClose, children }) => { // addWmsLayerを削除し、childrenを追加
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
            <div className="bg-white p-5 z-50 relative w-1/2">
                <button onClick={onClose} className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                {children}
            </div>
        </div>
    );
};

export default AddModal;