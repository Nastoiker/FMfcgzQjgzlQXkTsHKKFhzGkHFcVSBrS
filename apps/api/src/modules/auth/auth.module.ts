import { Module } from '@nestjs/common';

import { AuthController } from '@/modules/auth/auth.controller';
import { AuthRepository } from '@/modules/auth/auth.repository';
import { AuthService } from '@/modules/auth/auth.service';
import { LoginAttempts } from '@/modules/auth/login-attempts.repository';

@Module({ controllers: [AuthController], providers: [AuthService, AuthRepository, LoginAttempts] })
export class AuthModule {}
