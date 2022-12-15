import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [GameController],
  providers: [GameGateway, GameService, UserService],
})
export class GameModule {}
