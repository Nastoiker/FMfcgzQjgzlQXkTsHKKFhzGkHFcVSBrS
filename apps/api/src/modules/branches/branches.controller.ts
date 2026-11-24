import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { Actor } from '@/common/session.decorator';
import type { TUser } from '@/modules/auth/identity';
import { BranchesService } from '@/modules/branches/branches.service';

@Controller('branches')
export class BranchesController {
  constructor(private readonly service: BranchesService) {}
  @Get() list(@Actor() viewer: TUser) {
    return this.service.list(viewer);
  }
  @Get(':id') one(@Actor() viewer: TUser, @Param('id', ParseIntPipe) id: number) {
    return this.service.one(viewer, id);
  }
}
