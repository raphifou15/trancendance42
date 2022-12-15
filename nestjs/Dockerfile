FROM node:18-alpine3.14

#COPY package*.json ./

RUN npm install -g @nestjs/cli
RUN npm install -g npm@8.12.0


RUN npm install -g @nestjs/websockets @nestjs/platform-socket.io
#RUN	npm i --location=global --save @nestjs/typeorm postgresql

# RUN npm install --save @nestjs/swagger swagger-ui-express

COPY srcs/ /backend

WORKDIR /backend
RUN npm install
# RUN npx prisma migrate dev
ENTRYPOINT ["nest", "start", "dev"]
