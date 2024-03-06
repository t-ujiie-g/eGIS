'use client';

import type { NextPage } from 'next';
import Head from 'next/head';
import Scene from '../ui/scene/scene';

export default async function Page() {
    return (
        <div>
          <Head>
            <title>3D View</title>
            <meta name="description" content="3D view of the map" />
          </Head>
    
          <main className="h-screen w-full">
            <Scene />
          </main>
        </div>
      );
}