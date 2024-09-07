"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const dto_1 = require("./dto");
const dto_2 = require("./dto");
const bcrypt = __importStar(require("bcrypt"));
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const client_1 = require("@prisma/client");
let id_g = -1;
let AuthService = class AuthService {
    constructor(prisma, jwt, config, httpService) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.httpService = httpService;
    }
    async signup(dto) {
        const hash = await bcrypt.hash(dto.password, 10);
        if (id_g > 0) {
            try {
                const user = await this.prisma.user.update({
                    where: {
                        id: id_g,
                    },
                    data: {
                        email: dto.email,
                        login: dto.login,
                        image_url: dto.image_url,
                        hash,
                        gone_through_register: true,
                        is_online: true,
                    },
                });
                const token = (await this.signToken(user.id, user.email)).access_token;
                return token;
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                    if (error.code === 'P2002' && error.meta.target == 'login') {
                        throw new common_1.ForbiddenException('Login taken');
                    }
                    else if (error.code === 'P2002' && error.meta.target == 'email') {
                        throw new common_1.ForbiddenException('Email taken');
                    }
                    else {
                        throw new common_1.ForbiddenException('Credentials taken');
                    }
                }
                else {
                    throw new Error('Could not sign up (auth.service.ts)');
                }
            }
        }
    }
    async signToken(userId, email) {
        const payload = {
            sub: userId,
            email,
        };
        const secret = this.config.get('JWT_SECRET');
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: secret,
        });
        return {
            access_token: token,
        };
    }
    async register(id, login, email, image_extension) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: id,
            },
        });
        if (user) {
            console.log('USER ALREADY EXISTS');
        }
        if (!user) {
            await this.prisma.user.create({
                data: {
                    id: id,
                    login: login,
                    email: email,
                    hash: '',
                    image_url: 'http://' +
                        process.env.HOST +
                        ':3000/uploads/' +
                        login +
                        image_extension,
                    gone_through_login: true,
                },
            });
        }
        id_g = id;
        const token = (await this.signToken(id, email)).access_token;
        return token;
    }
    async get_user() {
        if (id_g === -1) {
            return -1;
        }
        const user = await this.prisma.user.findUnique({
            where: {
                id: id_g,
            },
        });
        if (user)
            return {
                image_url: user.image_url,
                login: user.login,
                email: user.email,
                gone_through_login: user.gone_through_login,
                gone_through_register: user.gone_through_register,
            };
        else
            return -1;
    }
    async get_user_by_id(id) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                friends: true,
            },
        });
        if (user)
            return user;
        return -1;
    }
    async toggleA2f(id) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: Number(id),
            },
        });
        let a2f = user.auth2f_enabled;
        a2f = !a2f;
        const toggle = await this.prisma.user.update({
            where: {
                id: Number(id),
            },
            data: {
                auth2f_enabled: a2f,
            },
        });
        return a2f;
    }
    async change_image_url_from_profile(dto) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: Number(dto.id),
            },
        });
        const res = await this.prisma.user.update({
            where: {
                id: Number(dto.id),
            },
            data: {
                image_url: dto.image_url,
            },
        });
        return user;
    }
    async changeLogin(dto) {
        let user = await this.prisma.user.findUnique({
            where: {
                login: dto.login,
            },
        });
        if (user)
            return user;
        user = await this.prisma.user.findUnique({
            where: {
                id: Number(dto.id),
            },
        });
        const toggle = await this.prisma.user.update({
            where: {
                id: Number(dto.id),
            },
            data: {
                login: dto.login,
            },
        });
        return user;
    }
    async loginexists(login) {
        let user = await this.prisma.user.findUnique({
            where: {
                login: login,
            },
        });
        if (user)
            return true;
        return false;
    }
    async get_user_by_login(login) {
        const user = await this.prisma.user.findUnique({
            where: {
                login: login,
            },
        });
        return user;
    }
    async emailexists(email) {
        let user = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (user)
            return true;
        return false;
    }
    async get_user_by_email(email) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        return user;
    }
    async get_friends_by_id(id) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                friends: true,
            },
        });
        if (user)
            return user.friends;
        return -1;
    }
    async get_all_users() {
        const users = await this.prisma.user.findMany({});
        return users;
    }
    async toggleGoneThroughLoginTrue(id) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: id,
            },
        });
        if (!user) {
            console.log('USER NOT FOUND');
            return;
        }
        const toggle = await this.prisma.user.update({
            where: {
                id: id,
            },
            data: {
                gone_through_login: true,
            },
        });
        return user;
    }
    async toggleGoneThroughLoginFalse(id) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (!user) {
            console.log('USER NOT FOUND');
            return;
        }
        const toggle = await this.prisma.user.update({
            where: {
                id: Number(id),
            },
            data: {
                gone_through_login: false,
            },
        });
        return user;
    }
    async toggleLogin(id) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (user) {
            const toggle = await this.prisma.user.update({
                where: {
                    id: Number(id),
                },
                data: {
                    is_online: true,
                },
            });
            return user;
        }
        return -1;
    }
    async toggleLogout(id) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (user) {
            const toggle = await this.prisma.user.update({
                where: {
                    id: Number(id),
                },
                data: {
                    is_online: false,
                },
            });
            return user;
        }
        return -1;
    }
    async toggleGoneThroughRegisterTrue(id) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (user) {
            const toggle = await this.prisma.user.update({
                where: {
                    id: Number(id),
                },
                data: {
                    gone_through_register: true,
                },
            });
            return user;
        }
        return -1;
    }
    async didUserGoThroughRegister(id) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (user)
            return user.gone_through_register;
        else
            return false;
    }
    async didUserEnabledA2f(id) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (user)
            return user.auth2f_enabled;
        else
            return false;
    }
};
exports.AuthService = AuthService;
__decorate([
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AuthDto]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "signup", null);
__decorate([
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_2.ChangeDto]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "change_image_url_from_profile", null);
__decorate([
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_2.ChangeDto]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "changeLogin", null);
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        axios_1.HttpService])
], AuthService);
//# sourceMappingURL=auth.service.js.map