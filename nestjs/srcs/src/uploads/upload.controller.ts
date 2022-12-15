import { Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors} from '@nestjs/common';
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from 'multer';
import { Response } from 'express';

@Controller()
export class UploadController {

    @Post('uploads')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename(_, file, callback) {
                let extArray = file.mimetype.split("/");
                let extension = '.' + extArray[extArray.length - 1];
                return callback(null, file.originalname);
            }
        })
    }))
	uploadFile(
		@UploadedFile() file: Express.Multer.File) {
        return { url: "http://" + process.env.HOST + `:3000/uploads/${file.filename}`}
  }

    // To retrieve uploaded image, needed to display
    @Get('uploads/:path')
    async getImage(@Param('path') path, @Res() res: Response) {
        res.sendFile(path, {root: 'uploads'});
    }
}
