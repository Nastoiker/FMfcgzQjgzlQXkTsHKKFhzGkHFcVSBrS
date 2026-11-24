import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator, SetMetadata } from '@nestjs/common';
import type { Response } from 'express';

export const Actor = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): unknown =>
    ctx.switchToHttp().getResponse<Response>().locals.user,
);

export const AdminOnly = (): ReturnType<typeof SetMetadata> => SetMetadata('admin', true);
