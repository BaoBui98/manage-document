import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { BcryptService } from './bcrypt.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly bcryptService: BcryptService,
    private readonly tokenService: TokenService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const isEmailExist = await this.userService.checkEmailExist(createUserDto.email);
    if (isEmailExist) {
      throw new ConflictException('Email đã tồn tại trong hệ thống');
    }

    const hashedPassword = await this.bcryptService.hashPassword(createUserDto.password);
    
    // Tạo user thông qua UserService đã được inject
    const newUser = await this.userService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Xóa password trước khi trả về (hoặc để UserService lo)
    const { password, ...result } = newUser;
    return result;
  }

  async login(loginDto: LoginDto) {
    // Tìm user qua email (Hàm này có ném ra lỗi nếu không thấy, nhưng để an toàn ta xử lý thêm)
    const user = await this.userService.findUserByEmail(loginDto.email);
    
    // So sánh mật khẩu
    const isPasswordValid = await this.bcryptService.comparePassword(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu không chính xác');
    }

    // Generate JWT token
    const payload = { sub: user.id, username: user.username, role: user.role, email: user.email };
    return await this.tokenService.generateTokens(payload);
  }
}
