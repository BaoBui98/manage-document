import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentStatus } from './entities/document.entity';
import { ClientProxy } from '@nestjs/microservices';
import { RABBITMQ_PATTERN } from '../rabbitMQ/patternName';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private documentRepo: Repository<Document>,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
    private readonly uploadService: UploadService,
  ) { }

  async processUploadAndEmitTask(files: Express.Multer.File[], userId: string) {
    const docsToCreate = files.map(() => this.documentRepo.create({
      user_id: userId,
      status: DocumentStatus.PENDING,
    }));
    const savedDocs = await this.documentRepo.save(docsToCreate);
    const pendingDocs = files.map((file, index) => ({
      file,
      docId: savedDocs[index].id,
    }));

    this.rabbitClient.emit(RABBITMQ_PATTERN.DOCUMENT_UPLOAD_TASK, {
      tasks: pendingDocs,
      userId,
    });

    return {
      message: 'Files đang được xử lý dưới nền...',
      documents: pendingDocs.map(d => ({ id: d.docId, originalName: d.file.originalname })),
    };
  }

  async create(data: Partial<Document>): Promise<Document> {
    const doc = this.documentRepo.create(data);
    return await this.documentRepo.save(doc);
  }

  findAll() {
    return this.documentRepo.find({ relations: { user: true } });
  }

  async findOne(id: string) {
    const doc = await this.documentRepo.findOne({ where: { id }, relations: { user: true } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async update(id: string, data: any) {
    return this.documentRepo.update(id, data);
  }

  async updateStatus(id: string, status: DocumentStatus, file_url?: string) {
    const updateData: any = { status };
    if (file_url) updateData.file_url = file_url;
    await this.documentRepo.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string) {
    const doc = await this.findOne(id);
    
    if (doc.status === DocumentStatus.PENDING) {
      throw new BadRequestException('Không thể xóa tài liệu đang trong quá trình xử lý');
    }

    if (doc.file_url) {
      await this.uploadService.deleteFile(doc.file_url);
    }

    await this.documentRepo.delete(id);
    return { success: true, message: 'Đã xóa tài liệu thành công' };
  }
}
