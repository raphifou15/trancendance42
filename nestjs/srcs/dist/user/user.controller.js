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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const friend_dto_1 = require("../auth/dto/friend.dto");
const user_service_1 = require("./user.service");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    get_ten_best_players() {
        return this.userService.get_ten_best_players();
    }
    get_ten_last_games(params) {
        return this.userService.get_ten_last_games(params.id);
    }
    add_friend(dto) {
        return this.userService.add_friend(dto);
    }
    delete_friend(dto) {
        return this.userService.delete_friend(dto);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)('get_ten_best_players'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserController.prototype, "get_ten_best_players", null);
__decorate([
    (0, common_1.Get)('get_ten_last_games/:id'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "get_ten_last_games", null);
__decorate([
    (0, common_1.Post)('add_friend'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [friend_dto_1.FriendDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "add_friend", null);
__decorate([
    (0, common_1.Post)('delete_friend'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [friend_dto_1.FriendDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "delete_friend", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map