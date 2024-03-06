import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const Scene: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapContainerRef.current) {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        // 環境変数からAPIキーを読み込む
        style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${process.env.NEXT_PUBLIC_MAP_API_KEY}`,
        // center: [139.767125, 35.681236], // 初期位置（東京駅）
        center: [-74.0066, 40.7135], // ニューヨーク
        zoom: 15.5,
        pitch: 45, // 地図の傾斜角度
        bearing: -17.6, // 地図の回転角度
        antialias: true, // アンチエイリアスを有効にする
      });

      map.on('load', () => {
        // レイヤーの下に挿入する
        const layers = map.getStyle().layers;
        let labelLayerId;
        for (let i = 0; i < layers.length; i++) {
            if (layers[i].type === 'symbol' && layers[i].layout && (layers[i].layout as any)['text-field']) {
                labelLayerId = layers[i].id;
                break;
            }
        }

        // ソースを追加
        map.addSource('openmaptiles', {
            type: 'vector',
            url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${process.env.NEXT_PUBLIC_MAP_API_KEY}`
          });

        map.addLayer({
            'id': '3d-buildings',
            'source': 'openmaptiles',
            'source-layer': 'building',
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
                'fill-extrusion-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'render_height'], 0, 'lightgray', 200, 'royalblue', 400, 'lightblue'
                ],
                'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    16,
                    ['get', 'render_height']
                ],
                'fill-extrusion-base': ['case',
                    ['>=', ['get', 'zoom'], 16],
                    ['get', 'render_min_height'], 0
                ]
            }
        }, labelLayerId);
      });

      return () => map.remove();
    }
  }, []);

  return <div ref={mapContainerRef} className="h-full w-full" />;
};

export default Scene;