import { Injectable } from '@nestjs/common';

import type { TUser } from '@/modules/auth/identity';
import { CompaniesRepository } from '@/modules/companies/companies.repository';

@Injectable()
export class CompaniesService {
  constructor(private readonly repo: CompaniesRepository) {}
  list(viewer: TUser) {
    return this.repo.list(viewer);
  }
}
