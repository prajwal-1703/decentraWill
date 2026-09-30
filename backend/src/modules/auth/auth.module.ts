import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CryptoService } from '../../common/crypto.service';
import { JwtAuthGuard } from '../../common/guards';

@Module({
  controllers: [AuthController],
  providers: [AuthService, CryptoService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
