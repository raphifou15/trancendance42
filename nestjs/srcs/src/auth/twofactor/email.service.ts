import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export default class EmailService {
  private nodemailerTransport: Mail | any;

  constructor(private readonly configService: ConfigService) {
    // to create a transport meaning connect to our email address
    this.nodemailerTransport = createTransport({
      service: configService.get('EMAIL_SERVICE'),
      host: configService.get('EMAIL_HOST'),
      secure: true,
      auth: {
        user: configService.get('EMAIL_USER'),
        pass: configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  sendMail(options: Mail.Options) {
    // object option containing destination address, subject field and text in mail body
    return this.nodemailerTransport.sendMail(options);
  }
}
