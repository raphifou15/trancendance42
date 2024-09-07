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
exports.AuthController = exports.userIdToken = void 0;
exports.findUserIdToken = findUserIdToken;
exports.addUserIdToken = addUserIdToken;
exports.deleteUserIdToken = deleteUserIdToken;
exports.updateUserIdToken = updateUserIdToken;
exports.verifyUserIdToken = verifyUserIdToken;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const dto_1 = require("./dto");
const dto_2 = require("./dto");
const ft_guard_1 = require("./guard/ft.guard");
const emailConfirmation_service_1 = require("./twofactor/emailConfirmation.service");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../user/user.service");
const prisma_service_1 = require("../prisma/prisma.service");
const fs_1 = require("fs");
const path_1 = require("path");
const axios_1 = require("@nestjs/axios");
const general_guard_1 = require("./guard/general.guard");
let id_g = -1;
const gLogger = new common_1.Logger('userIdToken');
exports.userIdToken = new Map();
function findUserIdToken(id) {
    return exports.userIdToken.get(id);
}
function addUserIdToken(token) {
    exports.userIdToken.set(token.key, token.value);
}
function deleteUserIdToken(id) {
    return exports.userIdToken.delete(id);
}
function updateUserIdToken(token) {
    let value = findUserIdToken(token.key);
    exports.userIdToken.delete(token.key);
    exports.userIdToken.set(token.key, token.value);
}
function verifyUserIdToken(token) {
    const result = findUserIdToken(token.key);
    if (typeof result === 'string') {
        return token.value === result;
    }
    else
        return false;
}
let AuthController = class AuthController {
    constructor(authService, jwtService, userService, prisma, emailConfirmationService, httpService) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.userService = userService;
        this.prisma = prisma;
        this.emailConfirmationService = emailConfirmationService;
        this.httpService = httpService;
        this.logger = new common_1.Logger(auth_service_1.AuthService.name);
    }
    async signup(dto, res) {
        const token = await this.authService.signup(dto);
        const secretData = {
            token,
            refreshToken: '',
            id: id_g,
        };
    }
    async createCookie(dto, res) {
        const user = await this.authService.get_user_by_email(dto.email);
        const token = (await this.authService.signToken(user.id, user.email))
            .access_token;
        const secretData = {
            token,
            refreshToken: '',
            id: user.id,
        };
        res.cookie('42auth-cookie', secretData, {
            httpOnly: false,
            expires: new Date(Date.now() + 2 * 3600000),
        });
        updateUserIdToken({ key: secretData.id, value: secretData.token });
        this.authService.toggleLogin(String(secretData.id));
    }
    authGet42Login() {
    }
    async redirectauthGet42Login(req, res) {
        const userData = await this.userService.findById(req.user['id']);
        console.log(req.user);
        const id = Number(req.user.id);
        const login = String(req.user.username);
        const email = String(req.user._json.email);
        const image_url = String(req.user._json.image.link);
        const image_extension = '.' + image_url.split('.').pop();
        console.log(image_url);
        const file = (0, fs_1.createWriteStream)((0, path_1.join)('./uploads/', login + image_extension));
        const response = await this.httpService.axiosRef({
            url: image_url,
            method: 'GET',
            responseType: 'stream',
        });
        response.data.pipe(file);
        id_g = Number(req.user.id);
        let username_in_db = await this.userService.getUsernameWithId(id);
        let hash_length = await this.userService.getHashLength(id);
        if (userData && username_in_db.length > 0 && hash_length > 0) {
            if (!userData.auth2f_enabled) {
                const token = (await this.authService.signToken(id, email))
                    .access_token;
                const secretData = {
                    token,
                    refreshToken: '',
                    id: id_g,
                };
                res.cookie('42auth-cookie', secretData, {
                    httpOnly: false,
                    expires: new Date(Date.now() + 2 * 3600000),
                });
                updateUserIdToken({ key: secretData.id, value: secretData.token });
                this.authService.toggleLogin(String(id));
                res.redirect(`http://` + process.env.HOST + `:9999/Home`);
            }
            else {
                res.redirect(`http://` +
                    process.env.HOST +
                    `:9999/WaitingValidation?token=a2fEnabled`);
                await this.emailConfirmationService.sendVerificationLink(userData.email);
            }
            this.authService.toggleGoneThroughLoginTrue(id_g);
        }
        else {
            const token = (await this.authService.signToken(id, email)).access_token;
            const secretData = {
                token,
                refreshToken: '',
                id: id_g,
            };
            res.cookie('42auth-cookie', secretData, {
                httpOnly: false,
                expires: new Date(Date.now() + 2 * 3600000),
            });
            addUserIdToken({ key: secretData.id, value: secretData.token });
            this.authService.register(id, login, email, image_extension);
            res.redirect(`http://` + process.env.HOST + `:9999/Register`);
        }
    }
    async get_user() {
        return await this.authService.get_user();
    }
    async get_user_by_id(params) {
        return await this.authService.get_user_by_id(params.id);
    }
    async toggleA2f(dto) {
        return this.authService.toggleA2f(String(dto.id));
    }
    async change_image_url_from_profile(dto) {
        return this.authService.change_image_url_from_profile(dto);
    }
    async changeLogin(dto) {
        return this.authService.changeLogin(dto);
    }
    async get_user_by_login(params) {
        return await this.authService.get_user_by_login(params.login);
    }
    async loginexists(params) {
        return await this.authService.loginexists(params.login);
    }
    async emailexists(params) {
        return await this.authService.emailexists(params.login);
    }
    async get_friends_by_id(params) {
        return await this.authService.get_friends_by_id(params.id);
    }
    async get_all_users() {
        return await this.authService.get_all_users();
    }
    async toggleLogin(dto) {
        return await this.authService.toggleLogin(String(dto.id));
    }
    async toggleLogout(dto) {
        if (dto.id === undefined || isNaN(parseInt(dto.id))) {
            console.error('ID IS UNDEFINED IN GET ASKINFOFORP{LAEYER');
            return -1;
        }
        return await this.authService.toggleLogout(String(dto.id));
    }
    async toggleGoneThroughLoginFalse(dto) {
        return await this.authService.toggleGoneThroughLoginFalse(String(dto.id));
    }
    async toggleGoneThroughRegisterTrue(id) {
        return await this.authService.toggleGoneThroughRegisterTrue(id);
    }
    async askBackendIfUserWentThroughRegister(params) {
        if (params.id === undefined || isNaN(parseInt(params.id))) {
            console.error('ID IS UNDEFINED IN GET ASKINFOFORP{LAEYER');
            return -1;
        }
        return await this.authService.didUserGoThroughRegister(params.id);
    }
    async askBackendIfUserEnabledA2f(params) {
        return await this.authService.didUserEnabledA2f(params.id);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('signup'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AuthDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)('createCookie'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AuthDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createCookie", null);
__decorate([
    (0, common_1.UseGuards)(ft_guard_1.FortyTwoAuthGuard),
    (0, common_1.Get)('42login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "authGet42Login", null);
__decorate([
    (0, common_1.UseGuards)(ft_guard_1.FortyTwoAuthGuard),
    (0, common_1.Get)('42login/redirect'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "redirectauthGet42Login", null);
__decorate([
    (0, common_1.UseGuards)(general_guard_1.GeneralGuard),
    (0, common_1.Get)('get_user'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "get_user", null);
__decorate([
    (0, common_1.Get)('get_user_by_id/:id'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "get_user_by_id", null);
__decorate([
    (0, common_1.UseGuards)(general_guard_1.GeneralGuard),
    (0, common_1.Post)('toggleA2f'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_2.ChangeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "toggleA2f", null);
__decorate([
    (0, common_1.UseGuards)(general_guard_1.GeneralGuard),
    (0, common_1.Post)('change_image_url_from_profile'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_2.ChangeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "change_image_url_from_profile", null);
__decorate([
    (0, common_1.UseGuards)(general_guard_1.GeneralGuard),
    (0, common_1.Post)('changeLogin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_2.ChangeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changeLogin", null);
__decorate([
    (0, common_1.UseGuards)(general_guard_1.GeneralGuard),
    (0, common_1.Get)('get_user_by_login/:login'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "get_user_by_login", null);
__decorate([
    (0, common_1.UseGuards)(general_guard_1.GeneralGuard),
    (0, common_1.Get)('loginexists/:login'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginexists", null);
__decorate([
    (0, common_1.UseGuards)(general_guard_1.GeneralGuard),
    (0, common_1.Get)('emailexists/:login'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "emailexists", null);
__decorate([
    (0, common_1.UseGuards)(general_guard_1.GeneralGuard),
    (0, common_1.Get)('get_friends_by_id/:id'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "get_friends_by_id", null);
__decorate([
    (0, common_1.UseGuards)(general_guard_1.GeneralGuard),
    (0, common_1.Get)('get_all_users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "get_all_users", null);
__decorate([
    (0, common_1.UseGuards)(general_guard_1.GeneralGuard),
    (0, common_1.Post)('toggleLogin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_2.ChangeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "toggleLogin", null);
__decorate([
    (0, common_1.Post)('toggleLogout'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_2.ChangeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "toggleLogout", null);
__decorate([
    (0, common_1.Post)('toggleGoneThroughLoginFalse'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_2.ChangeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "toggleGoneThroughLoginFalse", null);
__decorate([
    (0, common_1.UseGuards)(general_guard_1.GeneralGuard),
    (0, common_1.Post)('toggleGoneThroughRegisterTrue'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "toggleGoneThroughRegisterTrue", null);
__decorate([
    (0, common_1.UseGuards)(general_guard_1.GeneralGuard),
    (0, common_1.Get)('askBackendIfUserWentThroughRegister/:id'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "askBackendIfUserWentThroughRegister", null);
__decorate([
    (0, common_1.Get)('askBackendIfUserEnabledA2f/:id'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "askBackendIfUserEnabledA2f", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        jwt_1.JwtService,
        user_service_1.UserService,
        prisma_service_1.PrismaService,
        emailConfirmation_service_1.EmailConfirmationService,
        axios_1.HttpService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map