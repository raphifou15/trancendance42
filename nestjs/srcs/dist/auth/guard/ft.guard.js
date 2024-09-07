"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FortyTwoAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FortyTwoAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
let FortyTwoAuthGuard = FortyTwoAuthGuard_1 = class FortyTwoAuthGuard extends (0, passport_1.AuthGuard)('ft') {
    constructor() {
        super(...arguments);
        this.logger = new common_1.Logger(FortyTwoAuthGuard_1.name);
    }
    ici() {
        this.logger.log('IN FT_GUARD');
    }
};
exports.FortyTwoAuthGuard = FortyTwoAuthGuard;
exports.FortyTwoAuthGuard = FortyTwoAuthGuard = FortyTwoAuthGuard_1 = __decorate([
    (0, common_1.Injectable)()
], FortyTwoAuthGuard);
//# sourceMappingURL=ft.guard.js.map