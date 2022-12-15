import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Request } from 'express';
import { ok } from 'assert';
import { async } from 'rxjs';
import { User } from '@prisma/client';
import { GeneralGuard } from 'src/auth/guard/general.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService:ChatService) {
    
  }

  // @Get('bonjour')
  // getHello(): any {
  //   return this.chatService.getHello();
  // }
  // @UseGuards(GeneralGuard)
  @Get('/askInfoForPlayer/:id')
  async getAskInfoForPlayer(@Param("id")id:string | undefined){
    if (id === undefined || isNaN(parseInt(id)))
      {
        console.error('ID IS UNDEFINED IN GET ASKINFOFORP{LAEYER')
        return -1;
      }

    const value:User = await this.chatService.getAskInfoForPlayer(parseInt(id));
    // console.log()
    return value;
  }

  // @Get('allMessagesDm')
  // async allMessagesDm(@Req() request: Request, @Query() all){
  //   const messages = await this.chatService.getAllMessagesDm(all);
  //   const users = await this.chatService.getAllUsersClean();
  //   return ({params:{messages:messages, users:users}})
  // }

  // @Post('createChannelGroup')
  // async createChannelGroup(@Body()body :any ){
  //   // faire une verif pour savoir si la personne qui fait la requete est bien elle,(body.params.userId, and send socketid);
  //   // on peut faire un emit a la personne pour verifier si c'est la bonne personne.
  //   // puis si le ping pong se fait c'est que la personne est la bonne et quel peu effectuer un post dans la db.
  //   await this.chatService.createChannelGroup(body.params.infoChannel, body.params.userId);
  // }

  // @Post('blockDmUser')
  // async blockDmUser(@Body()body :any) {
  //   await this.chatService.blockDmUser(body.params.userId, body.params.notMyUserId)
  //   return "ok";
  // }

  // @Post('unBlockDmUser')
  // async unBlockDmUser(@Body()body :any) {
  //   await this.chatService.unBlockDmUser(body.params.userId, body.params.notMyUserId)
  // }

}