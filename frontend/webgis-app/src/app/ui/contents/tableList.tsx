import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrashIcon } from '@heroicons/react/24/outline';
import DeleteConfirmModal from './deleteConfirmModal';
import { API_URL, DB_SCHEMA } from './config';

interface TableListProps {
    isUploadSuccess: boolean;
  }

  const TableList = ({ isUploadSuccess }: TableListProps) => {
    const [tables, setTables] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const getTabletApiUrl = `${API_URL}/tables/${DB_SCHEMA}`;
                const response = await axios.get(getTabletApiUrl);
                console.log(response);
                setTables(response.data.tables);
            } catch (error) {
                console.error('テーブルの取得に失敗しました', error);
            }
        };

        fetchTables();
    }, [isUploadSuccess]);

    // 削除ボタンのハンドラ
    const handleDelete = (tableName: string) => {
        setSelectedTable(tableName);
        setIsModalOpen(true);
    };

    // モーダルで削除を確認した後の処理
    const confirmDelete = async () => {
        try {
            const deleteApiUrl = `${API_URL}/table/${DB_SCHEMA}/${selectedTable}`;
            await axios.delete(deleteApiUrl);
            setTables(tables.filter(table => table !== selectedTable)); // 削除されたテーブルをリストから除去
            setIsModalOpen(false); // モーダルを閉じる
        } catch (error) {
            console.error('テーブルの削除に失敗しました', error);
            setIsModalOpen(false); // エラーが発生してもモーダルを閉じる
        }
    };

    return (
        <div className="m-8">
            <h2 className="text-xl font-bold mb-4">テーブル一覧</h2>
            <div className="overflow-x-auto">
                <table className="table-auto w-full">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left" colSpan={2}>テーブル名</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {tables.map((table, index) => (
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap">{table}</td>
                                <td className="py-3 px-6 text-right">
                                    <button onClick={() => handleDelete(table)} className="text-red-500 hover:text-red-700">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <DeleteConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={confirmDelete} />
        </div>
    );
};

export default TableList;