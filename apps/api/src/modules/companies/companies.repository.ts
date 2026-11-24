import { Injectable } from '@nestjs/common';

import { db } from '@/common/database';
import type { TUser } from '@/modules/auth/identity';

@Injectable()
export class CompaniesRepository {
  list(viewer: TUser) {
    return db.company.findMany({
      where: viewer.role === 'admin' ? {} : { id: viewer.company_id },
      orderBy: { id: 'asc' },
    });
  }
}
