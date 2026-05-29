import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'johndoe', description: 'The username of the user' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Username cần ít nhất 3 ký tự' })
  @MaxLength(100)
  username: string;

  @ApiProperty({ example: 'password123', description: 'The password of the user' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Mật khẩu cần ít nhất 6 ký tự' })
  @MaxLength(255)
  password: string;

  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiPropertyOptional({ example: '0987654321', description: 'The phone number of the user' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;
}
