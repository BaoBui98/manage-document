import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanUsagesService } from './plan-usages.service';
import { PlanUsagesController } from './plan-usages.controller';
import { PlanUsage } from './entities/plan-usage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanUsage])],
  controllers: [PlanUsagesController],
  providers: [PlanUsagesService],
  exports: [PlanUsagesService], // Export để các module khác (như PaymentModule) có thể gọi
})
export class PlanUsagesModule {}
