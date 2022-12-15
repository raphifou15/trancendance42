import { Module } from '@nestjs/common';
import EmailService from './email.service';
import { ConfigModule } from '@nestjs/config';
import { EmailConfirmationService } from './emailConfirmation.service';
import { UserService } from 'src/user/user.service';
 
@Module({
    imports: [ConfigModule],
    controllers: [],
    providers: [EmailService, EmailConfirmationService, UserService],
    exports: [EmailService, EmailConfirmationService]
})

export class EmailModule {}
