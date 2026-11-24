import { Controller, Get } from '@nestjs/common';

import { Actor } from '@/common/session.decorator';
import type { TUser } from '@/modules/auth/identity';
import { CompaniesService } from '@/modules/companies/companies.service';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly service: CompaniesService) {}
  @Get() list(@Actor() viewer: TUser) {
    return this.service.list(viewer);
  }
}
