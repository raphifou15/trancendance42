import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { findUserIdToken, verifyUserIdToken } from '../auth.controller';

@Injectable()
export class GeneralGuard implements CanActivate {
  logger: Logger = new Logger('gGuard');
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const tmp = JSON.stringify(req.headers);
    const end = JSON.parse(tmp);

    if (end.authorization === undefined) return false; //We should not be able to access these routes with authorization

    const keyValue = end.authorization.split('||'); //awful
    if (
      keyValue.length == 2 &&
      verifyUserIdToken({
        key: parseInt(keyValue[1]),
        value: keyValue[0],
      })
    ) {
      return true;
    } else {
      this.logger.error('cookie value is wrong');
      return false;
    }
  }
}
