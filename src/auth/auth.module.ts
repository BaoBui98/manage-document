import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { envConfig } from 'src/config/env.conf';
import { BcryptService } from './bcrypt.service';
import { TokenService } from './token.service';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, BcryptService, TokenService],
  exports: [BcryptService, TokenService],
})
export class AuthModule { }
