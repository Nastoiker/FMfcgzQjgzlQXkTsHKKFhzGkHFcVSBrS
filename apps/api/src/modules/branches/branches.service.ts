import { Injectable } from '@nestjs/common';

import { BranchNotFound } from '@/common/errors';
import type { TUser } from '@/modules/auth/identity';
import { BranchesRepository } from '@/modules/branches/branches.repository';

@Injectable()
export class BranchesService {
  constructor(private readonly repo: BranchesRepository) {}
  list(viewer: TUser) {
    return this.repo.list(viewer);
  }
  async one(viewer: TUser, id: number, company?: number) {
    const branch = (await this.repo.list(viewer, { branchId: id, company })).at(0);
    if (!branch) throw new BranchNotFound();
    return branch;
  }
}
