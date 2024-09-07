import Strategy from 'passport-42';
import { ConfigService } from '@nestjs/config';
declare const FortyTwoStrategy_base: new (...args: any[]) => Strategy;
export declare class FortyTwoStrategy extends FortyTwoStrategy_base {
    config: ConfigService;
    constructor(config: ConfigService);
    validate(accessToken: string, refreshToken: string, profile: any, cb: Function): Promise<any>;
}
export {};
