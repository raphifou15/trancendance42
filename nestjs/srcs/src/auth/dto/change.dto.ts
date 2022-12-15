import { IsString } from "class-validator"

export class ChangeDto {
	@IsString()
	id: string;

	@IsString()
	image_url: string|null;

	@IsString()
	login: string|null;
}