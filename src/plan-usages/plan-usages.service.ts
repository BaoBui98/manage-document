import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanUsage } from './entities/plan-usage.entity';
import { CreatePlanUsageDto } from './dto/create-plan-usage.dto';
import { UpdatePlanUsageDto } from './dto/update-plan-usage.dto';

@Injectable()
export class PlanUsagesService {
  constructor(
    @InjectRepository(PlanUsage)
    private readonly planUsageRepo: Repository<PlanUsage>,
  ) {}

  async upsertPlanUsage(userId: string, subscriptionId: string, subscriptionMaxDocument: number): Promise<PlanUsage> {
    // 1. Tìm xem user này đã có bản ghi usage nào chưa
    let planUsage = await this.planUsageRepo.findOne({ where: { userId } });

    if (!planUsage) {
      // 2a. Nếu chưa có -> Tạo mới
      planUsage = this.planUsageRepo.create({
        userId,
        subscriptionId,
        maxDocument: subscriptionMaxDocument,
        usedDocument: 0,
      });
    } else {
      // 2b. Nếu đã có -> Cập nhật và cộng dồn maxDocument
      planUsage.subscriptionId = subscriptionId;
      planUsage.maxDocument += subscriptionMaxDocument;
      // usedDocument giữ nguyên
    }

    // 3. Lưu vào Database
    return await this.planUsageRepo.save(planUsage);
  }

  create(createPlanUsageDto: CreatePlanUsageDto) {
    return 'This action adds a new planUsage';
  }

  findAll() {
    return `This action returns all planUsages`;
  }

  findOne(id: string) {
    return `This action returns a #${id} planUsage`;
  }

  update(id: string, updatePlanUsageDto: UpdatePlanUsageDto) {
    return `This action updates a #${id} planUsage`;
  }

  remove(id: string) {
    return `This action removes a #${id} planUsage`;
  }
}
