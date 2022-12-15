import { ForbiddenException, Injectable, Body } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { AuthDto } from './dto';
import { ChangeDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

let id_g = -1;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private readonly httpService: HttpService,
  ) {}
  // private readonly logger = new Logger(AuthService.name)){}

  async signup(@Body() dto: AuthDto) {

    const hash = await bcrypt.hash(dto.password, 10);

    if (id_g > 0) {
      try {
        const user = await this.prisma.user.update({
          where: {
            id: id_g,
          },
          data: {
            email: dto.email,
            login: dto.login,
            image_url: dto.image_url,
            hash,
            gone_through_register: true,
            is_online: true,
          },
        });

        // return the saved user
        const token = (await this.signToken(user.id, user.email)).access_token;
        return token;
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002' && error.meta.target == 'login') {
            // console.log("IN LOGIN TAKEN");
            throw new ForbiddenException('Login taken');
          } else if (error.code === 'P2002' && error.meta.target == 'email') {
            // console.log("IN EMAIL TAKEN");
            throw new ForbiddenException('Email taken');
          } else {
            throw new ForbiddenException('Credentials taken');
          }
        } else {
          throw new Error('Could not sign up (auth.service.ts)');
        }
      }
    }
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });
    return {
      access_token: token,
    };
  }

  async register(id: number, login: string, email: string, image_extension: string) {

    // console.log('IN REGISTER (auth.service.ts)');

    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (user) {
      console.log('USER ALREADY EXISTS');
    }
    if (!user) {
      await this.prisma.user.create({
        data: {
          id: id,
          login: login,
          email: email,
          hash: '', // will be given later in Register Form
          image_url: 'http://' + process.env.HOST + ':3000/uploads/' + login + image_extension,
          // image_url: image_url,
          gone_through_login: true,
        },
      });
    }
    id_g = id; // storing the id to update the same user in db later with signup function up there

    const token = (await this.signToken(id, email)).access_token;

    return token;
  }

  async get_user() {
    // console.log("IN GET USER SERVICE");
    if (id_g === -1) {
      // console.log("ID_G == -1 dans get_user (auth.service.ts)");
      return -1;
    }
    const user = await this.prisma.user.findUnique({
      where: {
        id: id_g,
      },
    });
    if (user)
      return ({image_url: user.image_url, login: user.login, email: user.email, gone_through_login: user.gone_through_login, gone_through_register: user.gone_through_register});
    else
      return -1;
  }

  async get_user_by_id(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        friends: true,
      },
    });

    if (user) return user;
    return -1;
  }

  async toggleA2f(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    let a2f = user.auth2f_enabled;
    a2f = !a2f;
    const toggle = await this.prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        auth2f_enabled: a2f,
      },
    });
    return a2f;
  }

  async change_image_url_from_profile(@Body() dto: ChangeDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: Number(dto.id),
      },
    });
    const res = await this.prisma.user.update({
      where: {
        id: Number(dto.id),
      },
      data: {
        image_url: dto.image_url,
      },
    });
    return user;
  }

  async changeLogin(@Body() dto: ChangeDto) {
    let user = await this.prisma.user.findUnique({
      where: {
        login: dto.login,
      },
    });
    if (user) return user;
    user = await this.prisma.user.findUnique({
      where: {
        id: Number(dto.id),
      },
    });
    const toggle = await this.prisma.user.update({
      where: {
        id: Number(dto.id),
      },
      data: {
        login: dto.login,
      },
    });
    return user;
  }

  async loginexists(login: string) {
    // console.group('IN LOGIN EXISTS SERVICE');
    let user = await this.prisma.user.findUnique({
      where: {
        login: login,
      },
    });
    if (user) return true;
    return false;
  }

  async get_user_by_login(login: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        login: login,
      },
    });
    return user;
  }

  async emailexists(email: string) {
    // console.group('IN EMAIL EXISTS SERVICE');
    let user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (user) return true;
    return false;
  }

  async get_user_by_email(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    return user;
  }

  async get_friends_by_id(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        friends: true,
      },
    });
    if (user) return user.friends;
    return -1;
  }

  async get_all_users() {
    const users = await this.prisma.user.findMany({});
    return users;
  }

  async toggleGoneThroughLoginTrue(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!user) {
      console.log('USER NOT FOUND');
      return;
    }
    const toggle = await this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        gone_through_login: true,
      },
    });
    return user;
  }

  async toggleGoneThroughLoginFalse(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!user) {
      console.log('USER NOT FOUND');
      return;
    }
    const toggle = await this.prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        gone_through_login: false,
      },
    });
    return user;
  }

  
  async toggleLogin(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (user) {
      const toggle = await this.prisma.user.update({
        where: {
          id: Number(id),
        },
        data: {
          is_online: true,
        },
      });
      // console.log("is_online");
      return user;
    }
    return -1;
  }

  async toggleLogout(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (user) {
      const toggle = await this.prisma.user.update({
        where: {
          id: Number(id),
        },
        data: {
          is_online: false,
        },
      });
      return user;
    }
    return -1;
  }

  async toggleGoneThroughRegisterTrue(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (user) {
      const toggle = await this.prisma.user.update({
        where: {
          id: Number(id),
        },
        data: {
          gone_through_register: true,
        },
      });
      // console.log("is_offline");
      return user;
    }
    return -1;
  }

  async didUserGoThroughRegister(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (user) return user.gone_through_register;
    else return false;
  }

  async didUserEnabledA2f(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    // if (user) console.log("USER: ", user);
    if (user) return user.auth2f_enabled;
    else return false;
  }
}
