import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { envConfig } from './config/env.conf';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './interceptor/response.interceptor';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Cấu hình Microservice RabbitMQ cho app hiện tại
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [envConfig.rabbitmqUrl],
      queue: 'document_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các thuộc tính không mong muốn trong request
      forbidNonWhitelisted: true, // Báo lỗi nếu có thuộc tính không mong muốn
      transform: true, // Tự động transform dữ liệu về đúng kiểu dữ liệu của DTO,

    }),
  );
  
  // Áp dụng interceptor chung cho toàn bộ app
  app.useGlobalInterceptors(new ResponseInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Manage Document API')
    .setDescription('The Manage Document API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.startAllMicroservices(); // Khởi động microservices lắng nghe RabbitMQ
  await app.listen(envConfig.port ?? 3000);
}
bootstrap();
