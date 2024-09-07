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
exports.GameController = void 0;
const common_1 = require("@nestjs/common");
const general_guard_1 = require("../auth/guard/general.guard");
const game_service_1 = require("./game.service");
const lobby_manager_1 = require("./lobby-manager");
let GameController = class GameController {
    constructor(gameService) {
        this.gameService = gameService;
    }
    findCurrentGames() {
        const reponse = (0, lobby_manager_1.displayCurrentGamesList)();
        return reponse;
    }
    setGameId(param) {
        const gameExists = (0, lobby_manager_1.findLobbyById)(param.id);
        return gameExists === undefined ? false : true;
    }
    findGameMode(param) {
        const gameExists = (0, lobby_manager_1.findLobbyById)(param.id);
        return {
            player1: gameExists.playerOne.login,
            player2: gameExists.playerTwo.login,
            mode: gameExists.gameMode,
        };
    }
};
exports.GameController = GameController;
__decorate([
    (0, common_1.Get)('list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GameController.prototype, "findCurrentGames", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "setGameId", null);
__decorate([
    (0, common_1.Get)(':id/gameMode'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], GameController.prototype, "findGameMode", null);
exports.GameController = GameController = __decorate([
    (0, common_1.UseGuards)(general_guard_1.GeneralGuard),
    (0, common_1.Controller)('game'),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameController);
//# sourceMappingURL=game.controller.js.map