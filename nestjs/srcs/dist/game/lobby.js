"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lobby = void 0;
const uuid_1 = require("uuid");
const interfaces_1 = require("./interfaces");
const common_1 = require("@nestjs/common");
const gameEvent_1 = require("./gameEvent");
const game_engine_1 = require("./game-engine");
const lobby_manager_1 = require("./lobby-manager");
class Lobby {
    constructor(gameMode, gameService, userService) {
        this.gameService = gameService;
        this.userService = userService;
        this.logger = new common_1.Logger('Lobby');
        this.createdAt = new Date();
        this.id = (0, uuid_1.v4)();
        this.playerOne = null;
        this.playerTwo = null;
        this.playerNb = 0;
        this.gameMode = gameMode;
        this.game = new game_engine_1.brickwallGame();
        this.spectatorList = new Array();
    }
    addSpectator(spectator) {
        const alreadySpectating = this.spectatorList.find((value) => value.id == spectator.id);
        if (alreadySpectating === undefined)
            this.spectatorList.push(spectator);
    }
    clearSpectator() {
        this.spectatorList.splice(0, this.spectatorList.length);
    }
    addClient(player) {
        var _a, _b;
        if (this.playerNb < 2 && this.gameMode === player.gameMode) {
            if (this.playerOne === null || player.socket === this.playerOne.socket) {
                console.log("1 PLAYER ID" + player.id);
                this.id = (0, uuid_1.v4)();
                this.playerOne = player;
                this.playerNb += 1;
                return true;
            }
            else {
                console.log("2 PLAYER ID" + this.playerOne.id + " " + player.id);
                if (this.playerOne.socket !== player.socket && this.playerOne.id !== player.id) {
                    this.playerTwo = player;
                    (_a = this.playerOne.socket) === null || _a === void 0 ? void 0 : _a.emit(gameEvent_1.GameEvent.Start, {
                        playerPosition: 'left',
                        gameId: this.id,
                    });
                    (_b = this.playerTwo.socket) === null || _b === void 0 ? void 0 : _b.emit(gameEvent_1.GameEvent.Start, {
                        playerPosition: 'right',
                        gameId: this.id,
                    });
                    this.gameService.createGame(this.id, this.gameMode, this.playerOne.id, this.playerTwo.id);
                    this.userService.changeInGameState(this.playerOne.id, true);
                    this.userService.changeInGameState(this.playerTwo.id, true);
                    if (this.gameMode === 0)
                        this.game.classic.startGame();
                    else
                        this.game.startGame();
                    this.playerNb += 1;
                    (0, lobby_manager_1.addToCurrentGameList)(this);
                    return true;
                }
            }
        }
        return false;
    }
    clientIsInTheGame(client) {
        if (client === this.playerOne.socket || client === this.playerTwo.socket) {
            return true;
        }
        else {
            return false;
        }
    }
    handleClientMessage(client, payload) {
        if (payload === 'up' || payload === 'down') {
            this.updatePlayerMovement(client, payload);
        }
        else if (payload === gameEvent_1.GameEvent.Pause) {
            this.game.stopGame();
        }
    }
    updatePlayerMovement(client, movement) {
        if (client === this.playerOne.socket) {
            this.game.classic.updateRacketPosition(this.game.classic.leftRacket, movement);
        }
        else if (client === this.playerTwo.socket) {
            this.game.classic.updateRacketPosition(this.game.classic.rightRacket, movement);
        }
    }
    removeClient(client) {
        if (client === this.playerOne.socket)
            this.playerOne = null;
        else if (client === this.playerTwo.socket)
            this.playerTwo = null;
        if (this.playerNb != 0)
            this.playerNb -= 1;
    }
    getLobbyGameMode() {
        return this.gameMode;
    }
    displayGameState() {
        if (this.game.classic.checkWinningCondition()) {
            this.handleGameEnd();
        }
        if (this.gameMode === interfaces_1.gameMode.classic) {
            return this.game.classic.dispatchGameState();
        }
        else {
            return this.game.dispatchGameState();
        }
    }
    handleGameEnd() {
        var _a, _b;
        const player1wins = this.game.classic.EndScore === this.game.classic.gameScore.player1
            ? true
            : false;
        const winner = player1wins ? this.playerOne : this.playerTwo;
        const winnerScore = player1wins
            ? this.game.classic.gameScore.player1
            : this.game.classic.gameScore.player2;
        const loser = player1wins ? this.playerTwo : this.playerOne;
        const loserScore = player1wins
            ? this.game.classic.gameScore.player2
            : this.game.classic.gameScore.player1;
        this.gameService.updateEndGame(this.id, winner.id, winnerScore, loserScore);
        this.userService.add_winner(winner);
        this.userService.add_loser(loser);
        (_a = this.playerOne.socket) === null || _a === void 0 ? void 0 : _a.emit(gameEvent_1.GameEvent.End, {
            winner: winner.login,
            score: this.game.classic.gameScore,
        });
        (_b = this.playerTwo.socket) === null || _b === void 0 ? void 0 : _b.emit(gameEvent_1.GameEvent.End, {
            winner: winner.login,
            score: this.game.classic.gameScore,
        });
        this.userService.changeInGameState(this.playerOne.id, false);
        this.userService.changeInGameState(this.playerTwo.id, false);
        this.game.reset();
        this.spectatorList.forEach((value) => {
            value.emit(gameEvent_1.GameEvent.End);
        });
        (0, lobby_manager_1.removeFromCurrentGameList)(this);
    }
}
exports.Lobby = Lobby;
//# sourceMappingURL=lobby.js.map