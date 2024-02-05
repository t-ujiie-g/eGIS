import React from 'react';

interface SuccessModalProps {
    showModal: boolean;
    onClose: () => void;
    onUploadSuccess: () => void; // アップロード成功時のコールバック関数を追加
}

const SuccessModal: React.FC<SuccessModalProps> = ({ showModal, onClose, onUploadSuccess }) => {
    if (!showModal) return null;
    const handleClose = () => {
        onUploadSuccess(); // アップロード成功時の処理を呼び出す
        onClose(); // モーダルを閉じる
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-gray-800 bg-opacity-50 flex justify-center items-center h-full w-full">
            <div className="relative p-5 bg-white w-full max-w-md m-auto rounded-xl shadow-lg">
                <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xl font-semibold py-4">アップロード成功</h2>
                    <p className="text-gray-600">アップロードが正常に終了しました。</p>
                    <div className="flex justify-center mt-4">
                    <button onClick={handleClose} className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-lg transition duration-300 ease-in-out">OK</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;