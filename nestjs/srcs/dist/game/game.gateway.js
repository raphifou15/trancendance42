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
exports.GameGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const interfaces_1 = require("./interfaces");
const gameEvent_1 = require("./gameEvent");
const lobby_1 = require("./lobby");
const lobby_manager_1 = require("./lobby-manager");
const game_service_1 = require("./game.service");
const user_service_1 = require("../user/user.service");
let GameGateway = class GameGateway {
    constructor(gameService, userService) {
        this.gameService = gameService;
        this.userService = userService;
        this.server = new socket_io_1.Server();
        this.logger = new common_1.Logger('PongGateway');
        this.customGameWaitingList = new Array();
    }
    afterInit(server) {
        this.lobbyManager = new lobby_manager_1.LobbyManager(this.gameService, this.userService);
    }
    onPlayerMovement(client, payload) {
        const Lobby = (0, lobby_manager_1.findLobbyById)(payload.gameId);
        if (Lobby !== undefined)
            Lobby.handleClientMessage(client, payload.movement);
    }
    async acceptCustomGameInvitation(client, gameInfo) {
        const customGame = this.customGameWaitingList.find((value) => value.id === gameInfo.gameId);
        if (customGame !== undefined) {
            if (gameInfo.player2accepts) {
                customGame.addClient({
                    id: gameInfo.player2id,
                    login: await this.userService.getUsernameWithId(gameInfo.player2id),
                    socket: client,
                    gameMode: interfaces_1.gameMode.classic,
                });
            }
            const index = this.customGameWaitingList.findIndex((value) => value.id === gameInfo.gameId);
            this.customGameWaitingList.splice(index, 1);
        }
    }
    async createCustomGame(client, id) {
        const playerIsAlreadyInCustom = this.customGameWaitingList.find((value) => value.playerOne && value.playerOne.id === id);
        if (playerIsAlreadyInCustom !== undefined) {
            return playerIsAlreadyInCustom.id;
        }
        else {
            const customGame = new lobby_1.Lobby(interfaces_1.gameMode.classic, this.gameService, this.userService);
            customGame.addClient({
                id: id,
                login: await this.userService.getUsernameWithId(id),
                socket: client,
                gameMode: interfaces_1.gameMode.classic,
            });
            this.customGameWaitingList.push(customGame);
            return customGame.id;
        }
    }
    watchFirstAvailableGame(client, payload) {
        let tmp = (0, lobby_manager_1.findLobbyById)(payload);
        if (tmp !== undefined) {
            let test = tmp.displayGameState();
            return test;
        }
        return undefined;
    }
    sendSpectateInformations(client, payload) {
        this.logger.log(payload);
        let tmp = (0, lobby_manager_1.findLobbyById)(payload);
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
    sendGameMode(client, payload) {
        let tmp = (0, lobby_manager_1.findLobbyById)(payload.gameId);
        if (tmp !== undefined) {
            if (tmp.playerOne.socket === null && tmp.playerOne.id == payload.playerId)
                tmp.playerOne.socket = client;
            else if (tmp.playerTwo.socket === null && tmp.playerTwo.id == payload.playerId)
                tmp.playerTwo.socket = client;
            if (tmp.playerOne && tmp.playerTwo)
                return {
                    player1: tmp.playerOne.login,
                    player2: tmp.playerTwo.login,
                    mode: tmp.gameMode,
                };
        }
        return undefined;
    }
    async playerHasConnected(client, payload) {
        if (!(0, lobby_manager_1.isPlayerInGame)(payload.id)) {
            const playerInfo = {
                id: payload.id,
                login: await this.userService.getUsernameWithId(payload.id),
                socket: client,
                gameMode: payload.mode,
            };
            this.lobbyManager.handleNewPlayer(playerInfo);
        }
    }
    stopGame(client, gameId) {
        const Lobby = (0, lobby_manager_1.findLobbyById)(gameId);
        if (Lobby !== undefined)
            Lobby.handleClientMessage(client, gameEvent_1.GameEvent.Pause);
    }
    sendGameState(client, gameId) {
        const Lobby = (0, lobby_manager_1.findLobbyById)(gameId);
        if (Lobby !== undefined) {
            return Lobby.displayGameState();
        }
        else
            return undefined;
    }
    async handleConnection(client, ...args) {
        this.logger.log(client.id + 'connected to socket');
    }
    handleDisconnect(client) {
        this.logger.log(client.id + ' disconnected');
        const Lobby = (0, lobby_manager_1.findSocketIdInGameList)(client.id);
        if (Lobby !== undefined) {
            if (Lobby.playerOne.socket === client)
                Lobby.playerOne.socket = null;
            else if (Lobby.playerTwo.socket === client)
                Lobby.playerTwo.socket = null;
        }
    }
};
exports.GameGateway = GameGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('PlayerMovement'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "onPlayerMovement", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('gameInvitationAccepted'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "acceptCustomGameInvitation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('createCustomGame'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "createCustomGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('spectate'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Object)
], GameGateway.prototype, "watchFirstAvailableGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('getSpectateGameInformation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Object)
], GameGateway.prototype, "sendSpectateInformations", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('getGameInformation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Object)
], GameGateway.prototype, "sendGameMode", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('gameConnection'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "playerHasConnected", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(gameEvent_1.GameEvent.Pause),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "stopGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(gameEvent_1.GameEvent.State),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Object)
], GameGateway.prototype, "sendGameState", null);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleConnection", null);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleDisconnect", null);
exports.GameGateway = GameGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' }, namespace: 'pong' }),
    __metadata("design:paramtypes", [game_service_1.GameService,
        user_service_1.UserService])
], GameGateway);
//# sourceMappingURL=game.gateway.js.map