import 'reflect-metadata';

import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NextFunction, Request, Response } from 'express';

import { AppModule } from '@/app.module';
import { Errors } from '@/common/http-errors.filter';

export const createApp = async (): Promise<INestApplication> => {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use((_request: Request, response: Response, next: NextFunction) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new Errors());
  return app;
};
