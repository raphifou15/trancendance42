import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import EmailService from './email.service';
import { UserService } from '../../user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class EmailConfirmationService {
    private readonly jwtService;
    private readonly configService;
    private readonly emailService;
    private readonly userService;
    private readonly prisma;
    constructor(jwtService: JwtService, configService: ConfigService, emailService: EmailService, userService: UserService, prisma: PrismaService);
    sendVerificationLink(email: string): any;
    decodeConfirmationToken(token: string): Promise<any>;
    confirmEmail(email: string): Promise<void>;
}
