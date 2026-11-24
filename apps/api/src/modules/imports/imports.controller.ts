import { Body, Controller, Post } from '@nestjs/common';

import { Actor, AdminOnly } from '@/common/session.decorator';
import type { TUser } from '@/modules/auth/identity';
import { ImportPeriod } from '@/modules/imports/dto/imports.dto';
import { ImportsService } from '@/modules/imports/imports.service';

@Controller('imports')
export class ImportsController {
  constructor(private readonly service: ImportsService) {}
  @AdminOnly() @Post() run(@Actor() viewer: TUser, @Body() period: ImportPeriod) {
    return this.service.run(viewer, period);
  }
}
