import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';

// @Injectable()
// export class FtAuthGuard extends AuthGuard('42') {
//   async canActivate(context: ExecutionContext): Promise<any> {
//     const activate = (await super.canActivate(context)) as boolean;
//     const request = context.switchToHttp().getRequest();
//     await super.logIn(request);
//     return activate;
//   }
// }

// @Injectable()
// export class AuthenticatedGuard implements CanActivate {
//   async canActivate(context: ExecutionContext): Promise<any> {
//     const req = context.switchToHttp().getRequest();
//     return req.isAuthenticated();
//   }
// }

@Injectable()
export class FortyTwoAuthGuard extends AuthGuard('ft') {
	private readonly logger = new Logger(FortyTwoAuthGuard.name)
	ici(){	
		// this.logger.log("IN FT_GUARD");
	}
	
}