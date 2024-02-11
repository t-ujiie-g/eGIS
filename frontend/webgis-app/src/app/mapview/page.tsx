'use client';

import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';

// SSRを無効にしてMapComponentを動的にインポート
const MapComponent = dynamic(() => import('../ui/mapview/mapComponent'), {
    ssr: false,
  });

const MapPage: NextPage = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isBufferOpen, setBufferOpen] = useState(false);
  const [isBufferSuccess, setIsBufferSuccess] = useState(false);

  const handleBufferSuccess = () => {
    setIsBufferSuccess(true);
  };
  // const initializeIsUploadSuccess = () => {
  //   setIsBufferSuccess(false);
  // }

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const openBufferModal = () => setBufferOpen(true);
  const closeBufferModal = () => setBufferOpen(false);
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 my-2 italic">MapView</h1>
        <MapComponent 
          handleOpenModal={handleOpenModal}
          isOpen={isModalOpen}
          handleCloseModal={handleCloseModal}
          isBufferOpen={isBufferOpen}
          openBufferModal={openBufferModal}
          closeBufferModal={closeBufferModal}
          handleBufferSuccess={handleBufferSuccess}
        />
    </div>
  );
};

export default MapPage;