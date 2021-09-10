FROM node:12.19.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

RUN npm install -g serve