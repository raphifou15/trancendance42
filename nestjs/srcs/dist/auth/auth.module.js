"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const strategy_1 = require("./strategy");
const ft_strategy_1 = require("./strategy/ft.strategy");
const config_1 = require("@nestjs/config");
const env_helper_1 = require("../env.helper");
const axios_1 = require("@nestjs/axios");
const emailConfirmation_service_1 = require("./twofactor/emailConfirmation.service");
const email_service_1 = __importDefault(require("./twofactor/email.service"));
const user_service_1 = require("../user/user.service");
const emailConfirmation_controller_1 = require("./twofactor/emailConfirmation.controller");
const envFilePath = (0, env_helper_1.getEnvPath)(`${__dirname}/common/envs`);
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: {
                    expiresIn: '30d'
                }
            }),
            config_1.ConfigModule.forRoot({ envFilePath, isGlobal: true }),
            axios_1.HttpModule,
        ],
        controllers: [auth_controller_1.AuthController, emailConfirmation_controller_1.EmailConfirmationController],
        providers: [auth_service_1.AuthService, strategy_1.JwtStrategy, ft_strategy_1.FortyTwoStrategy, email_service_1.default, emailConfirmation_service_1.EmailConfirmationService, user_service_1.UserService],
        exports: [auth_service_1.AuthService, email_service_1.default, emailConfirmation_service_1.EmailConfirmationService]
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map