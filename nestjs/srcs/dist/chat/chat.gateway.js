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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
let ChatGateway = class ChatGateway {
    constructor(chatService) {
        this.chatService = chatService;
        this.logger = new common_1.Logger('ChatGateway');
    }
    noneAfunction() { }
    afterInit(server) {
    }
    handleConnection(client, ...args) {
        if (this.chatService.getAuthorisation(client.handshake.auth) === false) {
            client.emit("errorSocket");
        }
    }
    handleDisconnect(client) {
        this.chatService.onlinePlayers.forEach((value, key, map) => {
            var _a;
            value.socketId = (_a = value.socketId) === null || _a === void 0 ? void 0 : _a.filter((elem) => elem !== client.id);
            if (value.socketId.length <= 0)
                map.delete(key);
        });
        this.chatService.onlinePlayers.delete(parseInt(client.id));
        const it = this.chatService.onlinePlayers[Symbol.iterator]();
        const index = this.chatService.allInfos.findIndex((elem) => elem.notMySocketId !== client.id);
        this.chatService.allInfos.splice(index, 1);
        this.server.emit(`someoneDisconnectedFromServer`, client.id);
    }
    handleMessage(client, message) {
        if (!message.text.replace(/\s/g, '').length || message.text.length > 5000)
            return;
        this.chatService.PostCreateDmMessage(message);
        const myName = this.chatService.getMyName(client.id);
        const notMySocketId = this.chatService.getSocketIdWithName(message.notMyName);
        const mySocketId = this.chatService.getSocketIdWithName(myName);
        notMySocketId === null || notMySocketId === void 0 ? void 0 : notMySocketId.map((elem) => {
            client.to(elem).emit('private message', message);
        });
        message.isItMine = true;
        return message;
    }
    handleJoinRoom(client, room) {
        client.join(room);
        client.emit('joinedRoom', room);
    }
    handleLeaveRoom(client, room) {
        client.join(room);
        client.emit('leftRoom', room);
    }
    async someoneIsConnected(client) {
        const tmp = client.handshake.auth;
        let elementToChange = false;
        this.chatService.onlinePlayers.forEach((value, key) => {
            var _a;
            if (value.name === tmp.login) {
                if (((_a = value.socketId) === null || _a === void 0 ? void 0 : _a.some((elem) => elem === client.id)) === false)
                    value.socketId.push(client.id);
                elementToChange = true;
            }
        });
        if (elementToChange === false)
            this.chatService.onlinePlayers.set(parseInt(tmp.idUser), {
                name: tmp.login,
                socketId: [client.id],
            });
        const it = this.chatService.onlinePlayers[Symbol.iterator]();
        const transitString = JSON.stringify(Array.from(this.chatService.onlinePlayers));
        this.server.emit('someoneIsconnectedToServer', transitString);
    }
    informationPlayer(client, temp) {
        const info = [];
        this.chatService.onlinePlayers.forEach((value, key) => {
            info.push({
                mySocketId: client.id,
                myUserId: temp.idUser,
                myName: temp.login,
                notMySocketId: value.socketId[0],
                notMyName: value.name,
                notMyUserId: key,
            });
        });
        this.chatService.allInfos = [...info];
        return info;
    }
    async blockDmUser(client, body) {
        await this.chatService.blockDmUser(body.params.userId, body.params.notMyUserId);
        return "ok";
    }
    blockDmUser2(client, temp) {
        const elem = this.chatService.onlinePlayers.get(temp);
        try {
            client.to(elem.socketId.toString()).emit('blockDmUserFront');
        }
        catch (_a) { }
    }
    async unBlockDmUser(client, body) {
        await this.chatService.unBlockDmUser(body.params.userId, body.params.notMyUserId);
        return "ok";
    }
    unBlockDmUser2(client, temp) {
        const elem = this.chatService.onlinePlayers.get(temp);
        try {
            client.to(elem.socketId.toString()).emit('unBlockDmUserFront');
        }
        catch (_a) { }
    }
    async getAllMessagesFromChannelDmFront(client, all) {
        var _a;
        const allInfo = await this.chatService.getAllMessagesDm(all.params);
        if (allInfo === null || allInfo === undefined)
            return;
        const allUsers = await this.chatService.getAllUsersClean();
        const userId = this.chatService.getMyUserId(client.id);
        const me = (_a = allInfo.user) === null || _a === void 0 ? void 0 : _a.filter((elem) => elem.id === userId);
        const messages = [];
        if (allInfo.messages !== undefined) {
            allInfo.messages.map((elem) => {
                if (me[0].blokin.some((elem2) => elem2.id === elem.userId) === false)
                    messages.push(elem);
                return elem;
            });
        }
        return await { messages: messages, allUsers };
    }
    async recupAllListMessagesFromChannel(client, nameChan) {
        var _a, _b;
        const userId = this.chatService.getMyUserId(client.id);
        const infoChan = await this.chatService.getChannelInfoWithName(nameChan);
        const messageToChannel = [];
        let isUserInChannel = false;
        infoChan.user.map((elem) => {
            var _a;
            if (elem.id === userId && ((_a = elem.inChannel) === null || _a === void 0 ? void 0 : _a.some((elem2) => elem2.name === infoChan.name)))
                isUserInChannel = true;
            return elem;
        });
        if (isUserInChannel === false)
            return messageToChannel;
        let myUserChanBlock;
        (_a = infoChan.user) === null || _a === void 0 ? void 0 : _a.map((elem) => {
            if (userId === elem.id) {
                myUserChanBlock = [...elem.blokin];
            }
            return elem;
        });
        (_b = infoChan.messages) === null || _b === void 0 ? void 0 : _b.map((elem) => {
            var _a;
            let nameUser = "";
            (_a = infoChan.user) === null || _a === void 0 ? void 0 : _a.map((elem2) => {
                if (elem2.id === elem.userId)
                    nameUser = elem2.login;
            });
            if ((myUserChanBlock === null || myUserChanBlock === void 0 ? void 0 : myUserChanBlock.some((elem2) => elem2.id === elem.userId)) === false) {
                const tmpMessage = { nameChannel: infoChan.name, nameUser: nameUser, text: elem.content };
                messageToChannel.push(tmpMessage);
            }
            return elem;
        });
        return messageToChannel;
    }
    getAllChannelsFromFront(client) {
        this.chatService.getMyUserId(client.id);
    }
    async createChannelGroup(client, body) {
        await this.chatService.createChannelGroup(body.params.infoChannel, body.params.userId);
        return true;
    }
    async newChannelIsCreate(client, name) {
        client.join(name);
        const userId = this.chatService.getMyUserId(client.id);
        const allpublicChannel = await this.chatService.getAllPublicChannel(userId);
        const infoChanToSent = [];
        allpublicChannel.map((elem) => {
            const temp = {
                name: elem.name,
                type: elem.channelOption,
            };
            infoChanToSent.push(temp);
            return elem;
        });
        this.server.emit('newChannelIsCreatePublicFromServer', infoChanToSent);
        return infoChanToSent;
    }
    async giveMeAllChannelPublic(client) {
        const userId = this.chatService.getMyUserId(client.id);
        const allpublicChannel = await this.chatService.getAllPublicChannel(userId);
        const infoChanToSent = [];
        allpublicChannel.map((elem) => {
            var _a;
            let addToChannel = true;
            (_a = elem.ban) === null || _a === void 0 ? void 0 : _a.map((elem2) => {
                if (elem2.id === userId) {
                    addToChannel = false;
                }
                return elem2;
            });
            if (addToChannel === true) {
                const temp = {
                    name: elem.name,
                    type: elem.channelOption,
                };
                infoChanToSent.push(temp);
            }
            return elem;
        });
        return infoChanToSent;
    }
    async newChannelIsCreatePrivate(client) {
        const userId = this.chatService.getMyUserId(client.id);
        const allPrivateChannel = await this.chatService.getAllPrivateChannel(userId);
        allPrivateChannel.map((elem) => {
            client.join(elem.name);
            return elem;
        });
        const infoChanToSent = [];
        allPrivateChannel.map((elem) => {
            const temp = {
                name: elem.name,
                type: elem.channelOption,
            };
            infoChanToSent.push(temp);
            return elem;
        });
        return infoChanToSent;
    }
    async messageBoxChannelToServer(client, messageToChannel) {
        if (!messageToChannel.text.replace(/\s/g, '').length || messageToChannel.text.length > 5000)
            return;
        const userId = this.chatService.getMyUserId(client.id);
        const nameUser = this.chatService.getMyName(client.id);
        messageToChannel.nameUser = nameUser;
        await this.chatService.addUserToChannel(messageToChannel.nameChannel, userId);
        this.chatService.PostCreateMessageChannel(messageToChannel, userId);
        client.join(messageToChannel.nameChannel);
        this.server
            .to(messageToChannel.nameChannel)
            .emit('sendMessageToAllchanConnecteToRoom', messageToChannel);
    }
    async connectToRoomRight(client, name) {
        const userId = this.chatService.getMyUserId(client.id);
        const channelInfo = await this.chatService.getChannelWithName(name);
        const administrators = channelInfo.administrators;
        let isAdmin = false;
        for (const admin of administrators) {
            if (admin.id === userId)
                isAdmin = true;
        }
        if (isAdmin === true && channelInfo.owner === userId)
            return { admin: true, owner: true };
        else if (isAdmin === true)
            return { admin: true, owner: false };
    }
    async checkIfPublicChannelIsProtectedAndIfIAmOwner(client, chan) {
        const userId = this.chatService.getMyUserId(client.id);
        const channelInfo = await this.chatService.getChannelWithName(chan.name);
        if (channelInfo.Protected === false)
            return true;
        const administrators = channelInfo.administrators;
        for (const admin of administrators) {
            if (admin.id === userId)
                return true;
        }
        return false;
    }
    async checkIfUserHaveRightToConnectPass(client, channel) {
        const userId = this.chatService.getMyUserId(client.id);
        const channelInfo = await this.chatService.getChannelWithName(channel.name);
        const checkHash = await bcrypt.compare(channel.pass, channelInfo.Password);
        if (checkHash) {
            const checkIfInsideElement = this.chatService.playerAuthorize.findIndex((elem) => elem.userId === userId);
            if (checkIfInsideElement < 0) {
                const names = [];
                names.push(channel.name);
                this.chatService.playerAuthorize.push({
                    userId: userId,
                    nameChannel: names,
                });
            }
            else {
                for (const elem of this.chatService.playerAuthorize) {
                    if (elem.userId === userId) {
                        if (elem.nameChannel.findIndex((elem2) => elem2 === channel.name) < 0)
                            elem.nameChannel.push(channel.name);
                    }
                }
            }
            return true;
        }
    }
    async recupListAction(client, info) {
        var _a, _b;
        const action = info.action;
        const channel = info.elem;
        const userId = this.chatService.getMyUserId(client.id);
        if (action === `block`) {
            const allUsers = await this.chatService.getAllUsers();
            const createList = [];
            for (const user of allUsers)
                createList.push(user.login);
            return createList;
        }
        if (action === 'unBlock') {
            const allUsersBlock = await this.chatService.getAllUserBlockFromOneUser(userId);
            const createList = [];
            for (const userBlock of allUsersBlock)
                createList.push(userBlock.login);
            return createList;
        }
        if (action === 'addAdmin') {
            const allUsersFromChannel = await this.chatService.getAllUserFromChannel(channel.name);
            const allUsers = allUsersFromChannel.user;
            const filterUsers = allUsers === null || allUsers === void 0 ? void 0 : allUsers.filter((elem) => {
                for (const admin of allUsersFromChannel.administrators) {
                    if (admin.id === elem.id)
                        return false;
                }
                return true;
            });
            const createList = [];
            for (const lala of filterUsers)
                createList.push(lala.login);
            return createList;
        }
        if (action === 'removeAdmin') {
            const allUsersFromChannel = await this.chatService.getAllUserFromChannel(channel.name);
            const allUsers = allUsersFromChannel.user;
            const filterUsers = allUsers === null || allUsers === void 0 ? void 0 : allUsers.filter((elem) => {
                for (const admin of allUsersFromChannel.administrators) {
                    if (admin.id === elem.id && allUsersFromChannel.owner !== admin.id)
                        return true;
                }
                return false;
            });
            const createList = [];
            for (const lala of filterUsers)
                createList.push(lala.login);
            return createList;
        }
        if (action === 'mute') {
            const allUsersFromChannel = await this.chatService.getAllUserFromChannel(channel.name);
            const allUsers = allUsersFromChannel.user;
            let filterUsers;
            if (allUsersFromChannel.owner === userId) {
                filterUsers = allUsers === null || allUsers === void 0 ? void 0 : allUsers.filter((elem) => elem.id !== userId);
            }
            else {
                filterUsers = allUsers === null || allUsers === void 0 ? void 0 : allUsers.filter((elem) => {
                    for (const admin of allUsersFromChannel.administrators) {
                        if (admin.id === elem.id)
                            return false;
                        for (const mute of allUsersFromChannel.mutes) {
                            if (elem.id === mute.userId)
                                return false;
                        }
                    }
                    return true;
                });
            }
            const createList = [];
            for (const lala of filterUsers)
                createList.push(lala.login);
            return createList;
        }
        if (action === 'unMute') {
            const allUsersFromChannel = await this.chatService.getAllUserFromChannel(channel.name);
            const allMutes = allUsersFromChannel.mutes;
            const allUsers = allUsersFromChannel.user;
            const allAdmins = allUsersFromChannel.administrators;
            let filterUsers;
            if (allUsersFromChannel.owner === userId) {
                filterUsers = allUsers === null || allUsers === void 0 ? void 0 : allUsers.filter((elem) => {
                    for (const mute of allMutes) {
                        if (mute.userId === elem.id)
                            return true;
                    }
                    return false;
                });
            }
            else {
                filterUsers = allUsers === null || allUsers === void 0 ? void 0 : allUsers.filter((elem) => {
                    if (((allMutes === null || allMutes === void 0 ? void 0 : allMutes.some((elem2) => elem2.userId === elem.id)) === true) && ((allAdmins === null || allAdmins === void 0 ? void 0 : allAdmins.some((elem2) => elem2.id === elem.id)) === false))
                        return true;
                    return false;
                });
            }
            const createList = [];
            for (const lala of filterUsers)
                createList.push(lala.login);
            return createList;
        }
        if (action === 'ban') {
            const allUsersFromChannel = await this.chatService.getAllUserFromChannel(channel.name);
            const allBanFromChannel = allUsersFromChannel.ban;
            const allUsers = allUsersFromChannel.user;
            let filterUsers;
            if (userId === allUsersFromChannel.owner) {
                filterUsers = allUsers === null || allUsers === void 0 ? void 0 : allUsers.filter((elem) => {
                    if ((allBanFromChannel === null || allBanFromChannel === void 0 ? void 0 : allBanFromChannel.some((elem2) => elem2.id === elem.id)) === true)
                        return false;
                    if (elem.id === userId)
                        return false;
                    return true;
                });
            }
            else {
                filterUsers = allUsers === null || allUsers === void 0 ? void 0 : allUsers.filter((elem) => {
                    for (const admin of allUsersFromChannel.administrators) {
                        if (admin.id === elem.id)
                            return false;
                        for (const ban of allBanFromChannel) {
                            if (elem.id === ban.id)
                                return false;
                        }
                    }
                    return true;
                });
            }
            const createList = [];
            for (const lala of filterUsers)
                createList.push(lala.login);
            return createList;
        }
        if (action === 'unBan') {
            const allUsersFromChannel = await this.chatService.getAllUserFromChannel(channel.name);
            let filterUsers;
            if (allUsersFromChannel.owner === userId)
                filterUsers = (_a = allUsersFromChannel.ban) === null || _a === void 0 ? void 0 : _a.filter((elem) => (elem.id !== userId));
            else {
                filterUsers = ((_b = allUsersFromChannel.ban) === null || _b === void 0 ? void 0 : _b.filter((elem) => {
                    var _a;
                    if (((_a = allUsersFromChannel.administrators) === null || _a === void 0 ? void 0 : _a.some((elem2) => (elem2.id === elem.id))) === true)
                        return false;
                    return true;
                }));
            }
            const createList = [];
            for (const ban of filterUsers)
                createList.push(ban.login);
            return createList;
        }
        if (action === 'invite') {
            const infoChannel = await this.chatService.getAllUserFromChannel(channel.name);
            const allUsersFromChannel = infoChannel.user;
            const allUsers = await this.chatService.getAllUser();
            const filterUsers = allUsers === null || allUsers === void 0 ? void 0 : allUsers.filter((elem) => {
                if ((allUsersFromChannel === null || allUsersFromChannel === void 0 ? void 0 : allUsersFromChannel.some((elem2) => elem2.id === elem.id)) === true)
                    return false;
                return true;
            });
            const createList = [];
            for (const user of filterUsers)
                createList.push(user.login);
            return createList;
        }
        if (action === 'leave') {
            const infoChannel = await this.chatService.getAllUserFromChannel(channel.name);
            const allUsersInChannel = infoChannel.inChannel;
            const filterUsers = allUsersInChannel === null || allUsersInChannel === void 0 ? void 0 : allUsersInChannel.filter((elem) => elem.id !== userId);
            const createList = [];
            for (const user of filterUsers)
                createList.push(user.login);
            return createList;
        }
    }
    async listInfoOnWhoIalreadyBlock(client, info) {
        const userId = this.chatService.getMyUserId(client.id);
        const oneUser = await this.chatService.getOneUserBlokin(userId);
        const blokin = oneUser.blokin;
        const listUsersBlock = [];
        let name;
        blokin === null || blokin === void 0 ? void 0 : blokin.map((elem) => {
            name = elem.login;
            listUsersBlock.push(name);
            return elem;
        });
        return listUsersBlock;
    }
    async formToSendBlockUser(client, name) {
        const userId = this.chatService.getMyUserId(client.id);
        await this.chatService.blockUserWithName(userId, name);
        return 'ok';
    }
    async formToSendUnBlockUser(client, name) {
        const userId = this.chatService.getMyUserId(client.id);
        await this.chatService.unBlockUserWithName(userId, name);
        return 'ok';
    }
    async formToSendPassUser(client, arg) {
        const userId = this.chatService.getMyUserId(client.id);
        if (arg.value === 'remove')
            await this.chatService.updateChannelPass(userId, arg.name, arg.pass, 0);
        if (arg.value === 'add' || arg.value === 'change')
            await this.chatService.updateChannelPass(userId, arg.name, arg.pass, 1);
    }
    async formToSendAddAdmin(client, arg) {
        if ((await this.chatService.addAminToChannel(arg.nameUser, arg.nameChan)) ===
            false)
            return;
        const socketId = this.chatService.getSocketIdWithName(arg.nameUser);
        client.to(socketId).emit('IBecomeAdmin', true);
    }
    async formToSendRemoveAdmin(client, arg) {
        if ((await this.chatService.removeAminToChannel(arg.nameUser, arg.nameChan)) === false)
            return;
        const socketId = this.chatService.getSocketIdWithName(arg.nameUser);
        client.to(socketId).emit('IBecomeAdmin', false);
    }
    async formToSendMute(client, arg) {
        const socketId = this.chatService.getSocketIdWithName(arg.nameUser);
        const minutesToAdd = 1;
        const currentDate = new Date();
        const futureDate = new Date(currentDate.getTime() + minutesToAdd * 60000);
        const myUserId = this.chatService.getMyUserId(client.id);
        const muteUserChannel = await this.chatService.muteToChannel(arg.nameUser, arg.nameChan, futureDate, myUserId);
        if (muteUserChannel === undefined)
            return;
        client.to(socketId).emit('IamMute', true);
        setTimeout(() => {
            this.chatService.UnmuteToChannel(muteUserChannel);
            client.to(socketId).emit('IamMute', false);
        }, minutesToAdd * 60000);
    }
    async formToSendUnMute(client, arg) {
        const myUserId = this.chatService.getMyUserId(client.id);
        const user = await this.chatService.getOneUserWithName(arg.nameUser);
        if (myUserId === user.id)
            return;
        const allInfoChan = await this.chatService.getAllUserFromChannel(arg.nameChan);
        const mutesInChannel = allInfoChan.mutes;
        const allAdmin = allInfoChan.administrators;
        if (mutesInChannel !== undefined) {
            for (const mute of mutesInChannel) {
                if (mute.userId === user.id) {
                    const checkIfAdmin = allAdmin === null || allAdmin === void 0 ? void 0 : allAdmin.some((elem) => elem.id === user.id);
                    if ((checkIfAdmin === false) || (checkIfAdmin === true && myUserId === allInfoChan.owner)) {
                        await this.chatService.deleteUserMute(mute);
                        const socketId = this.chatService.getSocketIdWithName(arg.nameUser);
                        client.to(socketId).emit('IamMute', false);
                    }
                }
            }
        }
    }
    async checkIfIamImute(client, name_chan) {
        const myUserId = this.chatService.getMyUserId(client.id);
        const allInfoChan = await this.chatService.getAllUserFromChannel(name_chan);
        const mutesInChannel = allInfoChan.mutes;
        let lala = false;
        mutesInChannel === null || mutesInChannel === void 0 ? void 0 : mutesInChannel.map((elem) => {
            if (elem.userId === myUserId)
                lala = true;
            return elem;
        });
        return lala;
    }
    async checkIfLog(client, name_chan) {
        const myUserId = this.chatService.getMyUserId(client.id);
        const allInfoChan = await this.chatService.getAllUserFromChannel(name_chan);
        const inChannel = allInfoChan.inChannel;
        let lala = false;
        inChannel === null || inChannel === void 0 ? void 0 : inChannel.map((elem) => {
            if (elem.id === myUserId)
                lala = true;
            return elem;
        });
        return lala;
    }
    async formToSendBan(client, arg) {
        var _a;
        const myUserId = this.chatService.getMyUserId(client.id);
        const user = await this.chatService.getOneUserWithName(arg.nameUser);
        if (user === null)
            return;
        if (myUserId === user.id)
            return;
        const allInfoChan = await this.chatService.getAllUserFromChannel(arg.nameChan);
        if (myUserId !== allInfoChan.owner) {
            if (((_a = allInfoChan.administrators) === null || _a === void 0 ? void 0 : _a.some((elem) => elem.id === user.id)) === true)
                return;
        }
        if ((await this.chatService.banToChannel(arg.nameUser, arg.nameChan)) === false)
            return;
        const socketId = this.chatService.getSocketIdWithName(arg.nameUser);
        client.to(socketId).emit('IamBan', { nameChan: arg.nameChan, banned: true, type: arg.type });
    }
    async formToSendUnBan(client, arg) {
        var _a;
        const myUserId = this.chatService.getMyUserId(client.id);
        const user = await this.chatService.getOneUserWithName(arg.nameUser);
        if (user === null)
            return;
        if (myUserId === user.id)
            return;
        const allInfoChan = await this.chatService.getAllUserFromChannel(arg.nameChan);
        if (myUserId !== allInfoChan.owner) {
            if (((_a = allInfoChan.administrators) === null || _a === void 0 ? void 0 : _a.some((elem) => elem.id === user.id)) === true)
                return;
        }
        if ((await this.chatService.unBanToChannel(arg.nameUser, arg.nameChan)) === false)
            return;
        const socketId = this.chatService.getSocketIdWithName(arg.nameUser);
        client.to(socketId).emit('IamBan', { nameChan: arg.nameChan, banned: false, type: arg.type, });
    }
    async formToSendInvite(client, arg) {
        if ((await this.chatService.inviteToChannel(arg.nameUser, arg.nameChan)) ===
            false)
            return;
        const socketId = this.chatService.getSocketIdWithName(arg.nameUser);
        client
            .to(socketId)
            .emit('IamInvite', { nameChan: arg.nameChan, type: arg.type });
    }
    async formToSendLeaveGiveRight(client, arg) {
        if ((await this.chatService.LeaveGiveRight(arg.nameUser, arg.nameChan)) === false)
            return;
        const socketId = this.chatService.getSocketIdWithName(arg.nameUser);
        client.to(socketId).emit('changeRight');
        return true;
    }
    async leaveTheChannel(client, arg) {
        const myUserId = this.chatService.getMyUserId(client.id);
        const allUserOfChannel = await this.chatService.getAllUserFromChannel(arg.name);
        const allInChannel = allUserOfChannel.inChannel;
        if (allUserOfChannel.owner === myUserId) {
            if (allInChannel.length === 1) {
                await this.chatService.destroyTheChan(arg.name);
                this.server.emit('changePrivateChannel', arg);
                return;
            }
            else {
                return { changeOwner: true };
            }
        }
        if (allInChannel !== undefined) {
            for (const inChannel of allInChannel) {
                if (inChannel.id === myUserId) {
                    client.leave(arg.name);
                    await this.chatService.removeUserToChannel(arg.name, myUserId);
                    return { log: false };
                }
            }
        }
    }
    async enterTheChannel(client, arg) {
        const myUserId = this.chatService.getMyUserId(client.id);
        await this.chatService.addUserToChannel(arg.name, myUserId);
        client.join(arg.name);
        return { log: true };
    }
    async allMessagesDm(client, all) {
        const messages = await this.chatService.getAllMessagesDm(all.params);
        const users = await this.chatService.getAllUsers();
        return { messages: messages, users: users };
    }
    async getAllUsers(client) {
        const myUserId = this.chatService.getMyUserId(client.id);
        const myName = this.chatService.getMyName(client.id);
        const allUsers = await this.chatService.getAllUser();
        const allPlayerOffline = [];
        allUsers === null || allUsers === void 0 ? void 0 : allUsers.map((elem) => {
            const tmp = {
                myUserId: myUserId,
                myName: myName,
                notMySocketId: '',
                notMyName: elem.login,
                notMyUserId: elem.id,
                connect: false,
                open: false,
            };
            allPlayerOffline.push(tmp);
            return elem;
        });
        return allPlayerOffline;
    }
    getMynameOnBoxChannel(client) {
        return this.chatService.getMyName(client.id);
    }
    async sendInvitationToPlayPong(client, arg) {
        const myUserId = this.chatService.getMyUserId(client.id);
        const myName = this.chatService.getMyName(client.id);
        const notMySocketId = this.chatService.getSocketIdWithName(arg.notMyName);
        const notMyUserId = arg.notMyUserId;
        await client.to(notMySocketId).emit('receiveInvitationToPlayPong', {
            senderId: myUserId,
            senderName: myName,
            receiverId: notMyUserId,
            gameId: arg.gameId,
        });
    }
    async changeLoginName(client, name) {
        let newUserId;
        let newPerso = { name: name, socketId: [] };
        this.chatService.onlinePlayers.forEach((value, key) => {
            var _a;
            if (((_a = value.socketId) === null || _a === void 0 ? void 0 : _a.some((elem) => elem === client.id)) === true) {
                newUserId = key;
                newPerso.socketId = [...value.socketId];
            }
        });
        this.chatService.onlinePlayers.delete(newUserId);
        this.chatService.onlinePlayers.set(newUserId, newPerso);
        const transitString = JSON.stringify(Array.from(this.chatService.onlinePlayers));
        this.server.emit('someoneIsconnectedToServer', transitString);
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('messageToServer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Object)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('someoneIsConnected'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "someoneIsConnected", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(`giveMeInformationsToPlayers`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Object)
], ChatGateway.prototype, "informationPlayer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('blockDmUser'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "blockDmUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(`blockDmUser2`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "blockDmUser2", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unBlockDmUser'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "unBlockDmUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(`unBlockDmUser2`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "unBlockDmUser2", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(`getAllMessagesFromChannelDmFront`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "getAllMessagesFromChannelDmFront", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('recupAllListMessagesFromChannel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "recupAllListMessagesFromChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(`getAllChannelsFromFront`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "getAllChannelsFromFront", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('createChannelGroup'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "createChannelGroup", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(`newChannelIsCreatePublic`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "newChannelIsCreate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(`giveMeAllChannelPublic`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "giveMeAllChannelPublic", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(`newChannelIsCreatePrivate`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "newChannelIsCreatePrivate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(`messageBoxChannelToServer`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "messageBoxChannelToServer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(`connectToRoomChannel`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "connectToRoomRight", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(`checkIfPublicChannelIsProtectedAndIfIAmOwner`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "checkIfPublicChannelIsProtectedAndIfIAmOwner", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(`checkIfUserHaveRightToConnectPass`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "checkIfUserHaveRightToConnectPass", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(`recupListAction`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "recupListAction", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(`listInfoOnWhoIalreadyBlock`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "listInfoOnWhoIalreadyBlock", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('formToSendBlockUser'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "formToSendBlockUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('formToSendUnBlockUser'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "formToSendUnBlockUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('formToSendPassUser'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "formToSendPassUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('formToSendAddAdmin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "formToSendAddAdmin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('formToSendRemoveAdmin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "formToSendRemoveAdmin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('formToSendMute'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "formToSendMute", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('formToSendUnMute'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "formToSendUnMute", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('checkIfIamImute'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "checkIfIamImute", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('checkIfLog'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "checkIfLog", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('formToSendBan'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "formToSendBan", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('formToSendUnBan'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "formToSendUnBan", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('formToSendInvite'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "formToSendInvite", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('formToSendLeaveGiveRight'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "formToSendLeaveGiveRight", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveTheChannel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "leaveTheChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('enterTheChannel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "enterTheChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('allMessagesInDm'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "allMessagesDm", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('getAllUsersDmOffLine'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "getAllUsers", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('getMynameOnBoxChannel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", String)
], ChatGateway.prototype, "getMynameOnBoxChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendInvitationToPlayPong'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "sendInvitationToPlayPong", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('changeLoginName'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "changeLoginName", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*', transports: ['websocket', 'polling'], methods: ["GET", "POST"], credentials: true }, namespace: 'chat', allowEIO4: true }),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map