"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailConfirmationService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const email_service_1 = __importDefault(require("./email.service"));
const user_service_1 = require("../../user/user.service");
const prisma_service_1 = require("../../prisma/prisma.service");
let EmailConfirmationService = class EmailConfirmationService {
    constructor(jwtService, configService, emailService, userService, prisma) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.emailService = emailService;
        this.userService = userService;
        this.prisma = prisma;
    }
    sendVerificationLink(email) {
        const payload = { email };
        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
            expiresIn: `${this.configService.get('JWT_VERIFICATION_TOKEN_EXPIRATION_TIME')}s`
        });
        const url = `${this.configService.get('EMAIL_CONFIRMATION_URL')}?token=${token}`;
        const text = `Welcome back to PONG! To confirm you are the one trying to log in, click here:\n${url}\nIf you are not responsible for this email, you can simply ignore it.`;
        return this.emailService.sendMail({
            to: email,
            subject: 'Email confirmation to play PONG',
            text,
        });
    }
    async decodeConfirmationToken(token) {
        try {
            const payload = await this.jwtService.verify(token, {
                secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
            });
            if (typeof payload === 'object' && 'email' in payload) {
                return payload.email;
            }
            throw new common_1.BadRequestException();
        }
        catch (error) {
            if ((error === null || error === void 0 ? void 0 : error.name) === 'TokenExpiredError') {
                throw new common_1.BadRequestException('Email confirmation token expired');
            }
            throw new common_1.BadRequestException('Bad confirmation token');
        }
    }
    async confirmEmail(email) {
        await this.userService.markEmailAsConfirmed(email);
    }
};
exports.EmailConfirmationService = EmailConfirmationService;
exports.EmailConfirmationService = EmailConfirmationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        email_service_1.default,
        user_service_1.UserService,
        prisma_service_1.PrismaService])
], EmailConfirmationService);
//# sourceMappingURL=emailConfirmation.service.js.map