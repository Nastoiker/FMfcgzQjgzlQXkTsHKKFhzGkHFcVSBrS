import { createHash } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { db } from '@/common/database';
import { LoginLimited } from '@/common/errors';
import type { ILoginTicket } from '@/modules/auth/login-attempt.interface';

const maximum = 5;

@Injectable()
export class LoginAttempts {
  /** Место резервируется до bcrypt, поэтому параллельные запросы делят один лимит. */
  async reserve(login: string): Promise<ILoginTicket> {
    const key = createHash('sha256').update(login).digest('hex');
    await db.$executeRaw`DELETE FROM login_windows WHERE expires_at <= CURRENT_TIMESTAMP`;
    const rows = await db.$queryRaw<ILoginTicket[]>`
      INSERT INTO login_windows AS w (key,attempts,expires_at)
      VALUES (${key},1,date_trunc('milliseconds',CURRENT_TIMESTAMP)+INTERVAL '10 minutes')
      ON CONFLICT(key) DO UPDATE SET
        attempts=CASE WHEN w.expires_at<=CURRENT_TIMESTAMP THEN 1 ELSE w.attempts+1 END,
        expires_at=CASE WHEN w.expires_at<=CURRENT_TIMESTAMP THEN excluded.expires_at ELSE w.expires_at END
      WHERE w.attempts<${maximum} OR w.expires_at<=CURRENT_TIMESTAMP
      RETURNING key,expires_at`;
    const ticket = rows.at(0);
    if (ticket) return ticket;
    const remaining = await db.$queryRaw<{ seconds: number }[]>`
      SELECT greatest(1,ceil(extract(epoch FROM expires_at-CURRENT_TIMESTAMP)))::int AS seconds
      FROM login_windows WHERE key=${key}`;
    throw new LoginLimited(remaining.at(0)?.seconds ?? 1);
  }
  async release(ticket: ILoginTicket): Promise<void> {
    await db.$executeRaw`UPDATE login_windows SET attempts=attempts-1
      WHERE key=${ticket.key} AND expires_at=${ticket.expires_at} AND attempts>0`;
  }
}
