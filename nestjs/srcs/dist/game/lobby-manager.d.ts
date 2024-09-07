import { Logger } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { GameService } from './game.service';
import { gameMode, gamePlayer, spectateMessage } from './interfaces';
import { Lobby } from './lobby';
export declare const currentGameList: Array<Lobby>;
export declare function addToCurrentGameList(lobby: Lobby): void;
export declare function removeFromCurrentGameList(lobby: Lobby): void;
export declare function findLobbyById(id: string): Lobby | undefined;
export declare function isPlayerInGame(id: number): boolean;
export declare function displayCurrentGamesList(): spectateMessage[];
export declare function findSocketIdInGameList(socketId: string): Lobby;
export declare class LobbyManager {
    private readonly gameService;
    private readonly userService;
    constructor(gameService: GameService, userService: UserService);
    logger: Logger;
    private waitingLobbies;
    getGameModeLobbies(mode: gameMode): Array<Lobby> | undefined;
    getPlayerIdLobby(id: number): Lobby | undefined;
    handleNewPlayer(player: gamePlayer): void;
}
