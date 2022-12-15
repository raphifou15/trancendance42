// import { Injectable, Logger } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	// constructor( config: ConfigService, private prisma: PrismaService) {
	constructor(config: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.get('JWT_SECRET'),
		});
		// console.log("IN JWT STRAT");
	}
	
	async validate() {
	// async validate(payload: { sub: number, email: string }) {
		// console.log("IN FUNCTION VALIDATE JWT STRAT");
		// const user = await this.prisma.user.findUnique({
		// 	where: {
		// 		id: payload.sub,
		// 	},
		// });
		// delete user.hash;
		// return user;
	}
}