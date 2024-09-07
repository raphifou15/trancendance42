import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Logger,
  Res,
  ClassSerializerInterceptor,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { ChangeDto } from './dto';
import { FortyTwoAuthGuard } from './guard/ft.guard';
import { EmailConfirmationService } from './twofactor/emailConfirmation.service';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { createWriteStream } from 'fs';
import { join } from 'path';
import { HttpService } from '@nestjs/axios';
import { GeneralGuard } from './guard/general.guard';

let id_g = -1;

const gLogger = new Logger('userIdToken');

export const userIdToken: Map<number, string> = new Map();

export function findUserIdToken(id: number): string | undefined {
  // console.log(userIdToken);
  return userIdToken.get(id);
}

export function addUserIdToken(token: { key: number; value: string }) {
  // gLogger.log('call to adduseridtoken', token.value);
  // gLogger.log(token.key);
  userIdToken.set(token.key, token.value);
}

export function deleteUserIdToken(id: number): boolean {
  return userIdToken.delete(id);
}

export function updateUserIdToken(token: { key: number; value: string }) {
  // gLogger.log('call to updateuseridtoken', token.value);
  // gLogger.log(token.key);
  let value: string | undefined = findUserIdToken(token.key);
  userIdToken.delete(token.key);
  userIdToken.set(token.key, token.value);
}

export function verifyUserIdToken(token: { key: number; value: string }) {
  const result: string | undefined = findUserIdToken(token.key);
  if (typeof result === 'string') {
    return token.value === result;
  } else return false;
}

@Controller('auth')
// @UseGuards(FortyTwoAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private userService: UserService,
    private prisma: PrismaService,
    private readonly emailConfirmationService: EmailConfirmationService,
    private readonly httpService: HttpService,
  ) {}
  private readonly logger = new Logger(AuthService.name);

  @Post('signup')
  async signup(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.signup(dto);

    const secretData = {
      token,
      refreshToken: '',
      id: id_g,
    };
  }

  @Post('createCookie')
  async createCookie(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.get_user_by_email(dto.email);
    const token = (await this.authService.signToken(user.id, user.email))
      .access_token;
    const secretData = {
      token,
      refreshToken: '',
      id: user.id,
    };
    res.cookie('42auth-cookie', secretData, {
      httpOnly: false,
      expires: new Date(Date.now() + 2 * 3600000),
      // signed: true,
    }); // cookie will expire after 2h

    // this.logger.log('updating user id cookie', secretData);
    updateUserIdToken({ key: secretData.id, value: secretData.token });
    this.authService.toggleLogin(String(secretData.id));
  }

  @UseGuards(FortyTwoAuthGuard)
  @Get('42login') // rentre dans 42login il rentre dans la strategie 42
  authGet42Login() {
    // console.log('IN GET 42LOGIN (auth.controller.ts)');
  }

  @UseGuards(FortyTwoAuthGuard) // il rentre une deuxieme fois dans la strategie mais cette fois ci il y a le code donner par l'api
  @Get('42login/redirect')
  async redirectauthGet42Login(@Req() req, @Res({ passthrough: true }) res) {
    // console.log('IN GET 42LOGINREDIRECT (auth.controller.ts)');
    const userData = await this.userService.findById(req.user['id']);

    console.log(req.user);
    const id = Number(req.user.id); // id from API42
    const login = String(req.user.username); // login from API42
    const email = String(req.user._json.email); // email from API42

    const image_url = String(req.user._json.image.link); // image_url from API42
    const image_extension = '.' + image_url.split('.').pop();

    // DOWNLOADING PICTURE FROM API TO SERVER
    console.log(image_url);
    const file = createWriteStream(join('./uploads/', login + image_extension));
    const response = await this.httpService.axiosRef({
      url: image_url,
      method: 'GET',
      responseType: 'stream',
    });
    response.data.pipe(file);

    id_g = Number(req.user.id); // id from API42

    let username_in_db = await this.userService.getUsernameWithId(id);
    let hash_length = await this.userService.getHashLength(id);

    if (userData && username_in_db.length > 0 && hash_length > 0) {
      if (!userData.auth2f_enabled) {
        // redirect directly to /Home if in db and a2f disabled
        const token = (await this.authService.signToken(id, email))
          .access_token; // recreating cookie if manually deleted
        const secretData = {
          token,
          refreshToken: '',
          id: id_g,
        };
        res.cookie('42auth-cookie', secretData, {
          httpOnly: false,
          expires: new Date(Date.now() + 2 * 3600000),
          // signed: true,
        });

        updateUserIdToken({ key: secretData.id, value: secretData.token });

        this.authService.toggleLogin(String(id));

        res.redirect(`http://` + process.env.HOST + `:9999/Home`);
      } // redirect to /WaitingValidation if in db and a2f enabled
      else {
        res.redirect(
          `http://` +
            process.env.HOST +
            `:9999/WaitingValidation?token=a2fEnabled`,
        );
        await this.emailConfirmationService.sendVerificationLink(
          userData.email,
        );
      }
      this.authService.toggleGoneThroughLoginTrue(id_g);
    } else {
      const token = (await this.authService.signToken(id, email)).access_token; // recreating cookie if manually deleted
      const secretData = {
        token,
        refreshToken: '',
        id: id_g,
      };
      res.cookie('42auth-cookie', secretData, {
        httpOnly: false,
        expires: new Date(Date.now() + 2 * 3600000),
        // signed: true,
      });
      addUserIdToken({ key: secretData.id, value: secretData.token });
      this.authService.register(id, login, email, image_extension);
      res.redirect(`http://` + process.env.HOST + `:9999/Register`);
    }
  }

  @UseGuards(GeneralGuard)
  @Get('get_user')
  async get_user() {
    return await this.authService.get_user();
  }

  // @UseGuards(GeneralGuard)
  @Get('get_user_by_id/:id')
  async get_user_by_id(@Param() params) {
    return await this.authService.get_user_by_id(params.id);
  }

  @UseGuards(GeneralGuard)
  @Post('toggleA2f')
  async toggleA2f(@Body() dto: ChangeDto) {
    return this.authService.toggleA2f(String(dto.id));
  }

  @UseGuards(GeneralGuard)
  @Post('change_image_url_from_profile')
  async change_image_url_from_profile(@Body() dto: ChangeDto) {
    return this.authService.change_image_url_from_profile(dto);
  }

  @UseGuards(GeneralGuard)
  @Post('changeLogin')
  async changeLogin(@Body() dto: ChangeDto) {
    return this.authService.changeLogin(dto);
  }

  @UseGuards(GeneralGuard)
  @Get('get_user_by_login/:login')
  async get_user_by_login(@Param() params) {
    return await this.authService.get_user_by_login(params.login);
  }

  @UseGuards(GeneralGuard)
  @Get('loginexists/:login')
  async loginexists(@Param() params) {
    // console.group('IN LOGIN EXISTS CONTROLLER');
    return await this.authService.loginexists(params.login);
  }

  @UseGuards(GeneralGuard)
  @Get('emailexists/:login')
  async emailexists(@Param() params) {
    // console.group('IN EMAIL EXISTS CONTROLLER');
    return await this.authService.emailexists(params.login);
  }

  @UseGuards(GeneralGuard)
  @Get('get_friends_by_id/:id')
  async get_friends_by_id(@Param() params) {
    return await this.authService.get_friends_by_id(params.id);
  }

  @UseGuards(GeneralGuard)
  @Get('get_all_users')
  async get_all_users() {
    return await this.authService.get_all_users();
  }

  @UseGuards(GeneralGuard)
  @Post('toggleLogin')
  async toggleLogin(@Body() dto: ChangeDto) {
    // console.group("IN TOGGLE LOGOUT CONTROLLER");
    return await this.authService.toggleLogin(String(dto.id));
  }

  // @UseGuards(GeneralGuard)
  @Post('toggleLogout')
  async toggleLogout(@Body() dto: ChangeDto) {
    // console.group("IN TOGGLE LOGOUT CONTROLLER");
    if (dto.id === undefined || isNaN(parseInt(dto.id))) {
      console.error('ID IS UNDEFINED IN GET ASKINFOFORP{LAEYER');
      return -1;
    }
    return await this.authService.toggleLogout(String(dto.id));
  }

  // @UseGuards(GeneralGuard)
  @Post('toggleGoneThroughLoginFalse')
  async toggleGoneThroughLoginFalse(@Body() dto: ChangeDto) {
    // console.group("IN TOGGLE LOGOUT CONTROLLER");
    return await this.authService.toggleGoneThroughLoginFalse(String(dto.id));
  }

  @UseGuards(GeneralGuard)
  @Post('toggleGoneThroughRegisterTrue')
  async toggleGoneThroughRegisterTrue(@Body() id: string) {
    // console.group("IN TOGGLE LOGOUT CONTROLLER");
    return await this.authService.toggleGoneThroughRegisterTrue(id);
  }

  @UseGuards(GeneralGuard)
  @Get('askBackendIfUserWentThroughRegister/:id')
  async askBackendIfUserWentThroughRegister(@Param() params) {
    if (params.id === undefined || isNaN(parseInt(params.id))) {
      console.error('ID IS UNDEFINED IN GET ASKINFOFORP{LAEYER');
      return -1;
    }
    return await this.authService.didUserGoThroughRegister(params.id);
  }

  // @UseGuards(GeneralGuard)
  @Get('askBackendIfUserEnabledA2f/:id')
  async askBackendIfUserEnabledA2f(@Param() params) {
    return await this.authService.didUserEnabledA2f(params.id);
  }
}
