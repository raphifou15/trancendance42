import { Body, Injectable } from '@nestjs/common';
import { FriendDto } from 'src/auth/dto/friend.dto';
import { gamePlayer } from 'src/game/interfaces';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  // constructor(@InjectRepository(User) private userRepo: Repository<User>) {}
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(id) },
    });
    if (user) {
      // console.log("IN USER SERVICE: USER FOUND BY ID");
      return user;
    }
    // throw new HttpException("User with this id does not exist", HttpStatus.NOT_FOUND);
  }

  async getUsernameWithId(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(id) },
    });
    if (user) {
      // console.log("IN USER SERVICE: USER FOUND WITH ID" + user.login);
      return user.login;
    }
    // throw new HttpException("User with this id does not exist", HttpStatus.NOT_FOUND);
  }

  async getHashLength(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(id) },
    });
    if (user) {
      return user.hash.length;
    }
    return -1;
  }

  async changeInGameState(id: number, state: boolean) {
    await this.prisma.user.update({
      where: { id: Number(id) },
      data: {
        is_ongame: state,
      },
    });
  }

  async isEmailConfirmed(email: string) {
    // console.log('IN ISEMAILCONFIRMED (user.service.ts)');
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (user.email_is_ok) return true;
    return false;
  }

  async markEmailAsConfirmed(email: string) {
    // console.log('IN MARKEMAILASCONFIRMED (user.service.ts)');
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user.email_is_ok) {
      await this.prisma.user.update({
        where: {
          email: email,
        },
        data: {
          email_is_ok: true,
          is_online: true,
        },
      });
    }
    return user;
  }

  async get_ten_best_players() {
    // console.log("IN GET TEN BEST SERVICE");
    const best_players = await this.prisma.user.findMany({
      orderBy: [
        {
          victories: 'desc',
        },
        {
          defeats: 'asc',
        },
      ],
      take: 10,
    });
    return best_players;
  }

  async get_ten_last_games(id: string) {
    // console.log("ID IN GET TEN GAMES SERVICE: ", id);
    const last_games = await this.prisma.game.findMany({
      where: {
        OR: [
          {
            player1Id: Number(id),
          },
          {
            player2Id: Number(id),
          },
        ],
      },
      select: {
        winnerId: true,
        player1: {
          select: {
            login: true,
          },
        },
        player2: {
          select: {
            login: true,
          },
        },
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
      take: 10,
    });
    return last_games;
  }

  async add_friend(@Body() dto: FriendDto) {
    const user = await this.prisma.user.update({
      where: {
        id: dto.my_id,
      },
      data: {
        friends: {
          connect: {
            id: dto.friends_id,
          },
        },
      },
    });
  }

  async delete_friend(@Body() dto: FriendDto) {
    const user = await this.prisma.user.update({
      where: {
        id: dto.my_id,
      },
      data: {
        friends: {
          disconnect: {
            id: dto.friends_id,
          },
        },
      },
    });
  }

  async add_winner(user: gamePlayer) {
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        nb_of_games: { increment: 1 },
        victories: { increment: 1 },
      },
    });
  }
  
  async add_loser(user: gamePlayer) {
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        nb_of_games: { increment: 1 },
        defeats: { increment: 1 },
      },
    });
  }
}
