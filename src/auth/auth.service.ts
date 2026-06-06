import { randomUUID } from 'crypto';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LogoutDto } from './dto/logout.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { RequestPasswordResetDto } from './dto/requestPasswordReset.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { fullName, email, password, role } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        role,
      },
    });
    // create verification token
    const token = randomUUID();

    await this.prisma.verificationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
      },
    });

    await this.mailService.sendVerificationEmail(email, token);

    const verificationLink = `${process.env.APP_URL}/auth/verify-email?token=${token}`;
    console.log('VERIFY EMAIL LINK:', verificationLink);

    return {
      success: true,
      message: 'User registered successfully',
      data: null,
    };
  }

  async refresh(dto: RefreshTokenDto) {
  const { refreshToken } = dto;

  const session = await this.prisma.session.findFirst({
    where: {
      refreshToken,
    },
  });

  if (!session) {
    throw new UnauthorizedException(
      'Invalid refresh token',
    );
  }

  const payload = await this.jwtService.verifyAsync(
    refreshToken,
    {
      secret: this.configService.get<string>(
        'JWT_REFRESH_SECRET',
      ),
    },
  );

  const user = await this.prisma.user.findUnique({
    where: {
      id: payload.sub,
    },
  });

  if (!user) {
    throw new UnauthorizedException(
      'User not found',
    );
  }

  const tokens = await this.generateTokens(
    user.id,
    user.email,
    user.role,
  );

  return {
    success: true,
    message: 'Token refreshed successfully',
    data: tokens,
  };
}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

     // CHECK LOCK
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new UnauthorizedException(
      'Account temporarily locked. Try again later.',
    );
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    await this.prisma.user.update({
      where: { email },
      data: {
        failedLoginAttempts: {
          increment: 1,
        },
      },
    });

    // LOCK AFTER 5 FAILS
    if (user.failedLoginAttempts + 1 >= 5) {
      await this.prisma.user.update({
        where: { email },
        data: {
          lockUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
          failedLoginAttempts: 0,
        },
      });
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  // RESET ON SUCCESS
  await this.prisma.user.update({
    where: { email },
    data: {
      failedLoginAttempts: 0,
      lockUntil: null,
    },
  });

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
    );

    return {
      success: true,
      message: 'Login successful',
      data: tokens,
    };
  }

  private async generateTokens(
  userId: string,
  email: string,
  role: string,
) {
  const accessToken = await this.jwtService.signAsync(
    {
      sub: userId,
      email,
      role,
    },
    {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    },
  );

  const refreshToken = await this.jwtService.signAsync(
    {
      sub: userId,
    },
    {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    },
  );

  await this.prisma.session.create({
    data: {
      userId,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
  };
}

  async verifyEmail(token: string) {
    const storedToken = await this.prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!storedToken) {
      throw new BadRequestException('Invalid token');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new BadRequestException('Token expired');
    }

    await this.prisma.user.update({
      where: { id: storedToken.userId },
      data: { isVerified: true },
    });

    await this.prisma.verificationToken.delete({
      where: { token },
    });

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

async requestPasswordReset(dto: RequestPasswordResetDto) {
    const { email } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

  // IMPORTANT: don't leak user existence
  if (!user) {
    return {
      success: true,
      message: 'If account exists, email has been sent',
    };
  }

  const token = randomUUID();

  await this.prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 60 min
    },
  });

  const link = `${process.env.APP_URL}/auth/reset-password?token=${token}`;

  await this.mailService.sendResetPasswordEmail(user.email, link);

  return {
    success: true,
    message: 'If account exists, email has been sent',
  };
}

async resetPassword(dto: ResetPasswordDto) {
  const { token, password } = dto;

  const resetToken = await this.prisma.passwordResetToken.findUnique({
    where: {
      token,
    },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw new BadRequestException('Invalid or expired token');
  }

  const hash = await bcrypt.hash(password, 12);

  await this.prisma.user.update({
    where: {
      id: resetToken.userId,
    },
    data: {
      passwordHash: hash,
    },
  });

  await this.prisma.passwordResetToken.delete({
    where: {
      token,
    },
  });

  return {
    success: true,
    message: 'Password reset successful',
  };
}

async logout(
  dto: LogoutDto,
) {
  const { refreshToken } = dto;

  await this.prisma.session.deleteMany({
    where: {
      refreshToken,
    },
  });

  return {
    success: true,
    message: 'Logged out successfully',
  };
}
}
