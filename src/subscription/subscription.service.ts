import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    const sub = this.subscriptionRepo.create(createSubscriptionDto);
    return await this.subscriptionRepo.save(sub);
  }

  async findAll() {
    return await this.subscriptionRepo.find();
  }

  async findOne(id: string) {
    const sub = await this.subscriptionRepo.findOne({ where: { id } });
    if (!sub) {
      throw new NotFoundException('Subscription không tồn tại');
    }
    return sub;
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    const sub = await this.findOne(id);
    this.subscriptionRepo.merge(sub, updateSubscriptionDto);
    return await this.subscriptionRepo.save(sub);
  }

  async remove(id: string) {
    const sub = await this.findOne(id);
    return await this.subscriptionRepo.remove(sub);
  }
}
