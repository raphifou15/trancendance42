import {
    Controller,
    Post,
    Body,
} from '@nestjs/common';
import ConfirmEmailDto from '../dto/confirmEmail.dto';
import { EmailConfirmationService } from './emailConfirmation.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('email-confirmation')
// @UseInterceptors(ClassSerializerInterceptor)
export class EmailConfirmationController {
    constructor(private readonly emailConfirmationService: EmailConfirmationService, private prisma: PrismaService) {}

    @Post()
    async confirm(@Body() confirmationData: ConfirmEmailDto) {
        // console.log("IN POST CONFIRM (emailConfirmation.controller.ts)");
		try {
			const email = await this.emailConfirmationService.decodeConfirmationToken(confirmationData.token);
			await this.emailConfirmationService.confirmEmail(email);
			const user = await this.prisma.user.findUnique({
				where: {
					email: email,
				}
			})
			if (user)
			    return user;
		} catch (error) {
			console.log("Error: ", error.name);
			return -1;
		}
	}
}