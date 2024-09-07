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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const interfaces_1 = require("./interfaces");
let GameService = class GameService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getCurrentGames() { }
    async createGame(gameId, mode, player1, player2) {
        const userOne = await this.prisma.user.findUnique({
            where: {
                id: player1,
            },
        });
        const userTwo = await this.prisma.user.findUnique({
            where: {
                id: player2,
            },
        });
        const dbGameMode = mode === interfaces_1.gameMode.classic ? 'classic' : 'brickwall';
        await this.prisma.game.create({
            data: {
                gameId: gameId,
                gameMode: dbGameMode,
                player1: { connect: { id: userOne.id } },
                player2: { connect: { id: userTwo.id } },
            },
        });
    }
    async updateEndGame(gameId, winnerId, winnerScore, loserScore) {
        await this.prisma.game.update({
            where: {
                gameId: gameId,
            },
            data: {
                winnerId: winnerId,
                score_winner: winnerScore,
                score_loser: loserScore,
            },
        });
    }
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GameService);
//# sourceMappingURL=game.service.js.map