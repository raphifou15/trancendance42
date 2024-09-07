import { Response } from 'express';
export declare class UploadController {
    uploadFile(file: Express.Multer.File): {
        url: string;
    };
    getImage(path: any, res: Response): Promise<void>;
}
