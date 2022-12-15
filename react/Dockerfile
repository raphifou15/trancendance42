FROM node:alpine
#FROM node:16.15.0-alpine3.14
RUN apk add bash
#RUN npm -v
RUN npm install -g npm@8.11.0
#mettre 8.12.1
#COPY entrypoint.sh .
WORKDIR /frontend
ENTRYPOINT ["npm", "start"]
