import Strategy from 'passport-42';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, 'ft') {
  @Inject(ConfigService)
  public config: ConfigService;
  // const clientID: string = this.config.get('CLIENT_ID');
  constructor(config: ConfigService) {
    super({
      //   authorizationURL: `https://api.intra.42.fr/oauth/authorize?client_id=${configService.get<string>('CLIENT_ID')},
      // }&redirect_uri=http://localhost:9999/login/42/return,
      // )}&response_type=code`,
      // tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: config.get<string>('CLIENT_ID'), // rentre identifiant d'api
      clientSecret: config.get<string>('CLIENT_SECRET'), // rentre secret d'api
      //callbackURL: 'http://localhost:9999/Home',
      callbackURL: `http://` + process.env.HOST + `:3000/auth/42login/redirect`, // adresse ou api redirige apres l'apelle de 42 avec le code de l'api en parametre
      //http://localhost:3000/auth/42login/redirect
      //passReqToCallback: true,
    });
    // console.log(config.get<string>('CLIENT_ID'))

    // console.log('IN FT_STRATEGY');
    // console.log(this.config.get());
  }

  // private readonly logger = new Logger(FortyTwoStrategy.name)
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any, // la ou est stocker toutes les donner uilisateur
    cb: Function,
  ): Promise<any> {
    console.log('IN VALIDATE STRAT');
    //   const { data } = await axios.get('https://api.intra.42.fr/v2/me', {
    // 	headers: { Authorization: `Bearer ${accessToken}` },
    // });
    // console.log(data);
    // request.session.accessToken = accessToken;
    // console.log('accessToken', accessToken, 'refreshToken', refreshToken);
    // In this example, the user's 42 profile is supplied as the user
    // record. In a production-quality application, the 42 profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    // console.log('IN VALIDATE STRAT');
    // this.logger.log("IN VALIDATE STRAT");
    console.log('lala');
    cb(null, profile); // call back redirect dans le controller login42/redirect. stock profile dans la request.user
  }
}
