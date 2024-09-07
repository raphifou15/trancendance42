import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UploadController } from 'src/uploads/upload.controller';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  // imports: [TypeOrmModule.forFeature([User])],
  // imports: [UserService],
  controllers: [UserController, UploadController],
  providers: [UserService, JwtService],
  exports: [UserService],
})
export class UserModule {}
