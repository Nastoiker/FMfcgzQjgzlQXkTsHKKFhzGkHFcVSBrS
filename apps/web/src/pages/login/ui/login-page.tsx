import type { ReactElement } from 'react';

import { ThemePicker } from '@/features/color-mode';
import { SignInForm } from '@/features/sign-in';
import { Brand } from '@/shared/ui/brand';
export const LoginPage = (): ReactElement => (
  <main className="login">
    <div className="login__bar">
      <Brand />
      <ThemePicker />
    </div>
    <SignInForm />
  </main>
);
