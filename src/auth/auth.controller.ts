import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { RequestPasswordResetDto } from './dto/requestPasswordReset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Throttle({
  default: {
    limit: 5,
    ttl: 60,
  },
})
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Post('requestPasswordReset')
requestPasswordReset(
  @Body() dto: RequestPasswordResetDto,) {
  return this.authService.requestPasswordReset(dto);
}

  @Public()
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Post('logout')
  logout(
    @Body() dto: LogoutDto
  ) {
    return this.authService.logout(dto);
  }

  @Public()
  @Post('refresh')
  refresh(
    @Body() dto: RefreshTokenDto,
  ) {
    return this.authService.refresh(dto);
  }
}