import { IsNotEmpty, IsEnum, IsUUID } from 'class-validator';
import { BillingCycle } from '../entities/payment.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCheckoutDto {
  @ApiProperty({ description: 'ID của gói cước', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsUUID()
  subscriptionId: string;

  @ApiProperty({ enum: BillingCycle, description: 'Mua theo tháng hay năm', example: BillingCycle.MONTHLY })
  @IsNotEmpty()
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;
}
