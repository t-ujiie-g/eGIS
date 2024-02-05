import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { API_URL, DB_SCHEMA } from './config';
import SuccessModal from './successModal';


interface ImportPageProps {
    onClose: () => void;
    onUploadSuccess: () => void;
}

export const ImportPage: React.FC<ImportPageProps> = ({ onClose, onUploadSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [tableName, setTableName] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false); // モーダル表示状態の管理

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const selectedFile = event.target.files[0];
            setFile(selectedFile);
            // ファイル名から拡張子を除いた部分をテーブル名として設定
            const fileNameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, "");
            setTableName(fileNameWithoutExtension);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!file) {
            setMessage('ファイルが選択されていません。');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        // フォームからファイル形式を取得
        const fileTypeElement = document.querySelector('select');
        const fileType = fileTypeElement ? fileTypeElement.value : 'geojson'; // デフォルト値を設定
        // ファイル形式に基づいてAPIのURLを変更
        const apiUrlSegment = fileType === 'shapefile' ? 'import_shapefile' : 'import_geojson';

        try {
            // APIのURLにファイル形式とテーブル名を動的に設定
            const importApiUrl = `${API_URL}/${apiUrlSegment}/${DB_SCHEMA}/${tableName}`;
            console.log(importApiUrl);
            const response = await axios.post(importApiUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage(response.data.message);
            setShowModal(true); // アップロード成功時にモーダルを表示
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setMessage(error.response.data.detail || 'エラーが発生しました。');
            } else {
                setMessage('エラーが発生しました。');
            }
        }
    };

    return (
        <div className="max-w-lg mx-auto my-10 p-5 border rounded shadow-lg">
            <h1 className="text-xl font-bold mb-4">データインポート</h1>
            <p className="mb-4">インポートしたいファイルを選択してください。</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">ファイル形式を選択してください</label>
                    <select className="block w-full p-2 text-sm text-gray-900 bg-gray-50 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                        <option value="geojson">GeoJSON</option>
                        <option value="shapefile">シェープファイル</option>
                    </select>
                </div>
                <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"/>
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">テーブル名</label>
                    <input type="text" value={tableName} onChange={(e) => setTableName(e.target.value)} className="block w-full p-2 text-sm text-gray-900 bg-gray-50 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <button type="submit" className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded">アップロード</button>
            </form>
            {message && <p className="mt-3 text-blue-500">{message}</p>}
            {showModal && <SuccessModal showModal={showModal} onClose={onClose} onUploadSuccess={onUploadSuccess}/>} {/* モーダルの表示制御 */}
        </div>
    );
}

export default ImportPage;