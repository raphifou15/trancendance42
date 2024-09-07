import { FriendDto } from 'src/auth/dto/friend.dto';
import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    get_ten_best_players(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        login: string;
        email: string;
        email_is_ok: boolean;
        hash: string;
        image_url: string;
        gone_through_login: boolean;
        gone_through_register: boolean;
        is_online: boolean;
        auth2f_enabled: boolean;
        is_ongame: boolean;
        victories: number;
        defeats: number;
        nb_of_games: number;
    }[]>;
    get_ten_last_games(params: any): Promise<{
        winnerId: number;
        player1: {
            login: string;
        };
        player2: {
            login: string;
        };
    }[]>;
    add_friend(dto: FriendDto): Promise<void>;
    delete_friend(dto: FriendDto): Promise<void>;
}
