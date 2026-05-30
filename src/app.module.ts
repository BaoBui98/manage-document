import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.conf';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/typeorm/typeorm.module';
import { UserModule } from './user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guard/auth.guard';
import { RolesGuard } from './guard/roles.guard';
import { JwtModule } from '@nestjs/jwt';
import { DocumentModule } from './document/document.module';
import { UploadModule } from './upload/upload.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv, // NestJS sẽ tự động chạy hàm này khi load app
    }),
    JwtModule.register({ global: true }),
    DatabaseModule,
    AuthModule,
    UserModule,
    DocumentModule,
    UploadModule,
    SubscriptionModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule { }
