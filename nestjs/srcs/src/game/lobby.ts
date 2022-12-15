import { v4 } from 'uuid';
import { Socket } from 'socket.io';
import {
  brickwallGameState,
  gameMode,
  gamePlayer,
  gameState,
  spectator,
} from './interfaces';
import { Logger } from '@nestjs/common';
import { GameEvent } from './gameEvent';
import { brickwallGame } from './game-engine';
import {
  addToCurrentGameList,
  currentGameList,
  removeFromCurrentGameList,
} from './lobby-manager';
import { GameService } from './game.service';
import { UserService } from 'src/user/user.service';

export class Lobby {
  // generate a universally unique identifier
  public logger: Logger = new Logger('Lobby');
  public id: string;
  public readonly createdAt: Date = new Date();
  // public classicGame : classicGame(this)

  public playerOne: gamePlayer;
  public playerTwo: gamePlayer;

  public playerNb: number;
  public gameMode: gameMode;
  public game: brickwallGame;

  public spectatorList: Array<Socket>;

  constructor(
    gameMode: gameMode,
    private readonly gameService: GameService,
    private readonly userService: UserService,
  ) {
    this.id = v4();

    this.playerOne = null;
    this.playerTwo = null;

    this.playerNb = 0;

    this.gameMode = gameMode;
    this.game = new brickwallGame();

    this.spectatorList = new Array<Socket>();
  }

  public addSpectator(spectator: Socket) {
    const alreadySpectating: Socket | undefined = this.spectatorList.find(
      (value) => value.id == spectator.id,
    );

    if (alreadySpectating === undefined) this.spectatorList.push(spectator);
  }

  public clearSpectator() {
    this.spectatorList.splice(0, this.spectatorList.length);
  }

  public addClient(player: gamePlayer): boolean {
    if (this.playerNb < 2 && this.gameMode === player.gameMode) {
      // add player 1
      if (this.playerOne === null || player.socket === this.playerOne.socket) {
         console.log("1 PLAYER ID"  + player.id)
        this.id = v4();

        this.playerOne = player;
        this.playerNb += 1;
        return true;
      } else {
        console.log("2 PLAYER ID" + this.playerOne.id + " " + player.id)
        if (this.playerOne.socket !== player.socket && this.playerOne.id !== player.id) {
          // add player 2
          this.playerTwo = player;

          this.playerOne.socket?.emit(GameEvent.Start, {
            playerPosition: 'left',
            gameId: this.id,
          });
          this.playerTwo.socket?.emit(GameEvent.Start, {
            playerPosition: 'right',
            gameId: this.id,
          });

          this.gameService.createGame(
            this.id,
            this.gameMode,
            this.playerOne.id,
            this.playerTwo.id,
          );

          this.userService.changeInGameState(this.playerOne.id, true);
          this.userService.changeInGameState(this.playerTwo.id, true);

          // this.userService.

          if (this.gameMode === 0) this.game.classic.startGame();
          else this.game.startGame();
          //could run game here
          this.playerNb += 1;
          addToCurrentGameList(this);
          return true;
        }
      }
    }
    return false;
  }

  public clientIsInTheGame(client: Socket): boolean {
    if (client === this.playerOne.socket || client === this.playerTwo.socket) {
      return true;
    } else {
      return false;
    }
  }

  public handleClientMessage(client: Socket, payload: string) {
    if (payload === 'up' || payload === 'down') {
      this.updatePlayerMovement(client, payload);
    } else if (payload === GameEvent.Pause) {
      this.game.stopGame();
    }
  }

  public updatePlayerMovement(client: Socket, movement: string) {
    if (client === this.playerOne.socket) {
      this.game.classic.updateRacketPosition(
        this.game.classic.leftRacket,
        movement,
      );
    } else if (client === this.playerTwo.socket) {
      this.game.classic.updateRacketPosition(
        this.game.classic.rightRacket,
        movement,
      );
    }
  }

  public removeClient(client: Socket) {
    if (client === this.playerOne.socket) this.playerOne = null;
    else if (client === this.playerTwo.socket) this.playerTwo = null;
    if (this.playerNb != 0) this.playerNb -= 1;
  }

  public getLobbyGameMode() {
    return this.gameMode;
  }

  public displayGameState(): gameState | brickwallGameState {
    if (this.game.classic.checkWinningCondition()) {
      //handle end game operations

      this.handleGameEnd();
    }
    if (this.gameMode === gameMode.classic) {
      return this.game.classic.dispatchGameState();
    } else {
      return this.game.dispatchGameState();
    }
  }

  public handleGameEnd() {
    const player1wins: boolean =
      this.game.classic.EndScore === this.game.classic.gameScore.player1
        ? true
        : false;

    const winner: gamePlayer = player1wins ? this.playerOne : this.playerTwo;
    const winnerScore: number = player1wins
      ? this.game.classic.gameScore.player1
      : this.game.classic.gameScore.player2;
    const loser: gamePlayer = player1wins ? this.playerTwo : this.playerOne;
    const loserScore: number = player1wins
      ? this.game.classic.gameScore.player2
      : this.game.classic.gameScore.player1;

    this.gameService.updateEndGame(this.id, winner.id, winnerScore, loserScore);
    this.userService.add_winner(winner);
    this.userService.add_loser(loser);

    this.playerOne.socket?.emit(GameEvent.End, {
      winner: winner.login,
      score: this.game.classic.gameScore,
    });
    this.playerTwo.socket?.emit(GameEvent.End, {
      winner: winner.login,
      score: this.game.classic.gameScore,
    });

    this.userService.changeInGameState(this.playerOne.id, false);
    this.userService.changeInGameState(this.playerTwo.id, false);

    this.game.reset();

    this.spectatorList.forEach((value) => {
      value.emit(GameEvent.End);
    });

    removeFromCurrentGameList(this);
  }
}
