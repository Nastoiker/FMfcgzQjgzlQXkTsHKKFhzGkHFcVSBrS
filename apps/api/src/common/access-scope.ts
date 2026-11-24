import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import type { Filter } from '@/common/filters.dto';
import type { TUser } from '@/modules/auth/identity';

export type TBranchFilter = Pick<Filter, 'company' | 'branchId'>;

@Injectable()
export class AccessScope {
  /** TASK.md §1. Даже для «Всех филиалов» компанию клиента задаёт сессия. */
  predicate(user: TUser, { company, branchId }: TBranchFilter): Prisma.Sql {
    if (company !== undefined && user.role !== 'admin') throw new ForbiddenException();
    const companyId = user.role === 'client' ? user.company_id : company;
    const tenant =
      companyId === undefined ? Prisma.sql`TRUE` : Prisma.sql`b.company_id=${companyId}`;
    return branchId === undefined ? tenant : Prisma.sql`${tenant} AND b.id=${branchId}`;
  }
}
