# eGIS
+ 個人の勉強用のためにWebGISを開発しています。

## 環境構築
+ ※Docker,Docker Composeが導入済みの前提です。

1. Dockerイメージをビルド
```
docker compose build
```

2. コンテナを起動
```
docker compose up
```

3. GeoServerの管理ページから、以下のワークスペースとデータストアを作成
    + 管理ページ
        + http://localhost:8080/geoserver
    + ワークスペース: test_workspace
    + データストア: test_datastore
        + データソース: PostGIS
        + database: egis
        + schema: test_schema

4. フロントエンドのアプリは以下URLでアクセス
    + http://localhost:3000/