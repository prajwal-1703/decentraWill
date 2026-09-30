import { Controller, Post, Body, Req, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshDto, StepUpDto, ConnectWalletDto } from './auth.dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import { Request } from 'express';

@ApiTags('Authentication')
@Controller('api/v1')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth/register')
  @ApiOperation({ summary: 'Register a new user account' })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string);
    const corrId = req.headers['x-correlation-id'] as string;
    return this.authService.register(dto, ip, corrId);
  }

  @Post('auth/login')
  @ApiOperation({ summary: 'Authenticate with email and password' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const userAgent = req.headers['user-agent'];
    const ip = req.ip || (req.headers['x-forwarded-for'] as string);
    const corrId = req.headers['x-correlation-id'] as string;
    return this.authService.login(dto, userAgent, ip, corrId);
  }

  @Post('auth/refresh')
  @ApiOperation({ summary: 'Rotate and refresh access token' })
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto);
  }

  @Post('auth/logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke current session' })
  async logout(@Headers('authorization') authHeader: string) {
    const token = authHeader.replace('Bearer ', '');
    return this.authService.logout(token);
  }

  @Post('auth/step-up')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perform step-up authentication to receive high-privilege token' })
  async stepUp(@CurrentUser('id') userId: string, @Body() dto: StepUpDto, @Req() req: Request) {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string);
    const corrId = req.headers['x-correlation-id'] as string;
    return this.authService.stepUp(userId, dto, ip, corrId);
  }

  @Post('wallets/connect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Link crypto wallet address to authenticated account' })
  async connectWallet(@CurrentUser('id') userId: string, @Body() dto: ConnectWalletDto) {
    return this.authService.connectWallet(userId, dto);
  }
}
