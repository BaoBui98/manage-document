import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { envConfig } from '../config/env.conf';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateTokens(payload: any): Promise<{ access_token: string; refresh_token: string }> {
    const access_token = await this.jwtService.signAsync(payload, {
      secret: envConfig.jwtSecret,
      expiresIn: envConfig.jwtExpiresIn as JwtSignOptions['expiresIn'],
    });
    
    // Sinh refresh token với thời hạn cấu hình trong env và secret riêng
    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: envConfig.jwtRefreshSecret,
      expiresIn: envConfig.jwtRefreshExpiresIn as JwtSignOptions['expiresIn'],
    });

    return {
      access_token,
      refresh_token,
    };
  }
}
