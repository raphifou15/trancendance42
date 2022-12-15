import { Injectable, SerializeOptions } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { DMMF } from '@prisma/client/runtime';
import { channel } from 'diagnostics_channel';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrimaryColumn } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import * as bcrypt from 'bcrypt';
import { date } from '@hapi/joi';
import { elementAt, lastValueFrom } from 'rxjs';
import { ListUsersConnected, Info, Perso, allUsersAuthorize, MessageChannelInterface} from './interfaces/chat.interface';
import { Server, Socket } from 'socket.io';
import { connect } from 'http2';
import { verifyUserIdToken } from 'src/auth/auth.controller';


@Injectable()
export class ChatService {
    constructor(
        private prisma:PrismaService,
    ){}
    //private readonly logger:Logger = new Logger('ChatGateway');
    playerAuthorize:allUsersAuthorize[] = []; // stock le temps de la session si quelqu'un est vraiment entree sans tricher.
    readonly onlinePlayers = new Map<Number, Perso>();//le premier element est le nom mais deviendra le userid plus tard // id de la socket et name du joueur. // changer car l'id de la socket peut changer 
    allInfos:Info[] = []; // ici je creer un tableau de info je trouve que c'est plus simple a manipuler en js;
    tabSocket:Socket[] = [];

    getAuthorisation(auth: any):boolean{
        if (auth.token === undefined)
            return false;
        return (verifyUserIdToken({key : auth.cookieid, value: auth.token}))
    }

    async getAllMessagesDm(all:any){
        // console.log(all);
        let name_channel:string = "";
        if (all.myUserId < all.notMyUserId)
            name_channel = `dm${all.myUserId}+${all.notMyUserId}`
        else if (all.myUserId > all.notMyUserId)
            name_channel = `dm${all.notMyUserId}+${all.myUserId}`
        else
        name_channel = `dm${all.myUserId}`;
        // console.log(name_channel);
        const allMessagesDm = await this.prisma.channel.findFirst({
            where:{
                    name: name_channel,
                },
            include:{
                messages: true,
                user:{
                    select:
                    {
                        blockBy:true,
                        blokin:true,
                        id:true,
                        login: true,
                    },
                },
            },
          })
        return allMessagesDm;
    }

    async getChannelInfoWithName(nameChan:string){
        const channel = await this.prisma.channel.findFirst({
            where:{
                    name: nameChan,
                },
            include:{
                messages: true,
                user:{
                    select:
                    {
                        inChannel:true,
                        blockBy:true,
                        blokin:true,
                        id:true,
                        login: true,
                    },
                },
            },
          })
        return channel;
    }

    async getHello(){
        const lala =  await this.prisma.user.findMany();
        return lala;
    }

    async getAllUser(){
        const lala =  await this.prisma.user.findMany();
        return lala;
    }

    async getAskInfoForPlayer(id:number){
        const lala = await this.prisma.user.findUnique({ where: {
            id: id,
          },});
        return lala;
    }

    // async addUserToChannel(chanId: number, userId: number)
    // {
    //     try{
    //           let updatedChannel = await this.prisma.channel.update({
    //         where: {
    //             id: chanId,
    //         },
    //         include: {
    //             users: true,
    //         },
    //         data: {
    //             users: {
    //                 connect: [{id: userId}],
    //             },
    //         },
    //     });
    //     }
    //     catch(e)
    //     {
    //         if (e is instanceof Prisma.PrismaClientKnownRequestError)
    //         {
    //             if (e.code == 'P2025')
    //             {
    //                 return ("Er")
    //             }
    //         }
    //     }
      
    // };

    async createChannelGroup(infoChannel:any, idUser:number){
        const hash = await bcrypt.hash(infoChannel.password, 10);
        try{
            const listAllUserId = await this.prisma.user.findMany({
                select: {
                    id:true,
                }
            })
            // console.log(listAllUserId);
            await this.prisma.channel.create({
                include:{
                    user:true,
                },
                data:{
                    name:infoChannel.name,
                    inChannel:{connect:[{id:idUser}]},
                    user:{connect:[{id:idUser}]},
                    // user: (infoChannel.private) ? {connect: [{id:idUser}]} : {connect: listAllUserId},
                    administrators: {connect: [{id:idUser}]},
                    channelOption: (infoChannel.private) ? `PRIVATE` : `PUBLIC`,
                    Protected:infoChannel.protected,
                    Password:hash,
                    owner:idUser,
                }
            })
        }
        catch{
            console.log("errrrrooorr");
        }
        
    }

    async createDmChannel(message:any, name_channel:string){
        // console.log("create a message");
        if (message.myUserId === message.notMyUserId)
        {
            await this.prisma.channel.create({
                include: {
                    user: true,
                },
                data:{
                    name:name_channel,
                    channelOption:`DM`,
                    user: { connect: [{id:message.myUserId}] },
                    
                }
            })
        }
        else
        {
            await this.prisma.channel.create({
                include: {
                    user: true,
                },
                data:{
                    name:name_channel,
                    channelOption:`DM`,
                    user: { connect: [{id:message.myUserId}, {id:message.notMyUserId}] },
                    
                }
            })
        }
    }

    async PostCreateDmMessage(message:any){
        let name_channel:string = "";
        if (message.myUserId < message.notMyUserId)
            name_channel = `dm${message.myUserId}+${message.notMyUserId}`
        else if (message.myUserId > message.notMyUserId)
            name_channel = `dm${message.notMyUserId}+${message.myUserId}`
        else
        name_channel = `dm${message.myUserId}`;
        const lala = await this.prisma.channel.findUnique({ where: {
            name: `${name_channel}`,
              },});
        // console.log(lala);
        if (lala === null)
        {
            console.log("channel have to be created");
            await this.createDmChannel(message, name_channel)
        }
        const lala2 = await this.prisma.channel.findUnique({ where: {
            name: `${name_channel}`,
              },});
        await this.prisma.message.create({
            data:{
                content:message.text,
                user: { connect: {id:message.myUserId}},
                channel: {connect: {id:lala2.id}}
            }
        })
    }

    async PostCreateMessageChannel(messageToChannel: MessageChannelInterface, userId:number){
        // console.log(messageToChannel);
        
        const lala2 = await this.prisma.channel.findUnique({ where: {
            name: `${messageToChannel.nameChannel}`,
              },});
        await this.prisma.message.create({
            data:{
                content:messageToChannel.text,
                user: { connect: {id:userId}},
                channel: {connect: {id:lala2.id}}
            }
        })
    }

    // async PostCreateDmChannels(allUsers:any, idUser:Number){
    //     const allDmChannelsToPushToDataBase:any = [];
    //     const lastUser = allUsers[allUsers.length - 1];
    //     allUsers.map(elem => {
    //         let name:String = ""
    //         if (elem.id < idUser)
    //             name = `dm${elem.id}+${idUser}`
    //         else if (elem.id > idUser)
    //             return elem;
    //         else
    //             name = `dm${idUser}`;
    //         console.log(name);
    //         allDmChannelsToPushToDataBase.push({user:elem, name:name})
    //         return elem;
    //     })
    //     for (const elem of allDmChannelsToPushToDataBase ){
    //         const placeCount = await this.prisma.channel.count(
    //             {
    //                 where: {
    //                     name:elem.name
    //                 }
    //             }
    //         )
    //         console.log(placeCount);
    //         if (placeCount === 0 && elem.user !== lastUser)
    //         {
    //             await this.prisma.channel.create({
    //                 include: {
    //                     user: true,
    //                 },
    //                 data:{
    //                     name:elem.name,
    //                     user: { connect: [{id: elem.user.id}, {id:lastUser.id}] },
                        
    //                 }
    //             })
    //         }
    //         else if (placeCount === 0 && elem.user === lastUser)
    //         {
    //             await this.prisma.channel.create({
    //                 include: {
    //                     user: true,
    //                 },
    //                 data:{
    //                     name:elem.name,
    //                     user: { connect: [{id:elem.user.id}] },
    //                 }
    //             })
    //         }
    //     }
    // }

    async PostDmMessageToDatabase(id:string){

    }

    // chose a changer.

    async blockDmUser(userId:number, notMyUserId:number){
        await this.prisma.user.update({
            where:{
                id:userId,
            },
            data:{
                blokin: {connect : {id:notMyUserId}}
            }
        })
    }

    async createDmChannelBlock(name_channel:string, userId:number, notMyUserId:number)
    {
        try
        {
            if (userId === notMyUserId)
            {
                await this.prisma.channel.create({
                    include: {
                        user: true,
                    },
                    data:{
                        name:name_channel,
                        channelOption:`DM`,
                        user: { connect: [{id:userId}] },
                    
                    }
                })
            }
            else
            {
                await this.prisma.channel.create({
                    include: {
                        user: true,
                    },
                    data:{
                        name:name_channel,
                        channelOption:`DM`,
                        user: { connect: [{id:userId}, {id:notMyUserId}] },
                    
                    }
                })
            }
        }

        catch{
            console.log("impossible to create channel");
        }
    }

    async unBlockDmUser(userId:number, notMyUserId:number){
        await this.prisma.user.update({
            where:{
                id:userId,
            },
            data:{
                blokin: {disconnect : {id:notMyUserId}}
            }
        })
    }

    getMyUserId(socketId:string): number{
        let num:number = -1;
        this.onlinePlayers.forEach((value,key) => {
            value.socketId?.map((elem) => {
                if (socketId === elem)
                    num = key.valueOf();
                return elem;
            })  
        })
        return (num);
    }

    getMyName(socketId:string): string{
        let name = "";
        this.onlinePlayers.forEach((value) => {
            value.socketId?.map((elem) => {
                if (socketId === elem)
                    name = value.name.toString();
            })
        })
        return name;
    }

    getSocketIdWithName(name:string):string[] {
        let socketId:string[] = [];
        this.onlinePlayers.forEach((value, key) => {
            if (value.name === name)
                socketId = [...value.socketId];
        })
        return socketId;
    }
    
    async getAllPublicChannel(userId:number){
        
        const allPublicChannel:any = await this.prisma.channel.findMany({
            where:{
                channelOption:`PUBLIC`,
            },
            include:{
                user:true,
                ban:true,
            }
        })
        // for(const elem of allPublicChannel){
        //     let elemInside:boolean = false;
        //     for (const elem2 of elem.user){
        //         if (elem2.id === userId)
        //             elemInside = true;
        //     }
        //     if (elemInside === false){
        //         console.log("000000")
        //         console.log(userId);
        //         console.log(elem.name);
        //         console.log("000000")
        //         await this.prisma.channel.update({
        //             where:{name:elem.name,},
        //             data:{user:{connect: [{id:userId}]},}
        //         })
        //     }
        // }

        // const afterFilter = allPublicChannel?.filter((elem) => {
        //     let isBan:boolean = false;
        //     console.log(elem);
        //     console.log("---------");
        //     return true;
        // })
        // console.log(allPublicChannel.ban);
        return allPublicChannel;
    }

    async getAllPrivateChannel(num:number){
        
        const allPublicChannel = await this.prisma.channel.findMany({
            where:{
                user: {
                    some: {
                        id:num,
                    },
                },
                channelOption:`PRIVATE`,
            }
        })
        return allPublicChannel;
    }

    async getChannelWithName(name:string){
        const channel = await this.prisma.channel.findUnique({
            include:{
                administrators:true,
            },
            where:{
                name:name,
            }
        })
        return channel;
    }

    async getAllUsers(){
        const allUsers = await this.prisma.user.findMany({
            include:{
                blockBy:true,
                blokin:true,
                channels:true,
                channelAdministrators:true,
            }
        })
        return allUsers;
    }

    async getAllUsersClean(){
        const allUsers = await this.prisma.user.findMany({})
        return allUsers;
    }

    async getOneUserBlokin(userId:number){
        const oneUser = await this.prisma.user.findUnique({
            where:{
                id:userId,
            },
            include:{
                blokin:true,
            }
        })
        return oneUser;
    }

    async blockUserWithName(userId:number, name:string){
        try{
            const idToBlock = await this.prisma.user.findUnique({
                where:{
                    login:name
                }
            })
            await this.prisma.user.update({
                where:{
                    id:userId,
                },
                data:{
                    blokin: {connect : {id:idToBlock.id}}
                }
            })
        }catch{
            console.log("errorrrrrrrrrrrrrrrrrrrrrrr");
        }
    }

    async getAllUserBlockFromOneUser(userId:number){
        const userInfo = await this.prisma.user.findUnique({
            include:{
                blokin:true,
            },
            where:{
                id:userId,
            }
        })
        return userInfo.blokin
    }

    async unBlockUserWithName(userId:number, name:string){
        try{
        const idToBlock = await this.prisma.user.findUnique({
            where:{
                login:name
            }
        })
        await this.prisma.user.update({
            where:{
                id:userId,
            },
            data:{
                blokin: {disconnect : {id:idToBlock.id}}
            }
        })
        }catch{
            console.log("errrorrrrrrrrr");
        }
    }

    async updateChannelPass(userId:number, name:string, pass:string, num:number){
        const checkIfOwnerOfChannel = await this.prisma.channel.findUnique({
            where:{
                name:name,
            },
        })
        // console.log(checkIfOwnerOfChannel);
        if (checkIfOwnerOfChannel.owner !== userId)
            return ;
        const hash = await bcrypt.hash(pass, 10);
        if (checkIfOwnerOfChannel.owner === userId && num === 0){
            await this.prisma.channel.update({
                    where:{
                        name:name,
                    },
                    data:{
                        Protected:false,
                    }
            })
        }
        else if (checkIfOwnerOfChannel.owner === userId && num === 1){
            await this.prisma.channel.update({
                where:{
                    name:name,
                },
                data:{
                    Protected:true,
                    Password:hash,
                }
        })
        }
    }

    async getAllUserFromChannel(name:string){
        const allInfoChan = await this.prisma.channel.findUnique({
            where:{
                name:name,
            },
            include:{
                user:true,
                administrators:true,
                mutes:true,
                ban:true,
                inChannel:true,
            }
        })
        return (allInfoChan);
    }

    async addAminToChannel(nameUser:string, nameChan:string){
        try{
            const user = await this.prisma.user.findUnique({where:{login:nameUser}})
            await this.prisma.channel.update({
                where:{
                    name:nameChan,
                },
                data:{
                    administrators: {connect : {id:user.id}}
                }
            })
            return true;
        }catch{
            return false;
        }
    }

    async removeAminToChannel(nameUser:string, nameChan:string){
        try{
            const user = await this.prisma.user.findUnique({where:{login:nameUser}})
            await this.prisma.channel.update({
                where:{
                    name:nameChan,
                },
                data:{
                    administrators: {disconnect : {id:user.id}}
                }
            })
            return true;
        }catch{
            return false;
        }
    }

    async muteToChannel(nameUser:string, nameChan:string, futureDate:Date, myUserId:number){
        try{
        const user = await this.prisma.user.findUnique({where:{login:nameUser}})
        const chan = await this.prisma.channel.findUnique({where:{name:nameChan}, include:{administrators:true, inChannel:true}})
        if (chan.inChannel?.some((elem) => elem.id === user.id) === false)
            return undefined;
        if (user.id === chan.owner)
            return undefined;
        if (chan.administrators?.some((elem) => elem.id === user.id) === true && myUserId !== chan.owner)
            return undefined;
        const muteUserChannel = await this.prisma.mute.create({
            data:{
                user:{connect:{id:user.id}},
                channel:{connect:{id:chan.id}},
                unmuteAt:futureDate,
            }
        })
        return(muteUserChannel);
        }catch{
            return undefined;
        }
    }

    async UnmuteToChannel(muteUserChannel:any){
        // console.log(muteUserChannel);
        try{
            await this.prisma.mute.delete({
                where:{
                    id:muteUserChannel.id
                }
            })
        }catch{
            console.log("delete operation failed");
        }
    }

    async deleteUserMute(mute:any){
        await this.prisma.mute.delete({
            where:{
               id:mute.id, 
            }
        })
    }

    async getOneUserWithName(name:string){
        const oneUser = await this.prisma.user.findUnique({
            where:{
                login:name,
            },
        })
        return oneUser;
    }

    async banToChannel(nameUser:string, nameChan:string){
        try{
            const user = await this.prisma.user.findUnique({where:{login:nameUser}})
            const chan = await this.prisma.channel.findUnique({where:{name:nameChan}})
            await this.prisma.channel.update({
                where:{
                    name:chan.name,
                },
                data:{
                    ban:{connect:{id:user.id}},
                    inChannel:{disconnect:{id:user.id}}
                }
            })
            return true;
        }catch{
            return false;
        }
    }

    async unBanToChannel(nameUser:string, nameChan:string){
        try{
            const user = await this.prisma.user.findUnique({where:{login:nameUser}})
            const chan = await this.prisma.channel.findUnique({where:{name:nameChan}})
            await this.prisma.channel.update({
                where:{
                    name:chan.name,
                },
                data:{
                    ban:{disconnect:{id:user.id}},
                    inChannel:{connect:{id:user.id}}
                }
            })
            return true;
        }catch{
            return false;
        }
    }

    async inviteToChannel(nameUser:string, nameChan:string){
        try{
            const user = await this.prisma.user.findUnique({where:{login:nameUser}})
            const chan = await this.prisma.channel.findUnique({where:{name:nameChan}})
            await this.prisma.channel.update({
                where:{
                    name:chan.name,
                },
                data:{
                    user:{connect:{id:user.id}}
                }
            })
            return true;
        }catch{
            return false;
        }
    }

    async LeaveGiveRight(nameUser:string, nameChan:string){
        try{
            const user = await this.prisma.user.findUnique({where:{login:nameUser}})
            const chan = await this.prisma.channel.findUnique({where:{name:nameChan}})
            await this.prisma.channel.update({
                where:{
                    name:chan.name,
                },
                data:{
                    owner:user.id,
                    administrators:{connect:{id:user.id}},
                }
            })
            return true;
        }catch{
            return false;
        }
    }

    async addUserToChannel(name:string, userId:number){
        await this.prisma.channel.update({
            where:{
                name:name,
            },
            data:{
                user:{connect:{id:userId}},
                inChannel:{connect:{id:userId}},
            }
        })
    }

    async removeUserToChannel(name:string, userId:number){
        await this.prisma.channel.update({
            where:{
                name:name,
            },
            data:{
                inChannel:{disconnect:{id:userId}},
            }
        })
    }

    async destroyTheChan(name:string){
        const chan = await this.prisma.channel.findUnique({where:{name:name}})
        await this.prisma.message.deleteMany({
            where:{
                channelId:chan.id,
            }
        })
        await this.prisma.mute.deleteMany({
            where:{
                channelId:chan.id,
            }
        })
        await this.prisma.channel.delete({
                where:{
                    name:name,
                }
        })
    }
}