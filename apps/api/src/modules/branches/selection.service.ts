import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { AccessScope } from '@/common/access-scope';
import type { Filter } from '@/common/filters.dto';
import { validatePeriod } from '@/common/period';
import type { TUser } from '@/modules/auth/identity';
import { BranchesService } from '@/modules/branches/branches.service';

@Injectable()
export class Selection {
  constructor(
    private readonly scope: AccessScope,
    private readonly branches: BranchesService,
  ) {}
  async ids(viewer: TUser, filters: Filter): Promise<Prisma.Sql> {
    validatePeriod(filters);
    const predicate = this.scope.predicate(viewer, filters);
    if (filters.branchId !== undefined)
      await this.branches.one(viewer, filters.branchId, filters.company);
    return Prisma.sql`SELECT b.id FROM branches b WHERE ${predicate}`;
  }
}
