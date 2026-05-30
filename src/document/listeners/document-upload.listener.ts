import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { UploadService } from '../../upload/upload.service';
import { DocumentService } from '../document.service';
import { DocumentStatus } from '../entities/document.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanUsage } from '../../plan-usages/entities/plan-usage.entity';

@Injectable()
export class DocumentUploadListener {
  constructor(
    private readonly uploadService: UploadService,
    private readonly documentService: DocumentService,
    @InjectRepository(PlanUsage)
    private readonly planUsageRepo: Repository<PlanUsage>,
  ) {}

  async handleDocumentUploadTask<T extends { tasks: { file: Express.Multer.File, docId: string }[], userId: string }>(data: T) {
    const { tasks, userId } = data;
    
    // Xử lý song song tất cả các task bằng Promise.all
    const promises = tasks.map(async (task) => {
      const { file, docId } = task;
      try {
        // Upload từng file lên MinIO
        const fileUrl = await this.uploadService.uploadFile(file);

        // Cập nhật record thành COMPLETED
        await this.documentService.updateStatus(docId, DocumentStatus.COMPLETED, fileUrl);

        // Cộng dồn số lượng file đã upload thành công vào bảng PlanUsage
        await this.planUsageRepo.increment({ userId }, 'usedDocument', 1);
      } catch (error) {
        console.error(`Lỗi khi upload file cho document ${docId}:`, error);
        // Cập nhật record thành FAILED
        await this.documentService.updateStatus(docId, DocumentStatus.FAILED);
      } finally {
        // Luôn luôn dọn dẹp file temp dù thành công hay thất bại
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    });

    await Promise.all(promises);
  }
}
