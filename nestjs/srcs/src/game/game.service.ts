import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { gameMode } from './interfaces';

// many to many explicite

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}
  //use it to store data in db

  getCurrentGames() {}

  //front renvoie un id
  async createGame(
    gameId: string,
    mode: gameMode,
    player1: number,
    player2: number,
  ) {
    //get players
    const userOne = await this.prisma.user.findUnique({
      where: {
        id: player1,
      },
    }); //double it for two players

    const userTwo = await this.prisma.user.findUnique({
      where: {
        id: player2,
      },
    });

    const dbGameMode: string =
      mode === gameMode.classic ? 'classic' : 'brickwall';

    await this.prisma.game.create({
      data: {
        gameId: gameId,
        gameMode: dbGameMode,
        player1: { connect: { id: userOne.id } },
        player2: { connect: { id: userTwo.id } },
      },
    });

    //need to handle gameMode
  }

  async updateEndGame(
    gameId: string,
    winnerId: number,
    winnerScore: number,
    loserScore: number,
  ) {
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
}
