import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, Inject, Req } from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as crypto from 'crypto';
import * as fs from 'fs';
import type { RequestWithUser } from '../interface/request.interface';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { DocumentStatus } from './entities/document.entity';
import { RABBITMQ_PATTERN } from '../rabbitMQ/patternName';

@ApiTags('Document')
@ApiBearerAuth()
@Controller('document')
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
  ) {
    // Đảm bảo thư mục temp tồn tại
    if (!fs.existsSync('./temp')) {
      fs.mkdirSync('./temp');
    }
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './temp';
        // 👇 Tự động tạo thư mục ./temp nếu chưa có, tránh lỗi sập API
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
      }
    })
  }))
  async create(@UploadedFiles() files: Express.Multer.File[], @Req() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.documentService.processUploadAndEmitTask(files, userId);
  }

  @Get()
  findAll() {
    return this.documentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    return this.documentService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentService.remove(id);
  }
}
