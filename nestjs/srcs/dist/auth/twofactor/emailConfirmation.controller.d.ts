import ConfirmEmailDto from '../dto/confirmEmail.dto';
import { EmailConfirmationService } from './emailConfirmation.service';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class EmailConfirmationController {
    private readonly emailConfirmationService;
    private prisma;
    constructor(emailConfirmationService: EmailConfirmationService, prisma: PrismaService);
    confirm(confirmationData: ConfirmEmailDto): Promise<{
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
    } | -1>;
}
