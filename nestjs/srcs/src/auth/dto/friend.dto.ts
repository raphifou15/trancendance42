import { IsInt } from "class-validator"

export class FriendDto {
	@IsInt()
	my_id: number;

	@IsInt()
	friends_id: number;
}