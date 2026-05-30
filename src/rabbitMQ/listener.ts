import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { DocumentUploadListener } from '../document/listeners/document-upload.listener';
import { RABBITMQ_PATTERN } from './patternName';

@Controller()
export class RabbitMQListener {
    constructor(
        private readonly documentUploadListener: DocumentUploadListener,
    ) { }

    /**
     * Để lắng nghe nhiều task khác nhau trên cùng 1 hàm,
     * bạn chỉ cần gắn nhiều decorator @EventPattern cho các tên task tương ứng.
     */
    @EventPattern(RABBITMQ_PATTERN.DOCUMENT_UPLOAD_TASK)
    async handleAllRabbitMQEvents<T>(@Payload() data: T, @Ctx() context: RmqContext) {
        const pattern = context.getPattern(); // Lấy tên message

        switch (pattern) {
            case RABBITMQ_PATTERN.DOCUMENT_UPLOAD_TASK:
                // Truyền trực tiếp T vào (vì hàm bên kia đã được setup Generic Type)
                await this.documentUploadListener.handleDocumentUploadTask(data as T & { tasks: { file: Express.Multer.File, docId: string }[], userId: string });
                break;

            // case 'document_delete_task':
            //   await this.documentDeleteListener.handleTask(data);
            //   break;

            default:
                console.warn(`[RabbitMQ] Chưa có handler cho event: ${pattern}`);
                break;
        }
    }
}
