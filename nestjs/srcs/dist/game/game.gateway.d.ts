import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { brickwallGameState, gameInformation, gameMode, gameState } from './interfaces';
import { GameService } from './game.service';
import { UserService } from 'src/user/user.service';
export interface playerGameSetup {
    mode: gameMode;
    id: number;
}
interface playerInfo {
    gameId: string;
    playerId: number;
}
export declare class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly gameService;
    private readonly userService;
    constructor(gameService: GameService, userService: UserService);
    server: Server;
    private readonly logger;
    private lobbyManager;
    private customGameWaitingList;
    afterInit(server: any): void;
    onPlayerMovement(client: Socket, payload: {
        gameId: string;
        movement: string;
    }): void;
    acceptCustomGameInvitation(client: Socket, gameInfo: {
        player2id: number;
        gameId: string;
        player2accepts: boolean;
    }): Promise<void>;
    createCustomGame(client: Socket, id: number): Promise<string>;
    watchFirstAvailableGame(client: Socket, payload: string): gameState | brickwallGameState | undefined;
    sendSpectateInformations(client: Socket, payload: string): gameInformation;
    sendGameMode(client: Socket, payload: playerInfo): gameInformation | undefined;
    playerHasConnected(client: Socket, payload: playerGameSetup): Promise<void>;
    stopGame(client: Socket, gameId: string): void;
    sendGameState(client: Socket, gameId: string): gameState | brickwallGameState | undefined;
    handleConnection(client: Socket, ...args: any[]): Promise<void>;
    handleDisconnect(client: Socket): void;
}
export {};
