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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailConfirmationController = void 0;
const common_1 = require("@nestjs/common");
const confirmEmail_dto_1 = __importDefault(require("../dto/confirmEmail.dto"));
const emailConfirmation_service_1 = require("./emailConfirmation.service");
const prisma_service_1 = require("../../prisma/prisma.service");
let EmailConfirmationController = class EmailConfirmationController {
    constructor(emailConfirmationService, prisma) {
        this.emailConfirmationService = emailConfirmationService;
        this.prisma = prisma;
    }
    async confirm(confirmationData) {
        try {
            const email = await this.emailConfirmationService.decodeConfirmationToken(confirmationData.token);
            await this.emailConfirmationService.confirmEmail(email);
            const user = await this.prisma.user.findUnique({
                where: {
                    email: email,
                }
            });
            if (user)
                return user;
        }
        catch (error) {
            console.log("Error: ", error.name);
            return -1;
        }
    }
};
exports.EmailConfirmationController = EmailConfirmationController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [confirmEmail_dto_1.default]),
    __metadata("design:returntype", Promise)
], EmailConfirmationController.prototype, "confirm", null);
exports.EmailConfirmationController = EmailConfirmationController = __decorate([
    (0, common_1.Controller)('email-confirmation'),
    __metadata("design:paramtypes", [emailConfirmation_service_1.EmailConfirmationService, prisma_service_1.PrismaService])
], EmailConfirmationController);
//# sourceMappingURL=emailConfirmation.controller.js.map