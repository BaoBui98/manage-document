import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { SubscriptionModule } from '../subscription/subscription.module';
import { PlanUsagesModule } from '../plan-usages/plan-usages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    SubscriptionModule, // Để dùng SubscriptionService
    PlanUsagesModule,   // Để dùng PlanUsagesService
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
