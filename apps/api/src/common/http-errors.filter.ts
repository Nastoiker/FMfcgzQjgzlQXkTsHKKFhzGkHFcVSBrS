import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException, Logger } from '@nestjs/common';
import type { Response } from 'express';

import { BranchNotFound, InvalidPeriod, LoginLimited } from '@/common/errors';

@Catch()
export class Errors implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost): void {
    let status = 500;
    if (error instanceof BranchNotFound) status = 404;
    if (error instanceof InvalidPeriod) status = 400;
    if (error instanceof HttpException) status = error.getStatus();
    const response = host.switchToHttp().getResponse<Response>();
    if (error instanceof LoginLimited) {
      status = 429;
      response.setHeader('Retry-After', String(error.retryAfter));
    }
    if (status === 500) Logger.error('Необработанная ошибка запроса');
    const message = status < 500 && error instanceof Error ? error.message : 'Ошибка сервера';
    response.status(status).json({ status, message });
  }
}
