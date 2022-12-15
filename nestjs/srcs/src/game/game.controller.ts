import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GeneralGuard } from 'src/auth/guard/general.guard';
import { GameService } from './game.service';
import { gameInformation, spectateMessage } from './interfaces';
import { Lobby } from './lobby';
import { displayCurrentGamesList, findLobbyById } from './lobby-manager';

@UseGuards(GeneralGuard)
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('list')
  findCurrentGames() {
    const reponse: spectateMessage[] = displayCurrentGamesList();
    return reponse;
  }

  @Get(':id')
  setGameId(@Param() param) {
    const gameExists: Lobby | undefined = findLobbyById(param.id);
    return gameExists === undefined ? false : true;
  }

  @Get(':id/gameMode')
  findGameMode(@Param() param): gameInformation {
    const gameExists: Lobby | undefined = findLobbyById(param.id);
    return {
      player1: gameExists.playerOne.login,
      player2: gameExists.playerTwo.login,
      mode: gameExists.gameMode,
    };
  }
}
