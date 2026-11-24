import { Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';

import { AuthRepository } from '@/modules/auth/auth.repository';
import { Login } from '@/modules/auth/dto/login.dto';
import { claims } from '@/modules/auth/identity';
import { LoginAttempts } from '@/modules/auth/login-attempts.repository';
import { jwt } from '@/modules/auth/session-token';

@Injectable()
export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly attempts: LoginAttempts,
  ) {}
  private async verify(login: string, password: string) {
    const account = await this.repository.account(login);
    if (!account || !(await bcrypt.compare(password, account.password))) return null;
    const identity = claims.safeParse(account);
    return identity.success ? identity.data : null;
  }
  async login(input: Login) {
    const name = input.login.trim().toLowerCase();
    const login = name.includes('@') ? name : name + '@example.com';
    const ticket = await this.attempts.reserve(login);
    let failed = false;
    try {
      const user = await this.verify(login, input.password);
      if (!user) {
        failed = true;
        throw new UnauthorizedException('Неверный логин или пароль');
      }
      return { user, token: jwt.sign(user) };
    } finally {
      if (!failed) await this.attempts.release(ticket);
    }
  }
}
