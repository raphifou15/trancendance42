import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import VerificationTokenPayload from './verificationTokenPayload.interface';
import EmailService from './email.service';
import { UserService } from '../../user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EmailConfirmationService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly emailService: EmailService,
        private readonly userService: UserService,
        private readonly prisma: PrismaService,
    ) {}
 
    public sendVerificationLink(email: string) {

        const payload: VerificationTokenPayload = { email };                // verificationTokenPayload interface containing the email address

        const token = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
        expiresIn: `${this.configService.get('JWT_VERIFICATION_TOKEN_EXPIRATION_TIME')}s`
        });                                                                                 // produces a specific token
    
        const url = `${this.configService.get('EMAIL_CONFIRMATION_URL')}?token=${token}`;   // token gets append to the confirmation url
    
        const text = `Welcome back to PONG! To confirm you are the one trying to log in, click here:\n${url}\nIf you are not responsible for this email, you can simply ignore it.`;  // text sent with the new long URL the user has to click on to confirm their email address
    
        return this.emailService.sendMail({             // sending the email through the emailService
            to: email,
            subject: 'Email confirmation to play PONG',
            text,
        })
    }

    public async decodeConfirmationToken(token: string) {
        try {
            // console.log("IN DECODE CONFIRMATION TOKEN (emailConfirmation.service.ts)");
            const payload = await this.jwtService.verify(token, {
                secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
            });
            if (typeof payload === 'object' && 'email' in payload) {
                return payload.email;
            }
            throw new BadRequestException();
        } catch (error) {
            if (error?.name === 'TokenExpiredError') {
                throw new BadRequestException('Email confirmation token expired');
            }
            throw new BadRequestException('Bad confirmation token');
        }
    }

    public async confirmEmail(email: string) {
        await this.userService.markEmailAsConfirmed(email);
    }
}