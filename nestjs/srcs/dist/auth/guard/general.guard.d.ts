import { CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class GeneralGuard implements CanActivate {
    logger: Logger;
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
}
