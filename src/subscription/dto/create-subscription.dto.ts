import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Tên gói cước', example: 'Gói Cao Cấp (Pro)' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Giá tiền khi đăng ký theo tháng (VNĐ)', example: 99000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  priceMonth: number;

  @ApiProperty({ description: 'Giá tiền khi đăng ký theo năm (VNĐ)', example: 990000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  priceYear: number;

  @ApiProperty({ description: 'Số lượng tài liệu tối đa người dùng được upload', example: 500 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  maxDocument: number;
}
