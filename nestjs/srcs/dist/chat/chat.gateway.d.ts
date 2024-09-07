import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AllPublicChannels, AllPrivateChannels, MessageChannelInterface } from './interfaces/chat.interface';
import { ChatService } from './chat.service';
export declare class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    constructor(chatService: ChatService);
    server: Server;
    private readonly logger;
    noneAfunction(): void;
    afterInit(server: Server): void;
    handleConnection(client: Socket, ...args: any[]): any;
    handleDisconnect(client: Socket): any;
    handleMessage(client: Socket, message: {
        MyName: string;
        notMyName: string;
        text: string;
        notMyId: string;
        isItMine: boolean;
        myUserId: Number;
        notMyUserId: Number;
    }): any;
    handleJoinRoom(client: Socket, room: string): void;
    handleLeaveRoom(client: Socket, room: string): void;
    someoneIsConnected(client: Socket): Promise<void>;
    informationPlayer(client: Socket, temp: any): any;
    blockDmUser(client: Socket, body: any): Promise<string>;
    blockDmUser2(client: Socket, temp: any): void;
    unBlockDmUser(client: Socket, body: any): Promise<string>;
    unBlockDmUser2(client: Socket, temp: any): void;
    getAllMessagesFromChannelDmFront(client: Socket, all: any): Promise<{
        messages: any[];
        allUsers: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            login: string;
            email: string;
            email_is_ok: boolean;
            hash: string;
            image_url: string;
            gone_through_login: boolean;
            gone_through_register: boolean;
            is_online: boolean;
            auth2f_enabled: boolean;
            is_ongame: boolean;
            victories: number;
            defeats: number;
            nb_of_games: number;
        }[];
    }>;
    recupAllListMessagesFromChannel(client: Socket, nameChan: string): Promise<MessageChannelInterface[]>;
    getAllChannelsFromFront(client: Socket): void;
    createChannelGroup(client: Socket, body: any): Promise<boolean>;
    newChannelIsCreate(client: Socket, name: string): Promise<AllPublicChannels[]>;
    giveMeAllChannelPublic(client: Socket): Promise<AllPublicChannels[]>;
    newChannelIsCreatePrivate(client: Socket): Promise<AllPrivateChannels[]>;
    messageBoxChannelToServer(client: Socket, messageToChannel: MessageChannelInterface): Promise<void>;
    connectToRoomRight(client: Socket, name: string): Promise<{
        admin: boolean;
        owner: boolean;
    }>;
    checkIfPublicChannelIsProtectedAndIfIAmOwner(client: Socket, chan: any): Promise<boolean>;
    checkIfUserHaveRightToConnectPass(client: Socket, channel: any): Promise<boolean>;
    recupListAction(client: Socket, info: any): Promise<string[]>;
    listInfoOnWhoIalreadyBlock(client: Socket, info: any): Promise<string[]>;
    formToSendBlockUser(client: Socket, name: string): Promise<string>;
    formToSendUnBlockUser(client: Socket, name: string): Promise<string>;
    formToSendPassUser(client: Socket, arg: any): Promise<void>;
    formToSendAddAdmin(client: Socket, arg: any): Promise<void>;
    formToSendRemoveAdmin(client: Socket, arg: any): Promise<void>;
    formToSendMute(client: Socket, arg: any): Promise<void>;
    formToSendUnMute(client: Socket, arg: any): Promise<void>;
    checkIfIamImute(client: Socket, name_chan: string): Promise<boolean>;
    checkIfLog(client: Socket, name_chan: string): Promise<boolean>;
    formToSendBan(client: Socket, arg: any): Promise<void>;
    formToSendUnBan(client: Socket, arg: any): Promise<void>;
    formToSendInvite(client: Socket, arg: any): Promise<void>;
    formToSendLeaveGiveRight(client: Socket, arg: any): Promise<boolean>;
    leaveTheChannel(client: Socket, arg: any): Promise<{
        changeOwner: boolean;
        log?: undefined;
    } | {
        log: boolean;
        changeOwner?: undefined;
    }>;
    enterTheChannel(client: Socket, arg: any): Promise<{
        log: boolean;
    }>;
    allMessagesDm(client: Socket, all: any): Promise<{
        messages: {
            user: {
                id: number;
                login: string;
                blockBy: {
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    login: string;
                    email: string;
                    email_is_ok: boolean;
                    hash: string;
                    image_url: string;
                    gone_through_login: boolean;
                    gone_through_register: boolean;
                    is_online: boolean;
                    auth2f_enabled: boolean;
                    is_ongame: boolean;
                    victories: number;
                    defeats: number;
                    nb_of_games: number;
                }[];
                blokin: {
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    login: string;
                    email: string;
                    email_is_ok: boolean;
                    hash: string;
                    image_url: string;
                    gone_through_login: boolean;
                    gone_through_register: boolean;
                    is_online: boolean;
                    auth2f_enabled: boolean;
                    is_ongame: boolean;
                    victories: number;
                    defeats: number;
                    nb_of_games: number;
                }[];
            }[];
            messages: {
                id: number;
                content: string;
                channelId: number;
                userId: number;
                createdAt: Date;
            }[];
        } & {
            id: number;
            name: string;
            channelOption: import(".prisma/client").$Enums.ChannelOption;
            owner: number;
            Protected: boolean;
            Password: string;
            createdAt: Date;
        };
        users: ({
            channels: {
                id: number;
                name: string;
                channelOption: import(".prisma/client").$Enums.ChannelOption;
                owner: number;
                Protected: boolean;
                Password: string;
                createdAt: Date;
            }[];
            blockBy: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                login: string;
                email: string;
                email_is_ok: boolean;
                hash: string;
                image_url: string;
                gone_through_login: boolean;
                gone_through_register: boolean;
                is_online: boolean;
                auth2f_enabled: boolean;
                is_ongame: boolean;
                victories: number;
                defeats: number;
                nb_of_games: number;
            }[];
            blokin: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                login: string;
                email: string;
                email_is_ok: boolean;
                hash: string;
                image_url: string;
                gone_through_login: boolean;
                gone_through_register: boolean;
                is_online: boolean;
                auth2f_enabled: boolean;
                is_ongame: boolean;
                victories: number;
                defeats: number;
                nb_of_games: number;
            }[];
            channelAdministrators: {
                id: number;
                name: string;
                channelOption: import(".prisma/client").$Enums.ChannelOption;
                owner: number;
                Protected: boolean;
                Password: string;
                createdAt: Date;
            }[];
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            login: string;
            email: string;
            email_is_ok: boolean;
            hash: string;
            image_url: string;
            gone_through_login: boolean;
            gone_through_register: boolean;
            is_online: boolean;
            auth2f_enabled: boolean;
            is_ongame: boolean;
            victories: number;
            defeats: number;
            nb_of_games: number;
        })[];
    }>;
    getAllUsers(client: Socket): Promise<any[]>;
    getMynameOnBoxChannel(client: Socket): string;
    sendInvitationToPlayPong(client: Socket, arg: any): Promise<void>;
    changeLoginName(client: Socket, name: string): Promise<void>;
}
