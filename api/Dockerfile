FROM python:3.11

WORKDIR /app
COPY requirements.txt ./
COPY wait-for-it.sh ./

RUN apt-get update
RUN apt-get install -y gdal-bin libgdal-dev netcat-openbsd
RUN pip install --upgrade pip
RUN pip install -r requirements.txt --no-cache

# RUN apt-get install -y graphviz
# RUN apt-get install -y netcat-openbsd