import { Injectable } from '@nestjs/common';

import { db } from '@/common/database';

@Injectable()
export class AuthRepository {
  account(login: string) {
    return db.user.findUnique({ where: { login } });
  }
}
