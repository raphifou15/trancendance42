"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const auth_controller_1 = require("../auth/auth.controller");
let ChatService = class ChatService {
    constructor(prisma) {
        this.prisma = prisma;
        this.playerAuthorize = [];
        this.onlinePlayers = new Map();
        this.allInfos = [];
        this.tabSocket = [];
    }
    getAuthorisation(auth) {
        if (auth.token === undefined)
            return false;
        return (0, auth_controller_1.verifyUserIdToken)({ key: auth.cookieid, value: auth.token });
    }
    async getAllMessagesDm(all) {
        let name_channel = '';
        if (all.myUserId < all.notMyUserId)
            name_channel = `dm${all.myUserId}+${all.notMyUserId}`;
        else if (all.myUserId > all.notMyUserId)
            name_channel = `dm${all.notMyUserId}+${all.myUserId}`;
        else
            name_channel = `dm${all.myUserId}`;
        const allMessagesDm = await this.prisma.channel.findFirst({
            where: {
                name: name_channel,
            },
            include: {
                messages: true,
                user: {
                    select: {
                        blockBy: true,
                        blokin: true,
                        id: true,
                        login: true,
                    },
                },
            },
        });
        return allMessagesDm;
    }
    async getChannelInfoWithName(nameChan) {
        const channel = await this.prisma.channel.findFirst({
            where: {
                name: nameChan,
            },
            include: {
                messages: true,
                user: {
                    select: {
                        inChannel: true,
                        blockBy: true,
                        blokin: true,
                        id: true,
                        login: true,
                    },
                },
            },
        });
        return channel;
    }
    async getHello() {
        const lala = await this.prisma.user.findMany();
        return lala;
    }
    async getAllUser() {
        const lala = await this.prisma.user.findMany();
        return lala;
    }
    async getAskInfoForPlayer(id) {
        const lala = await this.prisma.user.findUnique({
            where: {
                id: id,
            },
        });
        return lala;
    }
    async createChannelGroup(infoChannel, idUser) {
        const hash = await bcrypt.hash(infoChannel.password, 10);
        try {
            const listAllUserId = await this.prisma.user.findMany({
                select: {
                    id: true,
                },
            });
            await this.prisma.channel.create({
                include: {
                    user: true,
                },
                data: {
                    name: infoChannel.name,
                    inChannel: { connect: [{ id: idUser }] },
                    user: { connect: [{ id: idUser }] },
                    administrators: { connect: [{ id: idUser }] },
                    channelOption: infoChannel.private ? `PRIVATE` : `PUBLIC`,
                    Protected: infoChannel.protected,
                    Password: hash,
                    owner: idUser,
                },
            });
        }
        catch (_a) {
            console.log('errrrrooorr');
        }
    }
    async createDmChannel(message, name_channel) {
        if (message.myUserId === message.notMyUserId) {
            await this.prisma.channel.create({
                include: {
                    user: true,
                },
                data: {
                    name: name_channel,
                    channelOption: `DM`,
                    user: { connect: [{ id: message.myUserId }] },
                },
            });
        }
        else {
            await this.prisma.channel.create({
                include: {
                    user: true,
                },
                data: {
                    name: name_channel,
                    channelOption: `DM`,
                    user: {
                        connect: [{ id: message.myUserId }, { id: message.notMyUserId }],
                    },
                },
            });
        }
    }
    async PostCreateDmMessage(message) {
        let name_channel = '';
        if (message.myUserId < message.notMyUserId)
            name_channel = `dm${message.myUserId}+${message.notMyUserId}`;
        else if (message.myUserId > message.notMyUserId)
            name_channel = `dm${message.notMyUserId}+${message.myUserId}`;
        else
            name_channel = `dm${message.myUserId}`;
        const lala = await this.prisma.channel.findUnique({
            where: {
                name: `${name_channel}`,
            },
        });
        if (lala === null) {
            console.log('channel have to be created');
            await this.createDmChannel(message, name_channel);
        }
        const lala2 = await this.prisma.channel.findUnique({
            where: {
                name: `${name_channel}`,
            },
        });
        await this.prisma.message.create({
            data: {
                content: message.text,
                user: { connect: { id: message.myUserId } },
                channel: { connect: { id: lala2.id } },
            },
        });
    }
    async PostCreateMessageChannel(messageToChannel, userId) {
        const lala2 = await this.prisma.channel.findUnique({
            where: {
                name: `${messageToChannel.nameChannel}`,
            },
        });
        await this.prisma.message.create({
            data: {
                content: messageToChannel.text,
                user: { connect: { id: userId } },
                channel: { connect: { id: lala2.id } },
            },
        });
    }
    async PostDmMessageToDatabase(id) { }
    async blockDmUser(userId, notMyUserId) {
        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                blokin: { connect: { id: notMyUserId } },
            },
        });
    }
    async createDmChannelBlock(name_channel, userId, notMyUserId) {
        try {
            if (userId === notMyUserId) {
                await this.prisma.channel.create({
                    include: {
                        user: true,
                    },
                    data: {
                        name: name_channel,
                        channelOption: `DM`,
                        user: { connect: [{ id: userId }] },
                    },
                });
            }
            else {
                await this.prisma.channel.create({
                    include: {
                        user: true,
                    },
                    data: {
                        name: name_channel,
                        channelOption: `DM`,
                        user: { connect: [{ id: userId }, { id: notMyUserId }] },
                    },
                });
            }
        }
        catch (_a) {
            console.log('impossible to create channel');
        }
    }
    async unBlockDmUser(userId, notMyUserId) {
        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                blokin: { disconnect: { id: notMyUserId } },
            },
        });
    }
    getMyUserId(socketId) {
        let num = -1;
        this.onlinePlayers.forEach((value, key) => {
            var _a;
            (_a = value.socketId) === null || _a === void 0 ? void 0 : _a.map((elem) => {
                if (socketId === elem)
                    num = key.valueOf();
                return elem;
            });
        });
        return num;
    }
    getMyName(socketId) {
        let name = '';
        this.onlinePlayers.forEach((value) => {
            var _a;
            (_a = value.socketId) === null || _a === void 0 ? void 0 : _a.map((elem) => {
                if (socketId === elem)
                    name = value.name.toString();
            });
        });
        return name;
    }
    getSocketIdWithName(name) {
        let socketId = [];
        this.onlinePlayers.forEach((value, key) => {
            if (value.name === name)
                socketId = [...value.socketId];
        });
        return socketId;
    }
    async getAllPublicChannel(userId) {
        const allPublicChannel = await this.prisma.channel.findMany({
            where: {
                channelOption: `PUBLIC`,
            },
            include: {
                user: true,
                ban: true,
            },
        });
        return allPublicChannel;
    }
    async getAllPrivateChannel(num) {
        const allPublicChannel = await this.prisma.channel.findMany({
            where: {
                user: {
                    some: {
                        id: num,
                    },
                },
                channelOption: `PRIVATE`,
            },
        });
        return allPublicChannel;
    }
    async getChannelWithName(name) {
        const channel = await this.prisma.channel.findUnique({
            include: {
                administrators: true,
            },
            where: {
                name: name,
            },
        });
        return channel;
    }
    async getAllUsers() {
        const allUsers = await this.prisma.user.findMany({
            include: {
                blockBy: true,
                blokin: true,
                channels: true,
                channelAdministrators: true,
            },
        });
        return allUsers;
    }
    async getAllUsersClean() {
        const allUsers = await this.prisma.user.findMany({});
        return allUsers;
    }
    async getOneUserBlokin(userId) {
        const oneUser = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                blokin: true,
            },
        });
        return oneUser;
    }
    async blockUserWithName(userId, name) {
        try {
            const idToBlock = await this.prisma.user.findUnique({
                where: {
                    login: name,
                },
            });
            await this.prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    blokin: { connect: { id: idToBlock.id } },
                },
            });
        }
        catch (_a) {
            console.log('errorrrrrrrrrrrrrrrrrrrrrrr');
        }
    }
    async getAllUserBlockFromOneUser(userId) {
        const userInfo = await this.prisma.user.findUnique({
            include: {
                blokin: true,
            },
            where: {
                id: userId,
            },
        });
        return userInfo.blokin;
    }
    async unBlockUserWithName(userId, name) {
        try {
            const idToBlock = await this.prisma.user.findUnique({
                where: {
                    login: name,
                },
            });
            await this.prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    blokin: { disconnect: { id: idToBlock.id } },
                },
            });
        }
        catch (_a) {
            console.log('errrorrrrrrrrr');
        }
    }
    async updateChannelPass(userId, name, pass, num) {
        const checkIfOwnerOfChannel = await this.prisma.channel.findUnique({
            where: {
                name: name,
            },
        });
        if (checkIfOwnerOfChannel.owner !== userId)
            return;
        const hash = await bcrypt.hash(pass, 10);
        if (checkIfOwnerOfChannel.owner === userId && num === 0) {
            await this.prisma.channel.update({
                where: {
                    name: name,
                },
                data: {
                    Protected: false,
                },
            });
        }
        else if (checkIfOwnerOfChannel.owner === userId && num === 1) {
            await this.prisma.channel.update({
                where: {
                    name: name,
                },
                data: {
                    Protected: true,
                    Password: hash,
                },
            });
        }
    }
    async getAllUserFromChannel(name) {
        const allInfoChan = await this.prisma.channel.findUnique({
            where: {
                name: name,
            },
            include: {
                user: true,
                administrators: true,
                mutes: true,
                ban: true,
                inChannel: true,
            },
        });
        return allInfoChan;
    }
    async addAminToChannel(nameUser, nameChan) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { login: nameUser },
            });
            await this.prisma.channel.update({
                where: {
                    name: nameChan,
                },
                data: {
                    administrators: { connect: { id: user.id } },
                },
            });
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    async removeAminToChannel(nameUser, nameChan) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { login: nameUser },
            });
            await this.prisma.channel.update({
                where: {
                    name: nameChan,
                },
                data: {
                    administrators: { disconnect: { id: user.id } },
                },
            });
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    async muteToChannel(nameUser, nameChan, futureDate, myUserId) {
        var _a, _b;
        try {
            const user = await this.prisma.user.findUnique({
                where: { login: nameUser },
            });
            const chan = await this.prisma.channel.findUnique({
                where: { name: nameChan },
                include: { administrators: true, inChannel: true },
            });
            if (((_a = chan.inChannel) === null || _a === void 0 ? void 0 : _a.some((elem) => elem.id === user.id)) === false)
                return undefined;
            if (user.id === chan.owner)
                return undefined;
            if (((_b = chan.administrators) === null || _b === void 0 ? void 0 : _b.some((elem) => elem.id === user.id)) === true &&
                myUserId !== chan.owner)
                return undefined;
            const muteUserChannel = await this.prisma.mute.create({
                data: {
                    user: { connect: { id: user.id } },
                    channel: { connect: { id: chan.id } },
                    unmuteAt: futureDate,
                },
            });
            return muteUserChannel;
        }
        catch (_c) {
            return undefined;
        }
    }
    async UnmuteToChannel(muteUserChannel) {
        try {
            await this.prisma.mute.delete({
                where: {
                    id: muteUserChannel.id,
                },
            });
        }
        catch (_a) {
            console.log('delete operation failed');
        }
    }
    async deleteUserMute(mute) {
        await this.prisma.mute.delete({
            where: {
                id: mute.id,
            },
        });
    }
    async getOneUserWithName(name) {
        const oneUser = await this.prisma.user.findUnique({
            where: {
                login: name,
            },
        });
        return oneUser;
    }
    async banToChannel(nameUser, nameChan) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { login: nameUser },
            });
            const chan = await this.prisma.channel.findUnique({
                where: { name: nameChan },
            });
            await this.prisma.channel.update({
                where: {
                    name: chan.name,
                },
                data: {
                    ban: { connect: { id: user.id } },
                    inChannel: { disconnect: { id: user.id } },
                },
            });
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    async unBanToChannel(nameUser, nameChan) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { login: nameUser },
            });
            const chan = await this.prisma.channel.findUnique({
                where: { name: nameChan },
            });
            await this.prisma.channel.update({
                where: {
                    name: chan.name,
                },
                data: {
                    ban: { disconnect: { id: user.id } },
                    inChannel: { connect: { id: user.id } },
                },
            });
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    async inviteToChannel(nameUser, nameChan) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { login: nameUser },
            });
            const chan = await this.prisma.channel.findUnique({
                where: { name: nameChan },
            });
            await this.prisma.channel.update({
                where: {
                    name: chan.name,
                },
                data: {
                    user: { connect: { id: user.id } },
                },
            });
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    async LeaveGiveRight(nameUser, nameChan) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { login: nameUser },
            });
            const chan = await this.prisma.channel.findUnique({
                where: { name: nameChan },
            });
            await this.prisma.channel.update({
                where: {
                    name: chan.name,
                },
                data: {
                    owner: user.id,
                    administrators: { connect: { id: user.id } },
                },
            });
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    async addUserToChannel(name, userId) {
        await this.prisma.channel.update({
            where: {
                name: name,
            },
            data: {
                user: { connect: { id: userId } },
                inChannel: { connect: { id: userId } },
            },
        });
    }
    async removeUserToChannel(name, userId) {
        await this.prisma.channel.update({
            where: {
                name: name,
            },
            data: {
                inChannel: { disconnect: { id: userId } },
            },
        });
    }
    async destroyTheChan(name) {
        const chan = await this.prisma.channel.findUnique({
            where: { name: name },
        });
        await this.prisma.message.deleteMany({
            where: {
                channelId: chan.id,
            },
        });
        await this.prisma.mute.deleteMany({
            where: {
                channelId: chan.id,
            },
        });
        await this.prisma.channel.delete({
            where: {
                name: name,
            },
        });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map