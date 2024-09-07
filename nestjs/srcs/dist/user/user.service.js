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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const friend_dto_1 = require("../auth/dto/friend.dto");
const prisma_service_1 = require("../prisma/prisma.service");
let UserService = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id: Number(id) },
        });
        if (user) {
            return user;
        }
    }
    async getUsernameWithId(id) {
        const user = await this.prisma.user.findUnique({
            where: { id: Number(id) },
        });
        if (user) {
            return user.login;
        }
    }
    async getHashLength(id) {
        const user = await this.prisma.user.findUnique({
            where: { id: Number(id) },
        });
        if (user) {
            return user.hash.length;
        }
        return -1;
    }
    async changeInGameState(id, state) {
        await this.prisma.user.update({
            where: { id: Number(id) },
            data: {
                is_ongame: state,
            },
        });
    }
    async isEmailConfirmed(email) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (user.email_is_ok)
            return true;
        return false;
    }
    async markEmailAsConfirmed(email) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (!user.email_is_ok) {
            await this.prisma.user.update({
                where: {
                    email: email,
                },
                data: {
                    email_is_ok: true,
                    is_online: true,
                },
            });
        }
        return user;
    }
    async get_ten_best_players() {
        const best_players = await this.prisma.user.findMany({
            orderBy: [
                {
                    victories: 'desc',
                },
                {
                    defeats: 'asc',
                },
            ],
            take: 10,
        });
        return best_players;
    }
    async get_ten_last_games(id) {
        const last_games = await this.prisma.game.findMany({
            where: {
                OR: [
                    {
                        player1Id: Number(id),
                    },
                    {
                        player2Id: Number(id),
                    },
                ],
            },
            select: {
                winnerId: true,
                player1: {
                    select: {
                        login: true,
                    },
                },
                player2: {
                    select: {
                        login: true,
                    },
                },
            },
            orderBy: [
                {
                    createdAt: 'desc',
                },
            ],
            take: 10,
        });
        return last_games;
    }
    async add_friend(dto) {
        const user = await this.prisma.user.update({
            where: {
                id: dto.my_id,
            },
            data: {
                friends: {
                    connect: {
                        id: dto.friends_id,
                    },
                },
            },
        });
    }
    async delete_friend(dto) {
        const user = await this.prisma.user.update({
            where: {
                id: dto.my_id,
            },
            data: {
                friends: {
                    disconnect: {
                        id: dto.friends_id,
                    },
                },
            },
        });
    }
    async add_winner(user) {
        await this.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                nb_of_games: { increment: 1 },
                victories: { increment: 1 },
            },
        });
    }
    async add_loser(user) {
        await this.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                nb_of_games: { increment: 1 },
                defeats: { increment: 1 },
            },
        });
    }
};
exports.UserService = UserService;
__decorate([
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [friend_dto_1.FriendDto]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "add_friend", null);
__decorate([
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [friend_dto_1.FriendDto]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "delete_friend", null);
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map