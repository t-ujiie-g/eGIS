import React from 'react';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
  }

  const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }: DeleteConfirmModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-auto bg-smoke-dark flex">
            <div className="relative p-8 bg-white w-full max-w-md m-auto flex-col flex rounded-lg shadow-lg">
                <div className="text-center p-5 flex-auto justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 flex items-center text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01m-6.938 4h13.856C18.502 20 19 19.105 19 18V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12c0 1.105.498 2 1.062 2zM12 8v4m0 4h.01m-6.938 4h13.856C18.502 20 19 19.105 19 18V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12c0 1.105.498 2 1.062 2z" />
                    </svg>
                    <h2 className="text-xl font-bold py-4 ">本当に削除しますか？</h2>
                    <p className="text-sm text-gray-500 px-8">この操作は取り消せません。</p>
                </div>
                <div className="p-3 mt-2 text-center space-x-4 md:block">
                    <button onClick={onClose} className="mb-2 md:mb-0 bg-white px-5 py-2 text-sm shadow-sm font-medium tracking-wider border text-gray-600 rounded-full hover:shadow-lg hover:bg-gray-100">
                        キャンセル
                    </button>
                    <button onClick={onConfirm} className="mb-2 md:mb-0 bg-red-500 border border-red-500 px-5 py-2 text-sm shadow-sm font-medium tracking-wider text-white rounded-full hover:shadow-lg hover:bg-red-600">
                        削除
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;