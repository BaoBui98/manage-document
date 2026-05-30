import { Injectable } from '@nestjs/common';
import { MinioService } from '../minio/minio.service';

@Injectable()
export class UploadService {
  constructor(private readonly minioService: MinioService) {}

  async uploadFile(file: Express.Multer.File): Promise<string> {
    return this.minioService.uploadFile(file);
  }

  async uploadMany(files: Express.Multer.File[]): Promise<string[]> {
    return this.minioService.uploadMany(files);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    return this.minioService.deleteFile(fileUrl);
  }
}
