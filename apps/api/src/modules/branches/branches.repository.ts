import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import type { TBranchFilter } from '@/common/access-scope';
import { AccessScope } from '@/common/access-scope';
import { db } from '@/common/database';
import type { TUser } from '@/modules/auth/identity';
import type { IBranch } from '@/modules/branches/branches.interface';

export const branchListSql = (visible: Prisma.Sql): Prisma.Sql => Prisma.sql`
      SELECT b.id, b.name, b.company_id, c.name AS company
      FROM branches b JOIN companies c ON c.id = b.company_id
      WHERE ${visible} ORDER BY b.id`;

@Injectable()
export class BranchesRepository {
  constructor(private readonly scope: AccessScope) {}
  list(viewer: TUser, filters: TBranchFilter = {}) {
    const visible = this.scope.predicate(viewer, filters);
    return db.$queryRaw<IBranch[]>(branchListSql(visible));
  }
}
