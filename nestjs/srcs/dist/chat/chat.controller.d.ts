import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getAskInfoForPlayer(id: string | undefined): Promise<-1 | {
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
}
