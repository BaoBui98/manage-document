import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Roles } from '../decorator/roles.decorator';
import { Public } from '../decorator/public.decorator';
import { UserRole } from '../user/entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Subscription')
@ApiBearerAuth()
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @Roles(UserRole.ADMIN) // Chỉ Admin mới được tạo
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionService.create(createSubscriptionDto);
  }

  @Get()
  @Public() // Bất kỳ ai cũng có thể xem danh sách các gói
  findAll() {
    return this.subscriptionService.findAll();
  }

  @Get(':id')
  @Public() // Bất kỳ ai cũng có thể xem chi tiết 1 gói
  findOne(@Param('id') id: string) {
    return this.subscriptionService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN) // Chỉ Admin mới được update
  update(@Param('id') id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionService.update(id, updateSubscriptionDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN) // Chỉ Admin mới được xóa
  remove(@Param('id') id: string) {
    return this.subscriptionService.remove(id);
  }
}
