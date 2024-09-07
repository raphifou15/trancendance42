import { PrismaService } from 'src/prisma/prisma.service';
import { gameMode } from './interfaces';
export declare class GameService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getCurrentGames(): void;
    createGame(gameId: string, mode: gameMode, player1: number, player2: number): Promise<void>;
    updateEndGame(gameId: string, winnerId: number, winnerScore: number, loserScore: number): Promise<void>;
}
