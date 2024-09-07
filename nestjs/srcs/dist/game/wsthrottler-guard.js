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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsThrottlerGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
let WsThrottlerGuard = class WsThrottlerGuard extends throttler_1.ThrottlerGuard {
    constructor(options, storageService, reflector) {
        super(options, storageService, reflector);
    }
    async handleRequest(request) {
        var _a;
        const { context, limit, ttl } = request;
        const client = context.switchToWs().getClient();
        const ip = ((_a = client.conn) === null || _a === void 0 ? void 0 : _a.remoteAddress) || 'unknown';
        const key = this.generateKey(context, ip, 'wsThrottle');
        const throttlerRecord = await this.storageService.increment(key, ttl, limit, 0, 'wsThrottle');
        if (throttlerRecord.isBlocked) {
            throw new throttler_1.ThrottlerException();
        }
        return true;
    }
};
exports.WsThrottlerGuard = WsThrottlerGuard;
exports.WsThrottlerGuard = WsThrottlerGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object, Object, core_1.Reflector])
], WsThrottlerGuard);
//# sourceMappingURL=wsthrottler-guard.js.map