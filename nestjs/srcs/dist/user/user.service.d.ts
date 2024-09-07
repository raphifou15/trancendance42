import { FriendDto } from 'src/auth/dto/friend.dto';
import { gamePlayer } from 'src/game/interfaces';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class UserService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: number): Promise<{
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
    }>;
    getUsernameWithId(id: number): Promise<string>;
    getHashLength(id: number): Promise<number>;
    changeInGameState(id: number, state: boolean): Promise<void>;
    isEmailConfirmed(email: string): Promise<boolean>;
    markEmailAsConfirmed(email: string): Promise<{
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
    }>;
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
    get_ten_last_games(id: string): Promise<{
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
    add_winner(user: gamePlayer): Promise<void>;
    add_loser(user: gamePlayer): Promise<void>;
}
