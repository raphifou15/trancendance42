import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  WsResponse,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  ListUsersConnected,
  Info,
  Perso,
  AllPublicChannels,
  AllPrivateChannels,
  MessageChannelInterface,
} from './interfaces/chat.interface';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { flatten, Logger } from '@nestjs/common';
import { emit } from 'process';
import { elementAt, filter } from 'rxjs';
// import { Index } from 'typeorm';
import { info } from 'console';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';



@WebSocketGateway({ cors: { origin: '*', transports: ['websocket', 'polling'],methods: ["GET", "POST"], credentials: true}, namespace: 'chat',allowEIO4: true})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly chatService: ChatService) {}
  @WebSocketServer() server: Server; //envoyer a tous les clients

  private readonly logger: Logger = new Logger('ChatGateway');
  // private readonly onlinePlayers = new Map<Number, Perso>();//le premier element est le nom mais deviendra le userid plus tard // id de la socket et name du joueur. // changer car l'id de la socket peut changer
  // private allInfos:Info[] = []; // ici je creer un tableau de info je trouve que c'est plus simple a manipuler en js;
  // private   tabSocket:Socket[] = [];

  noneAfunction() {}

  afterInit(server: Server) {
    // this.logger.log('initialisation du chat');
  }

  handleConnection(client: Socket, ...args: any[]): any {

// this.logger.log(`client connected: ${client.id}`);

      // console.log(client.handshake.auth);
      if (this.chatService.getAuthorisation(client.handshake.auth) === false){
        client.emit("errorSocket");
        // client.disconnect();
      }

    // console.log(this.chatService.onlinePlayers);
    // client.disconnect();
    // return;
    // checker ici plus tard la connection d'un vrais client avec l'authentification
  }

  

  handleDisconnect(client: Socket): any {
    // this.logger.log(`client disconnected: ${client.id}`);
    this.chatService.onlinePlayers.forEach((value, key, map) => {
      value.socketId = value.socketId?.filter((elem) => elem !== client.id);
      if (value.socketId.length <= 0) map.delete(key);
    });
    this.chatService.onlinePlayers.delete(parseInt(client.id));
    const it = this.chatService.onlinePlayers[Symbol.iterator]();
    // for (const item of it)
    // this.logger.log(`map:::: clientId:${item[0]} name:${item[1]}`);
    // this.chatService.allInfos.map(elem => this.logger.log(elem.myName));
    const index = this.chatService.allInfos.findIndex(
      (elem) => elem.notMySocketId !== client.id,
    );
    this.chatService.allInfos.splice(index, 1);
    // this.chatService.allInfos.map(elem => this.logger.log(`${elem.myName} ------`));
    this.server.emit(`someoneDisconnectedFromServer`, client.id);
  }

  @SubscribeMessage('messageToServer')
  handleMessage(
    client: Socket,
    message: {
      MyName: string;
      notMyName: string;
      text: string;
      notMyId: string;
      isItMine: boolean;
      myUserId: Number;
      notMyUserId: Number;
    },
  ): any {
    // this.logger.log(`lala ${message.notMyName}`);
    // this.logger.log(`userId ${message.myUserId} notMyUserId ${message.notMyUserId}`)
    if (!message.text.replace(/\s/g, '').length || message.text.length > 5000)
            return ;
    this.chatService.PostCreateDmMessage(message); // besoin de 2 id_user

    const myName = this.chatService.getMyName(client.id);
    const notMySocketId = this.chatService.getSocketIdWithName(
      message.notMyName,
    );
    const mySocketId = this.chatService.getSocketIdWithName(myName);

    // if (client.id !== message.notMyId){
    //   console.log(message.notMyId);

    // }
    notMySocketId?.map((elem) => {
      client.to(elem).emit('private message', message);
    });

    // mySocketId?.map((elem) => {
    //   if (client.id !== elem) client.to(elem).emit('private message', message);
    // });
    message.isItMine = true;
    return message;
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    client.emit('joinedRoom', room);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, room: string) {
    client.join(room);
    client.emit('leftRoom', room);
  }

  @SubscribeMessage('someoneIsConnected')
  async someoneIsConnected(@ConnectedSocket() client: Socket) {
    // if (this.chatService.getAuthorisation(client.handshake.auth) === false)
    //   return;
    const tmp = client.handshake.auth;
    let elementToChange: boolean = false;
    this.chatService.onlinePlayers.forEach((value: Perso, key: Number) => {
      if (value.name === tmp.login) {
        if (value.socketId?.some((elem) => elem === client.id) === false)
          value.socketId.push(client.id);
        elementToChange = true;
      }
    });
    if (elementToChange === false)
      this.chatService.onlinePlayers.set(parseInt(tmp.idUser), {
        name: tmp.login,
        socketId: [client.id],
      }); // push dans map onlinePlayer <idUser><Perso{name, socketId}>

    const it = this.chatService.onlinePlayers[Symbol.iterator]();
    // for (const item of it)
    // this.logger.log(`map:::: userId:${item[0]} perso: name${item[1].name} socketId${item[1].socketId}`);
    const transitString = JSON.stringify(
      Array.from(this.chatService.onlinePlayers),
    );
    this.server.emit('someoneIsconnectedToServer', transitString);
  }


  @SubscribeMessage(`giveMeInformationsToPlayers`)
  informationPlayer(client: Socket, temp: any): any {
    const info: Info[] = [];
    // this.logger.log(`idUser =${temp.idUser}  login =${temp.login}`);
    this.chatService.onlinePlayers.forEach((value, key) => {
      info.push({
        mySocketId: client.id,
        myUserId: temp.idUser,
        myName: temp.login,
        notMySocketId: value.socketId[0],
        notMyName: value.name,
        notMyUserId: key,
      });
      // this.logger.log(`value ${value} key ${key}`)
    });
    this.chatService.allInfos = [...info];
    return info;
  }

  @SubscribeMessage('blockDmUser')
  async blockDmUser(client:Socket, body:any) {
    await this.chatService.blockDmUser(body.params.userId, body.params.notMyUserId)
    return "ok";
  }


  @SubscribeMessage(`blockDmUser2`)
  blockDmUser2(client: Socket, temp: any) {
    const elem = this.chatService.onlinePlayers.get(temp);
    try {
      client.to(elem.socketId.toString()).emit('blockDmUserFront');
    } catch {}
  }

  @SubscribeMessage('unBlockDmUser')
  async unBlockDmUser(client:Socket, body:any) {
    await this.chatService.unBlockDmUser(body.params.userId, body.params.notMyUserId)
    return "ok";
  }

  @SubscribeMessage(`unBlockDmUser2`)
  unBlockDmUser2(client: Socket, temp: any) {
    const elem = this.chatService.onlinePlayers.get(temp);
    try {
      client.to(elem.socketId.toString()).emit('unBlockDmUserFront');
    } catch {}
  }

  @SubscribeMessage(`getAllMessagesFromChannelDmFront`)
  async getAllMessagesFromChannelDmFront(client: Socket, all: any) {
    const allInfo = await this.chatService.getAllMessagesDm(all.params);
    if (allInfo === null || allInfo === undefined) return;
    const allUsers = await this.chatService.getAllUsersClean();
    const userId = this.chatService.getMyUserId(client.id);
    const me = allInfo.user?.filter((elem) => elem.id === userId);
    const messages: any[] = [];
    if (allInfo.messages !== undefined) {
      allInfo.messages.map((elem) => {
        if (me[0].blokin.some((elem2) => elem2.id === elem.userId) === false)
          messages.push(elem);
        return elem;
      });
    }
    return await { messages: messages, allUsers };
  }

  @SubscribeMessage('recupAllListMessagesFromChannel')
  async recupAllListMessagesFromChannel(client:Socket, nameChan:string){
    const userId = this.chatService.getMyUserId(client.id);
    const infoChan = await this.chatService.getChannelInfoWithName(nameChan);
    const messageToChannel:MessageChannelInterface[] = [];
    let isUserInChannel:boolean = false;
    infoChan.user.map((elem) => {
      if (elem.id === userId && elem.inChannel?.some((elem2) => elem2.name === infoChan.name))
        isUserInChannel = true;
      return elem;
    })
    if (isUserInChannel === false)
      return messageToChannel;
    let   myUserChanBlock:User[];

    infoChan.user?.map((elem) => {
      if (userId === elem.id){      
        myUserChanBlock = [...elem.blokin];
      }
      return elem;
    })

    infoChan.messages?.map((elem) => {
      let nameUser = "";
      infoChan.user?.map((elem2) => {
        if (elem2.id === elem.userId)
          nameUser = elem2.login;
      })
      if (myUserChanBlock?.some((elem2) => elem2.id === elem.userId) === false){
        const tmpMessage:MessageChannelInterface = {nameChannel:infoChan.name, nameUser:nameUser, text:elem.content}
        messageToChannel.push(tmpMessage);
      }
      return elem;
    })
    return messageToChannel;
  }

  @SubscribeMessage(`getAllChannelsFromFront`)
  getAllChannelsFromFront(client: Socket) {
    this.chatService.getMyUserId(client.id);
  }

  @SubscribeMessage('createChannelGroup')
  async createChannelGroup(client:Socket, body:any){
    // faire une verif pour savoir si la personne qui fait la requete est bien elle,(body.params.userId, and send socketid);
    // on peut faire un emit a la personne pour verifier si c'est la bonne personne.
    // puis si le ping pong se fait c'est que la personne est la bonne et quel peu effectuer un post dans la db.
    await this.chatService.createChannelGroup(body.params.infoChannel, body.params.userId);
    // console.log(body);
    return true;
  }


  @SubscribeMessage(`newChannelIsCreatePublic`)
  async newChannelIsCreate(client: Socket, name: string) {
    // console.log("le chan creer est public");
    // console.log(name);
    client.join(name);
    const userId: number = this.chatService.getMyUserId(client.id);
    const allpublicChannel = await this.chatService.getAllPublicChannel(userId);
    const infoChanToSent: AllPublicChannels[] = [];
    allpublicChannel.map((elem) => {
      const temp: AllPublicChannels = {
        name: elem.name,
        type: elem.channelOption,
      };
      infoChanToSent.push(temp);
      return elem;
    });
    this.server.emit('newChannelIsCreatePublicFromServer', infoChanToSent);
    return infoChanToSent;
  }

  @SubscribeMessage(`giveMeAllChannelPublic`)
  async giveMeAllChannelPublic(client: Socket) {
    const userId: number = this.chatService.getMyUserId(client.id);
    const allpublicChannel = await this.chatService.getAllPublicChannel(userId);
    const infoChanToSent: AllPublicChannels[] = [];
    allpublicChannel.map((elem) => {
      let addToChannel = true;
      elem.ban?.map((elem2) => {
        if (elem2.id === userId) {
          addToChannel = false;
        }
        return elem2;
      });
      if (addToChannel === true) {
        const temp: AllPublicChannels = {
          name: elem.name,
          type: elem.channelOption,
        };
        infoChanToSent.push(temp);
      }
      return elem;
    });

    return infoChanToSent;
  }

  @SubscribeMessage(`newChannelIsCreatePrivate`)
  async newChannelIsCreatePrivate(client: Socket) {
    const userId = this.chatService.getMyUserId(client.id);
    const allPrivateChannel = await this.chatService.getAllPrivateChannel(
      userId,
    );
    allPrivateChannel.map((elem) => {
      client.join(elem.name);
      return elem;
    });
    const infoChanToSent: AllPrivateChannels[] = [];
    allPrivateChannel.map((elem) => {
      const temp: AllPrivateChannels = {
        name: elem.name,
        type: elem.channelOption,
      };
      infoChanToSent.push(temp);
      return elem;
    });
    return infoChanToSent;
  }

  // envoyer les messages aux differrents channel connectter.

  @SubscribeMessage(`messageBoxChannelToServer`)
  async messageBoxChannelToServer(
    client: Socket,
    messageToChannel: MessageChannelInterface,
  ) {
    if (!messageToChannel.text.replace(/\s/g, '').length || messageToChannel.text.length > 5000)
      return ;
    const userId = this.chatService.getMyUserId(client.id);
    const nameUser = this.chatService.getMyName(client.id);
    messageToChannel.nameUser = nameUser;
    await this.chatService.addUserToChannel(
      messageToChannel.nameChannel,
      userId,
    );

    this.chatService.PostCreateMessageChannel(messageToChannel, userId);
    client.join(messageToChannel.nameChannel);
    this.server
      .to(messageToChannel.nameChannel)
      .emit('sendMessageToAllchanConnecteToRoom', messageToChannel);
  }

  @SubscribeMessage(`connectToRoomChannel`)
  async connectToRoomRight(client: Socket, name: string) {
    const userId = this.chatService.getMyUserId(client.id);
    const channelInfo: any = await this.chatService.getChannelWithName(name);
    const administrators = channelInfo.administrators;
    let isAdmin: boolean = false;
    for (const admin of administrators) {
      if (admin.id === userId) isAdmin = true;
    }
    //client.join(name);
    if (isAdmin === true && channelInfo.owner === userId)
      return { admin: true, owner: true };
    else if (isAdmin === true) return { admin: true, owner: false };
  }

  @SubscribeMessage(`checkIfPublicChannelIsProtectedAndIfIAmOwner`)
  async checkIfPublicChannelIsProtectedAndIfIAmOwner(
    client: Socket,
    chan: any,
  ) {
    const userId = this.chatService.getMyUserId(client.id);
    const channelInfo: any = await this.chatService.getChannelWithName(
      chan.name,
    );
    if (channelInfo.Protected === false) return true;
    const administrators = channelInfo.administrators;
    for (const admin of administrators) {
      if (admin.id === userId) return true;
    }
    return false;
  }

  @SubscribeMessage(`checkIfUserHaveRightToConnectPass`)
  async checkIfUserHaveRightToConnectPass(client: Socket, channel: any) {
    // console.log("je passe par ici");
    const userId = this.chatService.getMyUserId(client.id);
    const channelInfo: any = await this.chatService.getChannelWithName(
      channel.name,
    );
    const checkHash: boolean = await bcrypt.compare(
      channel.pass,
      channelInfo.Password,
    );
    if (checkHash) {
      const checkIfInsideElement = this.chatService.playerAuthorize.findIndex(
        (elem) => elem.userId === userId,
      );
      if (checkIfInsideElement < 0) {
        const names: string[] = [];
        names.push(channel.name);
        this.chatService.playerAuthorize.push({
          userId: userId,
          nameChannel: names,
        });
      } else {
        for (const elem of this.chatService.playerAuthorize) {
          if (elem.userId === userId) {
            if (
              elem.nameChannel.findIndex((elem2) => elem2 === channel.name) < 0
            )
              elem.nameChannel.push(channel.name);
          }
        }
      }
      return true;
    }
  }

  @SubscribeMessage(`recupListAction`)
  async recupListAction(client: Socket, info: any) {
    const action: string = info.action;
    const channel: AllPrivateChannels | AllPublicChannels = info.elem;
    const userId = this.chatService.getMyUserId(client.id);

    if (action === `block`) {
      const allUsers = await this.chatService.getAllUsers();
      const createList: string[] = [];
      for (const user of allUsers) createList.push(user.login);
      return createList;
    }
    if (action === 'unBlock') {
      const allUsersBlock = await this.chatService.getAllUserBlockFromOneUser(
        userId,
      );
      const createList: string[] = [];
      for (const userBlock of allUsersBlock) createList.push(userBlock.login);
      return createList;
    }
    if (action === 'addAdmin') {
      const allUsersFromChannel = await this.chatService.getAllUserFromChannel(
        channel.name,
      );
      const allUsers = allUsersFromChannel.user;
      const filterUsers = allUsers?.filter((elem) => {
        for (const admin of allUsersFromChannel.administrators) {
          if (admin.id === elem.id) return false;
        }
        return true;
      });
      const createList: string[] = [];
      for (const lala of filterUsers) createList.push(lala.login);
      return createList;
    }
    if (action === 'removeAdmin') {
      const allUsersFromChannel = await this.chatService.getAllUserFromChannel(
        channel.name,
      );
      const allUsers = allUsersFromChannel.user;
      const filterUsers = allUsers?.filter((elem) => {
        for (const admin of allUsersFromChannel.administrators) {
          if (admin.id === elem.id && allUsersFromChannel.owner !== admin.id)
            return true;
        }
        return false;
      });
      const createList: string[] = [];
      for (const lala of filterUsers) createList.push(lala.login);
      return createList;
    }
    if (action === 'mute') {
      const allUsersFromChannel = await this.chatService.getAllUserFromChannel(channel.name,);
      const allUsers = allUsersFromChannel.user;
      let filterUsers:any;
      if (allUsersFromChannel.owner === userId){
        filterUsers = allUsers?.filter((elem) => elem.id !== userId)
      }
      else{
        filterUsers = allUsers?.filter((elem) => {
        for (const admin of allUsersFromChannel.administrators) {
          if (admin.id === elem.id) return false;
          for (const mute of allUsersFromChannel.mutes) {
            if (elem.id === mute.userId) return false;
          }
        }
        return true;
      });
    }
      const createList: string[] = [];
      for (const lala of filterUsers)
        createList.push(lala.login);
      return createList;
    }
    if (action === 'unMute') {
      const allUsersFromChannel = await this.chatService.getAllUserFromChannel(channel.name,);

      const allMutes = allUsersFromChannel.mutes;
      const allUsers = allUsersFromChannel.user;
      const allAdmins = allUsersFromChannel.administrators;
      let filterUsers:any;
      if (allUsersFromChannel.owner === userId){
        filterUsers = allUsers?.filter((elem) => {
          for (const mute of allMutes) {
            if (mute.userId === elem.id) return true;
          }
          return false;
        });
      } else {
        filterUsers = allUsers?.filter((elem) => {
          if ((allMutes?.some((elem2) => elem2.userId === elem.id) === true ) && (allAdmins?.some((elem2) => elem2.id === elem.id) === false))
            return true;
          return false;
        })
      }
      const createList: string[] = [];
      for (const lala of filterUsers) createList.push(lala.login);
      return createList;
    }

    if (action === 'ban') {
      const allUsersFromChannel = await this.chatService.getAllUserFromChannel(channel.name);
      const allBanFromChannel = allUsersFromChannel.ban;
      const allUsers = allUsersFromChannel.user;
      let filterUsers:any
      if (userId === allUsersFromChannel.owner){
        filterUsers = allUsers?.filter((elem) => {
          if (allBanFromChannel?.some((elem2) => elem2.id === elem.id) === true)
            return false;
          if (elem.id === userId)
            return false;
          return true;
        })
      } else{
        filterUsers = allUsers?.filter((elem) => {
          for (const admin of allUsersFromChannel.administrators) {
            if (admin.id === elem.id) return false;
            for (const ban of allBanFromChannel) {
              if (elem.id === ban.id) return false;
            }
          }
          return true;
        });
      }
      const createList: string[] = [];
      for (const lala of filterUsers) createList.push(lala.login);
      return createList;
    }
    if (action === 'unBan') {
      const allUsersFromChannel = await this.chatService.getAllUserFromChannel(channel.name);

      let filterUsers:any;
      if (allUsersFromChannel.owner === userId)
        filterUsers = allUsersFromChannel.ban?.filter((elem) => (elem.id !== userId));
      else{
        filterUsers = (allUsersFromChannel.ban?.filter((elem) => {
          if (allUsersFromChannel.administrators?.some((elem2) => (elem2.id === elem.id)) === true)
            return false;
          return true;
        }))
      }
      const createList: string[] = [];
      for (const ban of filterUsers)
        createList.push(ban.login);
      return createList;
    }

    if (action === 'invite') {
      const infoChannel = await this.chatService.getAllUserFromChannel(
        channel.name,
      );
      const allUsersFromChannel = infoChannel.user;
      const allUsers = await this.chatService.getAllUser();
      const filterUsers = allUsers?.filter((elem) => {
        if (allUsersFromChannel?.some((elem2) => elem2.id === elem.id) === true)
          return false;
        return true;
      });
      const createList: string[] = [];
      for (const user of filterUsers) createList.push(user.login);
      return createList;
    }

    if (action === 'leave') {
      const infoChannel = await this.chatService.getAllUserFromChannel(
        channel.name,
      );
      const allUsersInChannel = infoChannel.inChannel;
      const filterUsers = allUsersInChannel?.filter(
        (elem) => elem.id !== userId,
      );
      const createList: string[] = [];
      for (const user of filterUsers) createList.push(user.login);
      return createList;
    }
  }

  @SubscribeMessage(`listInfoOnWhoIalreadyBlock`)
  async listInfoOnWhoIalreadyBlock(client: Socket, info: any) {
    const userId = this.chatService.getMyUserId(client.id);
    const oneUser = await this.chatService.getOneUserBlokin(userId);
    const blokin = oneUser.blokin;
    const listUsersBlock: string[] = [];
    let name: string;
    blokin?.map((elem) => {
      name = elem.login;
      listUsersBlock.push(name);
      return elem;
    });
    return listUsersBlock;
  }

  @SubscribeMessage('formToSendBlockUser')
  async formToSendBlockUser(client: Socket, name: string) {
    const userId = this.chatService.getMyUserId(client.id);
    await this.chatService.blockUserWithName(userId, name);
    return 'ok';
  }

  @SubscribeMessage('formToSendUnBlockUser')
  async formToSendUnBlockUser(client: Socket, name: string) {
    const userId = this.chatService.getMyUserId(client.id);
    await this.chatService.unBlockUserWithName(userId, name);
    return 'ok';
  }

  @SubscribeMessage('formToSendPassUser')
  async formToSendPassUser(client: Socket, arg: any) {
    const userId = this.chatService.getMyUserId(client.id);
    if (arg.value === 'remove')
      await this.chatService.updateChannelPass(userId, arg.name, arg.pass, 0);
    if (arg.value === 'add' || arg.value === 'change')
      await this.chatService.updateChannelPass(userId, arg.name, arg.pass, 1);
  }

  @SubscribeMessage('formToSendAddAdmin')
  async formToSendAddAdmin(client: Socket, arg: any) {
    if (
      (await this.chatService.addAminToChannel(arg.nameUser, arg.nameChan)) ===
      false
    )
      return;
    const socketId = this.chatService.getSocketIdWithName(arg.nameUser);
    client.to(socketId).emit('IBecomeAdmin', true);
  }

  @SubscribeMessage('formToSendRemoveAdmin')
  async formToSendRemoveAdmin(client: Socket, arg: any) {
    if (
      (await this.chatService.removeAminToChannel(
        arg.nameUser,
        arg.nameChan,
      )) === false
    )
      return;
    const socketId = this.chatService.getSocketIdWithName(arg.nameUser);
    client.to(socketId).emit('IBecomeAdmin', false);
  }

  @SubscribeMessage('formToSendMute')
  async formToSendMute(client: Socket, arg: any) {
    const socketId = this.chatService.getSocketIdWithName(arg.nameUser);
    const minutesToAdd = 1;
    const currentDate = new Date();
    const futureDate = new Date(currentDate.getTime() + minutesToAdd * 60000);
    const myUserId = this.chatService.getMyUserId(client.id);

    const muteUserChannel: any = await this.chatService.muteToChannel(arg.nameUser, arg.nameChan, futureDate, myUserId);
    if (muteUserChannel === undefined) return;
    client.to(socketId).emit('IamMute', true);
    setTimeout(() => {
      this.chatService.UnmuteToChannel(muteUserChannel);
      client.to(socketId).emit('IamMute', false);
    }, minutesToAdd * 60000);
  }

  @SubscribeMessage('formToSendUnMute')
  async formToSendUnMute(client: Socket, arg: any) {
    const myUserId = this.chatService.getMyUserId(client.id);
    const user = await this.chatService.getOneUserWithName(arg.nameUser);
    if (myUserId === user.id)
      return;
    const allInfoChan = await this.chatService.getAllUserFromChannel(arg.nameChan);
    const mutesInChannel: any = allInfoChan.mutes;
    const allAdmin = allInfoChan.administrators;
    if (mutesInChannel !== undefined){
      for (const mute of mutesInChannel) {
        if (mute.userId === user.id) {
          const checkIfAdmin:boolean = allAdmin?.some((elem) => elem.id === user.id);
          if ( (checkIfAdmin === false) || (checkIfAdmin === true && myUserId === allInfoChan.owner)){
            await this.chatService.deleteUserMute(mute);
            const socketId = this.chatService.getSocketIdWithName(arg.nameUser);
            client.to(socketId).emit('IamMute', false);
          }
        }
      }
    }
  }

  @SubscribeMessage('checkIfIamImute')
  async checkIfIamImute(client: Socket, name_chan: string) {
    const myUserId = this.chatService.getMyUserId(client.id);
    const allInfoChan: any = await this.chatService.getAllUserFromChannel(
      name_chan,
    );
    const mutesInChannel: any = allInfoChan.mutes;
    let lala: boolean = false;
    mutesInChannel?.map((elem) => {
      if (elem.userId === myUserId) lala = true;
      return elem;
    });
    return lala;
  }

  @SubscribeMessage('checkIfLog')
  async checkIfLog(client: Socket, name_chan: string) {
    const myUserId = this.chatService.getMyUserId(client.id);
    const allInfoChan: any = await this.chatService.getAllUserFromChannel(name_chan);
    const inChannel = allInfoChan.inChannel;
    let lala: boolean = false;
    inChannel?.map((elem) => {
      if (elem.id === myUserId) lala = true;
      return elem;
    });
    return lala;
  }

  @SubscribeMessage('formToSendBan')
  async formToSendBan(client: Socket, arg: any) {
    const myUserId = this.chatService.getMyUserId(client.id);
    const user = await this.chatService.getOneUserWithName(arg.nameUser);
    if (user === null)
      return;
    if (myUserId === user.id)
      return;
    const allInfoChan = await this.chatService.getAllUserFromChannel(arg.nameChan);
    if (myUserId !== allInfoChan.owner){
      if (allInfoChan.administrators?.some((elem) => elem.id === user.id) === true)
        return;
    }
    if ((await this.chatService.banToChannel(arg.nameUser, arg.nameChan)) === false)
      return;
    const socketId = this.chatService.getSocketIdWithName(arg.nameUser);
    client.to(socketId).emit('IamBan', { nameChan: arg.nameChan, banned: true, type: arg.type });
  }

  @SubscribeMessage('formToSendUnBan')
  async formToSendUnBan(client: Socket, arg: any) {
    const myUserId = this.chatService.getMyUserId(client.id);
    const user = await this.chatService.getOneUserWithName(arg.nameUser);
    if (user === null)
      return;
    if (myUserId === user.id)
      return;
    const allInfoChan = await this.chatService.getAllUserFromChannel(arg.nameChan);
    if (myUserId !== allInfoChan.owner){
      if (allInfoChan.administrators?.some((elem) => elem.id === user.id) === true)
        return;
    }
    if ((await this.chatService.unBanToChannel(arg.nameUser, arg.nameChan)) === false)
      return;
    const socketId = this.chatService.getSocketIdWithName(arg.nameUser);
    client.to(socketId).emit('IamBan', {nameChan: arg.nameChan,banned: false,type: arg.type,});
  }

  @SubscribeMessage('formToSendInvite')
  async formToSendInvite(client: Socket, arg: any) {
    if (
      (await this.chatService.inviteToChannel(arg.nameUser, arg.nameChan)) ===
      false
    )
      return;
    const socketId = this.chatService.getSocketIdWithName(arg.nameUser);
    client
      .to(socketId)
      .emit('IamInvite', { nameChan: arg.nameChan, type: arg.type });
  }

  @SubscribeMessage('formToSendLeaveGiveRight')
  async formToSendLeaveGiveRight(client: Socket, arg: any) {
    if ((await this.chatService.LeaveGiveRight(arg.nameUser, arg.nameChan)) === false)
      return;
    const socketId = this.chatService.getSocketIdWithName(arg.nameUser);
    client.to(socketId).emit('changeRight');
    return true;
  }

  @SubscribeMessage('leaveTheChannel')
  async leaveTheChannel(client: Socket, arg: any) {
    const myUserId = this.chatService.getMyUserId(client.id);
    const allUserOfChannel = await this.chatService.getAllUserFromChannel(arg.name);
    const allInChannel = allUserOfChannel.inChannel;
    if (allUserOfChannel.owner === myUserId) {
      if (allInChannel.length === 1) {
        await this.chatService.destroyTheChan(arg.name);
        this.server.emit('changePrivateChannel', arg);
        return;
      } else {
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

  @SubscribeMessage('enterTheChannel')
  async enterTheChannel(client:Socket, arg:any){
    const myUserId = this.chatService.getMyUserId(client.id);
    await this.chatService.addUserToChannel(arg.name,myUserId);
    client.join(arg.name);
    return {log: true};
  }

  @SubscribeMessage('allMessagesInDm')
  async allMessagesDm(client: Socket, all: any) {
    const messages = await this.chatService.getAllMessagesDm(all.params);
    const users = await this.chatService.getAllUsers();
    return { messages: messages, users: users };
  }

  @SubscribeMessage('getAllUsersDmOffLine')
  async getAllUsers(client: Socket) {
    const myUserId = this.chatService.getMyUserId(client.id);
    const myName = this.chatService.getMyName(client.id);
    const allUsers: User[] = await this.chatService.getAllUser();
    const allPlayerOffline: any[] = [];
    allUsers?.map((elem: User) => {
      const tmp: any = {
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

  @SubscribeMessage('getMynameOnBoxChannel')
  getMynameOnBoxChannel(client:Socket):string{
    return this.chatService.getMyName(client.id);
  }

  @SubscribeMessage('sendInvitationToPlayPong')
  async sendInvitationToPlayPong(client: Socket, arg: any) {
    const myUserId = this.chatService.getMyUserId(client.id);
    const myName = this.chatService.getMyName(client.id);
    const notMySocketId = this.chatService.getSocketIdWithName(arg.notMyName);
    // if (notMySocketId === client.id)
    //   return ;
    const notMyUserId = arg.notMyUserId;
    // console.log('je passe par ici');
    // console.log(notMySocketId);
    await client.to(notMySocketId).emit('receiveInvitationToPlayPong', {
      senderId: myUserId,
      senderName: myName,
      receiverId: notMyUserId,
      gameId: arg.gameId,
    });
  }

  @SubscribeMessage('changeLoginName')
  async changeLoginName(client:Socket, name:string){
    // console.log(name);
    let newUserId:Number;
    let newPerso:Perso = {name:name, socketId:[]}
    this.chatService.onlinePlayers.forEach((value:Perso, key:Number) => {
      if (value.socketId?.some((elem) => elem === client.id) === true){
        newUserId = key;
        // console.log("apres" + newPerso.name);
        newPerso.socketId = [...value.socketId];
      }
    })
    
    this.chatService.onlinePlayers.delete(newUserId);
    this.chatService.onlinePlayers.set(newUserId, newPerso);
    
  //  console.log(this.chatService.onlinePlayers);
    // for (const item of it)
    // this.logger.log(`map:::: userId:${item[0]} perso: name${item[1].name} socketId${item[1].socketId}`);
    const transitString = JSON.stringify(
      Array.from(this.chatService.onlinePlayers),
    );
    this.server.emit('someoneIsconnectedToServer', transitString);
  }
}
