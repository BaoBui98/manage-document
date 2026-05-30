import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { envConfig } from '../config/env.conf';
import * as crypto from 'crypto';
import * as path from 'path';

@Injectable()
export class UploadService implements OnModuleInit {
  private minioClient: Minio.Client;
  private readonly logger = new Logger(UploadService.name);
  private readonly bucketName = envConfig.minioBucket;

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: envConfig.minioEndpoint,
      port: envConfig.minioPort,
      useSSL: false, // Set to true if your MinIO server uses HTTPS
      accessKey: envConfig.minioAccessKey,
      secretKey: envConfig.minioSecretKey,
    });
  }

  async onModuleInit() {
    await this.initBucket();
  }

  private async initBucket() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Tạo thành công bucket: ${this.bucketName}`);
        
        // Thiết lập policy để có thể đọc file public (nếu cần thiết)
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      }
    } catch (error) {
      this.logger.error('Lỗi khi khởi tạo bucket MinIO', error);
    }
  }

  /**
   * Upload file lên MinIO
   * @param file Đối tượng file nhận từ Multer
   * @returns URL của file sau khi upload thành công
   */
  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      // Đổi tên file để tránh trùng lặp
      const fileExt = path.extname(file.originalname);
      const uniqueSuffix = crypto.randomBytes(16).toString('hex');
      const fileName = `${uniqueSuffix}${fileExt}`;

      // Upload lên MinIO
      let fileBuffer = file.buffer;
      if (!fileBuffer && file.path) {
        const fs = require('fs');
        fileBuffer = fs.readFileSync(file.path);
      }

      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        fileBuffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        }
      );

      // Trả về URI tương đối (người dùng tự map endpoint/domain ở phía ngoài)
      const fileUrl = `${this.bucketName}/${fileName}`;
      return fileUrl;
    } catch (error) {
      this.logger.error('Lỗi khi upload file lên MinIO', error);
      throw new InternalServerErrorException('Không thể tải file lên hệ thống');
    }
  }

  /**
   * Upload nhiều file lên MinIO cùng lúc
   * @param files Mảng các đối tượng file nhận từ Multer
   * @returns Mảng các URL của file sau khi upload thành công
   */
  async uploadMany(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      return [];
    }

    try {
      // Dùng Promise.all để upload song song tất cả các file
      const uploadPromises = files.map((file) => this.uploadFile(file));
      const fileUrls = await Promise.all(uploadPromises);
      return fileUrls;
    } catch (error) {
      this.logger.error('Lỗi khi upload nhiều file lên MinIO', error);
      throw new InternalServerErrorException('Không thể tải danh sách file lên hệ thống');
    }
  }
}
