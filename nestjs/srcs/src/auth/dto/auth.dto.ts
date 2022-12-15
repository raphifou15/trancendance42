import { IsEmail, IsEmpty, IsNotEmpty, IsString } from "class-validator"

export class AuthDto {
	@IsEmail()
	email: string|null;
	
	@IsString()
	login: string|null;

	@IsString()
	password: string;

	@IsString()
	image_url: string;
}