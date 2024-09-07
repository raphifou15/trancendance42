"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LobbyManager = exports.currentGameList = void 0;
exports.addToCurrentGameList = addToCurrentGameList;
exports.removeFromCurrentGameList = removeFromCurrentGameList;
exports.findLobbyById = findLobbyById;
exports.isPlayerInGame = isPlayerInGame;
exports.displayCurrentGamesList = displayCurrentGamesList;
exports.findSocketIdInGameList = findSocketIdInGameList;
const common_1 = require("@nestjs/common");
const lobby_1 = require("./lobby");
exports.currentGameList = new Array();
function addToCurrentGameList(lobby) {
    exports.currentGameList.push(lobby);
}
function removeFromCurrentGameList(lobby) {
    const index = exports.currentGameList.findIndex((value) => value.id === lobby.id);
    if (index !== -1)
        exports.currentGameList.splice(index, 1);
}
function findLobbyById(id) {
    return exports.currentGameList.find((value) => {
        return value.id === id;
    });
}
function isPlayerInGame(id) {
    return (exports.currentGameList.find((value) => value.playerOne.id === id || value.playerTwo.id === id) !== undefined);
}
function displayCurrentGamesList() {
    let reponse = exports.currentGameList.map((value) => {
        var _a, _b;
        const message = {
            matchmakingTitle: ((_a = value.playerOne) === null || _a === void 0 ? void 0 : _a.login) + ' versus ' + ((_b = value.playerTwo) === null || _b === void 0 ? void 0 : _b.login),
            gameId: value.id,
        };
        return message;
    });
    return reponse;
}
function findSocketIdInGameList(socketId) {
    return exports.currentGameList.find((value) => {
        var _a, _b;
        return (((_a = value.playerOne.socket) === null || _a === void 0 ? void 0 : _a.id) === socketId ||
            ((_b = value.playerTwo.socket) === null || _b === void 0 ? void 0 : _b.id) === socketId);
    });
}
class LobbyManager {
    constructor(gameService, userService) {
        this.gameService = gameService;
        this.userService = userService;
        this.logger = new common_1.Logger('LobbyManager');
        this.waitingLobbies = new Array();
    }
    getGameModeLobbies(mode) {
        return this.waitingLobbies.filter((value) => {
            return value.gameMode === mode;
        });
    }
    getPlayerIdLobby(id) {
        return this.waitingLobbies.find((value) => {
            var _a, _b;
            return ((_a = value.playerOne) === null || _a === void 0 ? void 0 : _a.id) === id || ((_b = value.playerTwo) === null || _b === void 0 ? void 0 : _b.id) === id;
        });
    }
    handleNewPlayer(player) {
        const playerInWaitingLobbies = this.waitingLobbies.filter((value) => {
            var _a, _b;
            return (((_a = value.playerOne) === null || _a === void 0 ? void 0 : _a.id) === player.id || ((_b = value.playerTwo) === null || _b === void 0 ? void 0 : _b.id) === player.id);
        });
        if (playerInWaitingLobbies.length) {
            playerInWaitingLobbies.forEach((value) => {
                if (value.playerOne.id === player.id)
                    value.playerOne = null;
                else if (value.playerTwo.id === player.id)
                    value.playerTwo = null;
            });
        }
        const sameModeLobbies = this.getGameModeLobbies(player.gameMode);
        if (sameModeLobbies.length) {
            let firstAvailableLobby = this.waitingLobbies.find((value) => {
                return value.playerOne === null || value.playerTwo === null;
            });
            if (firstAvailableLobby !== undefined) {
                firstAvailableLobby.addClient(player);
                const index = this.waitingLobbies.findIndex((value) => value.id === firstAvailableLobby.id);
                if (index !== -1)
                    this.waitingLobbies.splice(index, 1);
            }
            else
                throw new Error('this case should not happen');
        }
        else {
            let newLobby = new lobby_1.Lobby(player.gameMode, this.gameService, this.userService);
            newLobby.addClient(player);
            this.waitingLobbies.push(newLobby);
        }
    }
}
exports.LobbyManager = LobbyManager;
//# sourceMappingURL=lobby-manager.js.map