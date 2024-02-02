# ./frontend/Dockerfile
FROM node:21

# アプリケーションディレクトリを作成
WORKDIR /app

# アプリケーションの依存関係をインストール
COPY webgis-app/package*.json ./
RUN npm install

# アプリケーションのソースをバンドル
COPY webgis-app/ ./

# アプリケーションをビルド
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
