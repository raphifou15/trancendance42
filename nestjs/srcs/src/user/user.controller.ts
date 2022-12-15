import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FriendDto } from 'src/auth/dto/friend.dto';
import { UserService } from './user.service';

// @UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('get_ten_best_players')
  get_ten_best_players() {
    return this.userService.get_ten_best_players();
  }

  @Get('get_ten_last_games/:id')
  get_ten_last_games(@Param() params) {
    // console.log("ID IN CONTROLLER: ", params.id);
    return this.userService.get_ten_last_games(params.id);
  }

  @Post('add_friend')
  add_friend(@Body() dto: FriendDto) {
    // console.log("ID IN CONTROLLER: ", params.id);
    return this.userService.add_friend(dto);
  }

  @Post('delete_friend')
  delete_friend(@Body() dto: FriendDto) {
    // console.log("ID IN CONTROLLER: ", params.id);
    return this.userService.delete_friend(dto);
  }
}
