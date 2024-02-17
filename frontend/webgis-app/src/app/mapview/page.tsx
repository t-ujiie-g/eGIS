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
  const [isClipOpen, setClipOpen] = useState(false);
  const [isClipSuccess, setIsClipSuccess] = useState(false);
  const [isEraseOpen, setEraseOpen] = useState(false);
  const [isEraseSuccess, setIsEraseSuccess] = useState(false);

  const handleBufferSuccess = () => {
    setIsBufferSuccess(true);
  };
  const handleClipSuccess = () => {
    setIsClipSuccess(true);
  };
  const handleEraseSuccess = () => {
    setIsEraseSuccess(true);
  };

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const openBufferModal = () => setBufferOpen(true);
  const closeBufferModal = () => setBufferOpen(false);
  const openClipModal = () => setClipOpen(true);
  const closeClipModal = () => setClipOpen(false);
  const openEraseModal = () => setEraseOpen(true);
  const closeEraseModal = () => setEraseOpen(false);
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
          isClipOpen={isClipOpen}
          openClipModal={openClipModal}
          closeClipModal={closeClipModal}
          handleClipSuccess={handleClipSuccess}
          isEraseOpen={isEraseOpen}
          openEraseModal={openEraseModal}
          closeEraseModal={closeEraseModal}
          handleEraseSuccess={handleEraseSuccess}
        />
    </div>
  );
};

export default MapPage;