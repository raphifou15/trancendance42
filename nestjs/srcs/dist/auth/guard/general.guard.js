"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneralGuard = void 0;
const common_1 = require("@nestjs/common");
const auth_controller_1 = require("../auth.controller");
let GeneralGuard = class GeneralGuard {
    constructor() {
        this.logger = new common_1.Logger('gGuard');
    }
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const tmp = JSON.stringify(req.headers);
        const end = JSON.parse(tmp);
        if (end.authorization === undefined)
            return false;
        const keyValue = end.authorization.split('||');
        if (keyValue.length == 2 &&
            (0, auth_controller_1.verifyUserIdToken)({
                key: parseInt(keyValue[1]),
                value: keyValue[0],
            })) {
            return true;
        }
        else {
            this.logger.error('cookie value is wrong');
            return false;
        }
    }
};
exports.GeneralGuard = GeneralGuard;
exports.GeneralGuard = GeneralGuard = __decorate([
    (0, common_1.Injectable)()
], GeneralGuard);
//# sourceMappingURL=general.guard.js.map