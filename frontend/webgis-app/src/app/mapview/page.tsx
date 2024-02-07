'use client';

import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import AddModal from '../ui/mapview/addModal';

// SSRを無効にしてMapComponentを動的にインポート
const MapComponent = dynamic(() => import('../ui/mapview/mapComponent'), {
    ssr: false,
  });

const MapPage: NextPage = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isUploadSuccess, setIsUploadSuccess] = useState(false);

  // const addWmsLayer = (layerName: string) => {

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
      <h1 className="text-3xl font-bold text-gray-800 my-4 italic">MapView</h1>
        <MapComponent handleOpenModal={handleOpenModal} isOpen={isModalOpen} handleCloseModal={handleCloseModal}/>
    </div>
  );
};

export default MapPage;