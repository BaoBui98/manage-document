import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envConfig } from '../config/env.conf';
import { UploadModule } from '../upload/upload.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { PlanUsage } from '../plan-usages/entities/plan-usage.entity';

import { DocumentUploadListener } from './listeners/document-upload.listener';
import { RabbitMQListener } from '../rabbitMQ/listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, PlanUsage]),
    UploadModule,
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [envConfig.rabbitmqUrl],
          queue: 'document_queue',
          queueOptions: {
            durable: true, // Lưu lại queue khi RabbitMQ restart
          },
        },
      },
    ]),
  ],
  controllers: [DocumentController, RabbitMQListener],
  providers: [DocumentService, DocumentUploadListener],
})
export class DocumentModule {}
