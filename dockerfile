FROM node:21-alpine3.19

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./


RUN npm install -g npm@10.5.0 \
    && npm config set registry https://registry.npmmirror.com/ \
    && npm ci --no-audit --no-optional --legacy-peer-deps

COPY . .

EXPOSE 3002