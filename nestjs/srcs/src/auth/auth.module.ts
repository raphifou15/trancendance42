import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy';
import { FortyTwoStrategy } from './strategy/ft.strategy';
import { ConfigModule } from '@nestjs/config';
import { getEnvPath } from '../env.helper';
import { HttpModule } from '@nestjs/axios';
import { EmailConfirmationService } from './twofactor/emailConfirmation.service';
import EmailService from './twofactor/email.service';
import { MulterModule } from '@nestjs/platform-express';
import { UserService } from '../user/user.service';
import { EmailConfirmationController } from './twofactor/emailConfirmation.controller';

const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);


@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '30d'
      }
    }),
    ConfigModule.forRoot({ envFilePath, isGlobal: true }),
    HttpModule,
  ],
  controllers: [AuthController, EmailConfirmationController],
  providers: [AuthService, JwtStrategy, FortyTwoStrategy, EmailService, EmailConfirmationService, UserService],  // EmailService is about our email address in general (for newsletter for instance)
  exports: [AuthService, EmailService, EmailConfirmationService]                                    // EmailConfirmationService is specifically about handling the confirmation email
})

export class AuthModule {}