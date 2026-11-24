import { Body, Controller, Get, Post, Res, SetMetadata } from '@nestjs/common';
import type { Response } from 'express';

import { config } from '@/common/config';
import { Actor } from '@/common/session.decorator';
import { AuthService } from '@/modules/auth/auth.service';
import { Login } from '@/modules/auth/dto/login.dto';
import type { TUser } from '@/modules/auth/identity';
import { sessionSeconds } from '@/modules/auth/session-token';

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @SetMetadata('public', true) @Post('login') async login(
    @Body() input: Login,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TUser> {
    const { user, token } = await this.auth.login(input);
    res.cookie('session', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: config.COOKIE_SECURE === 'true',
      path: '/api',
      maxAge: sessionSeconds * 1000,
    });
    return user;
  }
  @Post('logout') logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie('session', { path: '/api' });
  }
  @Get('me') me(@Actor() user: TUser): TUser {
    return user;
  }
}
