import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ThrottlerModule } from '@nestjs/throttler';

// import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
      ThrottlerModule.forRoot({
        throttlers: [
          {
        ttl: 60,  //60 seconds
        limit: 100, // general limit for all endpoints
      },
    ],
      }),
    PrismaModule,
    AuthModule,
    MailModule,
    ProfileModule,
    // UsersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
