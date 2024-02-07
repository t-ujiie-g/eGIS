import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, DB_SCHEMA } from '../config';
import { PlusIcon } from '@heroicons/react/24/outline';

// テーブル名を取得する関数
const fetchTableNames = async () => {
  try {
    const getTableApiUrl = `${API_URL}/tables/${DB_SCHEMA}`;
    const response = await axios.get(getTableApiUrl);
    return response.data.tables; // テーブル名のリストを返す
  } catch (error) {
    console.error('テーブル名の取得に失敗しました', error);
    return []; // エラーが発生した場合は空のリストを返す
  }
};

interface AddLayerProps {
  addWmsLayer: (layerName: string) => void;
}

const AddLayer: React.FC<AddLayerProps> = ({ addWmsLayer }) => {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    const loadTables = async () => {
      const fetchedTables = await fetchTableNames();
      setTables(fetchedTables);
    };
    loadTables();
  }, []);

  return (
      // <div className="overflow-y-auto max-h-96">
      //   <ul>
      //     {tables.map((table, index) => (
      //       <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-100">
      //         <span>{table}</span>
      //         <button
      //           // onClick={() => onAdd(table)}
      //           className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      //         >
      //           追加
      //         </button>
      //       </li>
      //     ))}
      //   </ul>
      // </div>

      <div className="m-8">
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
                                <button onClick={() => addWmsLayer(table)} className="text-red-500 hover:text-red-700">
                                    <PlusIcon className="h-5 w-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
  );
};

export default AddLayer;