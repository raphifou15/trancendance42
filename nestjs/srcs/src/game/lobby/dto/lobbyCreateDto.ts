import { IsString } from 'class-validator';

export class lobbyCreateDto {
    @IsString()
    mode: 'normal' | 'special';
}
