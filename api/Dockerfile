FROM python:3.11

# 作業ディレクトリの設定
WORKDIR /app

# 必要なファイルのコピー
COPY requirements.txt ./
COPY wait-for-it.sh ./

# GDALとnetcatのインストール
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    netcat-openbsd \
    # OpenJDK 11のインストール
    openjdk-17-jre-headless \
    # wgetのインストール（Importer/Exporterのダウンロードに使用）
    wget \
    # unzipのインストール（Importer/Exporterの解凍に使用）
    unzip \
 && rm -rf /var/lib/apt/lists/*

# pipのアップグレードとPython依存関係のインストール
RUN pip install --upgrade pip && \
    pip install -r requirements.txt --no-cache

# 3DCityDB Importer/Exporterのダウンロードと解凍
RUN wget https://github.com/3dcitydb/importer-exporter/releases/download/v5.4.2/3DCityDB-Importer-Exporter-5.4.2.zip \
    && unzip 3DCityDB-Importer-Exporter-5.4.2.zip -d /opt/ \
    && rm 3DCityDB-Importer-Exporter-5.4.2.zip

# 環境変数JAVA_OPTSの設定（必要に応じて）
ENV JAVA_OPTS="-Xms1G -Xmx4G"

# Importer/Exporterの実行スクリプトへのパスを環境変数に設定
ENV IMPEXP_HOME=/opt/3DCityDB-Importer-Exporter-5.4.2
ENV PATH="${IMPEXP_HOME}/bin:${PATH}"
