import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  brickwallGameState,
  gameInformation,
  gameMode,
  gamePlayer,
  gameState,
} from './interfaces';
import { GameEvent } from './gameEvent';
import { Lobby } from './lobby';
import {
  findLobbyById,
  findSocketIdInGameList,
  LobbyManager,
  isPlayerInGame,
} from './lobby-manager';
import { GameService } from './game.service';
import { UserService } from 'src/user/user.service';

export interface playerGameSetup {
  mode: gameMode;
  id: number;
}

interface playerInfo  {
  gameId:string;
  playerId:number
}

// Implementing a game lobby following this article
// https://francois-steinel.fr/articles/build-lobby-based-online-multiplayer-browser-games-with-react-and-nodejs

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'pong' })
// @UseGuards(wsThrottlerGuard)
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly gameService: GameService,
    private readonly userService: UserService,
  ) {}

  @WebSocketServer() server: Server = new Server();
  private readonly logger: Logger = new Logger('PongGateway');
  private lobbyManager: LobbyManager;

  private customGameWaitingList: Array<Lobby> = new Array();

  afterInit(server: any) {
    this.lobbyManager = new LobbyManager(this.gameService, this.userService);
  }

  @SubscribeMessage('PlayerMovement')
  onPlayerMovement(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { gameId: string; movement: string },
  ) {
    const Lobby: Lobby | undefined = findLobbyById(payload.gameId);
    if (Lobby !== undefined)
      Lobby.handleClientMessage(client, payload.movement);
  }

  @SubscribeMessage('gameInvitationAccepted')
  async acceptCustomGameInvitation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    gameInfo: { player2id: number; gameId: string; player2accepts: boolean },
  ) {
    const customGame: Lobby | undefined = this.customGameWaitingList.find(
      (value) => value.id === gameInfo.gameId,
    );
    if (customGame !== undefined) {
      if (gameInfo.player2accepts) {
        customGame.addClient({
          id: gameInfo.player2id,
          login: await this.userService.getUsernameWithId(gameInfo.player2id),
          socket: client,
          gameMode: gameMode.classic,
        });
      }
      const index = this.customGameWaitingList.findIndex(
        (value) => value.id === gameInfo.gameId,
      );
      this.customGameWaitingList.splice(index, 1);
    }
  }

  //create an array of waiting lobbies
  @SubscribeMessage('createCustomGame')
  async createCustomGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() id: number,
  ) {
    const playerIsAlreadyInCustom = this.customGameWaitingList.find(
      (value) => value.playerOne && value.playerOne.id === id,
    );
    if (playerIsAlreadyInCustom !== undefined) {
      return playerIsAlreadyInCustom.id;
    } else {
      const customGame: Lobby = new Lobby(
        gameMode.classic,
        this.gameService,
        this.userService,
      );
      customGame.addClient({
        id: id,
        login: await this.userService.getUsernameWithId(id),
        socket: client,
        gameMode: gameMode.classic,
      });
      this.customGameWaitingList.push(customGame);
      return customGame.id;
    }
  }

  @SubscribeMessage('spectate')
  watchFirstAvailableGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: string,
  ): gameState | brickwallGameState | undefined {
    let tmp: Lobby | undefined = findLobbyById(payload);
    if (tmp !== undefined) {
      let test = tmp.displayGameState();
      return test;
    }
    return undefined;
  }

  @SubscribeMessage('getSpectateGameInformation')
  sendSpectateInformations(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: string,
  ): gameInformation {
    this.logger.log(payload);
    let tmp: Lobby | undefined = findLobbyById(payload);
    if (tmp !== undefined) {
      tmp.addSpectator(client);
      return {
        player1: tmp.playerOne.login,
        player2: tmp.playerTwo.login,
        mode: tmp.gameMode,
      };
    }
    return undefined;
  }

  @SubscribeMessage('getGameInformation')
  sendGameMode(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: playerInfo,
  ): gameInformation | undefined {
    let tmp: Lobby | undefined = findLobbyById(payload.gameId);
    if (tmp !== undefined) {
      //allows logback
      if (tmp.playerOne.socket === null && tmp.playerOne.id == payload.playerId) tmp.playerOne.socket = client;
      else if (tmp.playerTwo.socket === null && tmp.playerTwo.id == payload.playerId) tmp.playerTwo.socket = client;

      if (tmp.playerOne && tmp.playerTwo)
        return {
          player1: tmp.playerOne.login,
          player2: tmp.playerTwo.login,
          mode: tmp.gameMode,
        };
    }
    return undefined;
  }
  //deux personnes doivent  se connecter,
  //                        etre enregistrées dans un lobby,
  //                        etre prevenues du lancement de la partie et de son déroulement

  @SubscribeMessage('gameConnection')
  async playerHasConnected(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: playerGameSetup,
  ) {
    if (!isPlayerInGame(payload.id)) {
      const playerInfo: gamePlayer = {
        id: payload.id,
        login: await this.userService.getUsernameWithId(payload.id),
        socket: client,
        gameMode: payload.mode,
      };
      this.lobbyManager.handleNewPlayer(playerInfo);
    }
  }

  @SubscribeMessage(GameEvent.Pause)
  stopGame(@ConnectedSocket() client: Socket, @MessageBody() gameId: string) {
    const Lobby: Lobby | undefined = findLobbyById(gameId);
    if (Lobby !== undefined) Lobby.handleClientMessage(client, GameEvent.Pause);
  }

  @SubscribeMessage(GameEvent.State)
  sendGameState(
    @ConnectedSocket() client: Socket,
    @MessageBody() gameId: string,
  ): gameState | brickwallGameState | undefined {
    const Lobby: Lobby | undefined = findLobbyById(gameId);
    if (Lobby !== undefined) {
      return Lobby.displayGameState();
    } else return undefined;
  }

  async handleConnection(
    @ConnectedSocket() client: Socket,
    @MessageBody() ...args: any[]
  ) {
    this.logger.log(client.id + 'connected to socket');
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(client.id + ' disconnected');
    const Lobby: Lobby | undefined = findSocketIdInGameList(client.id);
    if (Lobby !== undefined) {
      if (Lobby.playerOne.socket === client) Lobby.playerOne.socket = null;
      else if (Lobby.playerTwo.socket === client) Lobby.playerTwo.socket = null;
    }
  }
}
