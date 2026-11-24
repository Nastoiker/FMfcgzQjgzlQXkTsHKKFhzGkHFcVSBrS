import { JwtService } from '@nestjs/jwt';

import { config } from '@/common/config';

export const sessionSeconds = 8 * 60 * 60;

export const jwt = new JwtService({
  secret: config.secret,
  signOptions: { expiresIn: sessionSeconds, algorithm: 'HS256' },
  verifyOptions: { algorithms: ['HS256'] },
});
