import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { Request, Response } from 'express'
import axios from 'axios'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // axios.defaults.withCredentials = true;


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips out elements that are not defined in our dto
    }),
  );
  app.enableCors(
    {
      credentials: true,
      origin: ["http://" + process.env.HOST + ":9999", "http://" + process.env.HOST + ":3000"],
      // allowedHeaders:"*",
    }
  );

  app.use(cookieParser());
  app.use((req: Request, res: Response, next) => {
    res.header('Access-Control-Allow-Origin','http://' + process.env.HOST + ':9999');
    next();
  });

  await app.listen(3000);
}
bootstrap();
