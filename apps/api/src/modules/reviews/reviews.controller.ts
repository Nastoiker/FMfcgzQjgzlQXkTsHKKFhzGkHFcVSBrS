import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query, Res } from '@nestjs/common';
import type { Response } from 'express';

import { Actor } from '@/common/session.decorator';
import type { TUser } from '@/modules/auth/identity';
import { ReviewChange, ReviewFilters } from '@/modules/reviews/dto/reviews.dto';
import { ReviewsService } from '@/modules/reviews/reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}
  @Get() async list(
    @Actor() viewer: TUser,
    @Query() filters: ReviewFilters,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { items, next } = await this.service.list(viewer, filters);
    if (next !== undefined) res.setHeader('X-Next-Cursor', String(next));
    return items;
  }
  @Patch(':id') change(
    @Actor() viewer: TUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() change: ReviewChange,
  ) {
    return this.service.change(viewer, id, change.status);
  }
}
