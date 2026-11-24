import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';

import type { TUser } from '@/modules/auth/identity';
import { claims } from '@/modules/auth/identity';
import { jwt } from '@/modules/auth/session-token';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    if (this.reflector.get<boolean>('public', context.getHandler())) return true;
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.cookie?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
    if (!token) throw new UnauthorizedException();
    let user: TUser;
    try {
      const payload: unknown = jwt.verify(token);
      user = claims.parse(payload);
      context.switchToHttp().getResponse<Response>().locals.user = user;
    } catch {
      throw new UnauthorizedException();
    }
    if (this.reflector.get<boolean>('admin', context.getHandler()) && user.role !== 'admin')
      throw new ForbiddenException();
    return true;
  }
}
