import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: 'postgresql://postgres:'+ process.env.POSTGRES_PASSWORD + '@postgres:5432/nestjs',
        },
      },
    });
    // console.log(config.get('DATABASE_URL'));
  }
}
