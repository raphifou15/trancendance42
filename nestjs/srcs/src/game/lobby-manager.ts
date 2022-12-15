import { Logger } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { GameService } from './game.service';
import { gameMode, gamePlayer, spectateMessage } from './interfaces';
import { Lobby } from './lobby';

export const currentGameList: Array<Lobby> = new Array();

export function addToCurrentGameList(lobby: Lobby) {
  currentGameList.push(lobby);
}

export function removeFromCurrentGameList(lobby: Lobby) {
  const index: number = currentGameList.findIndex(
    (value) => value.id === lobby.id,
  );
  if (index !== -1) currentGameList.splice(index, 1);
}

export function findLobbyById(id: string): Lobby | undefined {
  return currentGameList.find((value) => {
    return value.id === id;
  });
}

export function isPlayerInGame(id: number): boolean {
  return (
    currentGameList.find(
      (value) => value.playerOne.id === id || value.playerTwo.id === id,
    ) !== undefined
  );
}

export function displayCurrentGamesList(): spectateMessage[] {
  let reponse: spectateMessage[] = currentGameList.map((value) => {
    const message: spectateMessage = {
      matchmakingTitle:
        value.playerOne?.login + ' versus ' + value.playerTwo?.login,
      gameId: value.id,
    };
    return message;
  });
  return reponse;
}

export function findSocketIdInGameList(socketId: string) {
  return currentGameList.find((value) => {
    return (
      value.playerOne.socket?.id === socketId ||
      value.playerTwo.socket?.id === socketId
    );
  });
}

export class LobbyManager {
  constructor(
    private readonly gameService: GameService,
    private readonly userService: UserService,
  ) {}

  logger: Logger = new Logger('LobbyManager');

  private waitingLobbies: Array<Lobby> = new Array<Lobby>();

  //REFACTO THIS MESS

  getGameModeLobbies(mode: gameMode): Array<Lobby> | undefined {
    return this.waitingLobbies.filter((value) => {
      return value.gameMode === mode;
    });
  }

  getPlayerIdLobby(id: number): Lobby | undefined {
    return this.waitingLobbies.find((value) => {
      return value.playerOne?.id === id || value.playerTwo?.id === id;
    });
  }

  /*
    in the front player may select a gameMode once or more
    we want to take the last request and either 
        pair the player with an available lobby in the waiting queue or 
        create a new waiting lobby


    in the back, we need to check if the current player is not already in a lobby
    if he is in a lobby, update gameMode and player information (he could have changed socket id for example)
    if he is not in a lobby, find a lobby that has the same gameMode
      if possible, add the current player to it
      if no lobby are available, create a new lobby

  */

  handleNewPlayer(player: gamePlayer) {
    const playerInWaitingLobbies = this.waitingLobbies.filter((value) => {
      return (
        value.playerOne?.id === player.id || value.playerTwo?.id === player.id
      );
    });
    if (playerInWaitingLobbies.length) {
      playerInWaitingLobbies.forEach((value) => {
        if (value.playerOne.id === player.id) value.playerOne = null;
        else if (value.playerTwo.id === player.id) value.playerTwo = null;
      });
    }
    // const lobby: Lobby | undefined = this.getPlayerIdLobby(player.id);
    // if (lobby !== undefined) {
    //   if (lobby.gameMode !== player.gameMode) {
    //     lobby.gameMode = player.gameMode;
    //     //refreshes player data
    //     if (lobby.playerOne.id === player.id) lobby.playerOne = null;
    //     else if (lobby.playerTwo.id === player.id) lobby.playerTwo = null;
    //   }
    //   //lobby found
    // }
    //else {
    const sameModeLobbies: Array<Lobby> = this.getGameModeLobbies(
      player.gameMode,
    );
    if (sameModeLobbies.length) {
      let firstAvailableLobby: Lobby | undefined = this.waitingLobbies.find(
        (value) => {
          return value.playerOne === null || value.playerTwo === null;
        },
      );
      if (firstAvailableLobby !== undefined) {
        firstAvailableLobby.addClient(player);
        const index: number = this.waitingLobbies.findIndex(
          (value) => value.id === firstAvailableLobby.id,
        );
        if (index !== -1) this.waitingLobbies.splice(index, 1);
      } else throw new Error('this case should not happen');
    } else {
      let newLobby: Lobby = new Lobby(
        player.gameMode,
        this.gameService,
        this.userService,
      );
      newLobby.addClient(player);
      this.waitingLobbies.push(newLobby);
    }
  }
  // }
}

/*

matchmaking logic

We store a list of socket id to know who is currently looking for a game
We store a map of Lobby to handle many games at the same time : key is game id, value is lobby

A user clicks on the button and sends a gameConnection to the gateway
Server first checks if id exists in the list, 
    if it does, it means that a player has already asked to play a game, we should ignore it
    if not, it adds it

Lobby manager then adds the id to the last Map,
    if there are two users in the lobby, game starts.
    else nothing happens

When the game is finished, LobbyManager removes the two ids from the list

*/
