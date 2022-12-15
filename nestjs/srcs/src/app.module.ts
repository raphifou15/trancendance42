import {
  applyDecorators,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';

import * as Joi from '@hapi/joi';
import { MulterModule } from '@nestjs/platform-express';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core/constants';
import { JwtGuard } from './auth/guard/jwt.guard';

@Module({
  imports: [
    GameModule,
    AuthModule,
    UserModule,
    ChatModule,
    PrismaModule,

    ThrottlerModule.forRoot({
      ttl: 5,
      limit: 800,
    }),

    MulterModule.register({ dest: './uploads' }),
    // MulterModule.registerAsync({
    //   useFactory: () => ({
    //     dest: './uploads',
    //   }),
    // }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        EMAIL_SERVICE: Joi.string().required(),
        EMAIL_HOST: Joi.string().required(),
        EMAIL_USER: Joi.string().required(),
        EMAIL_PASSWORD: Joi.string().required(),
        JWT_VERIFICATION_TOKEN_SECRET: Joi.string().required(), // get new env variables to connect
        JWT_VERIFICATION_TOKEN_EXPIRATION_TIME: Joi.string().required(), // to our email address
        EMAIL_CONFIRMATION_URL: Joi.string().required(), // and send emails
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtGuard,
    // },
  ],
})
export class AppModule implements NestModule {
  configure() {}
}
