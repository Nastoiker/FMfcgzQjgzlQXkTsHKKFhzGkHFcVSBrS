import Button from '@mui/material/Button';
import type { ReactElement } from 'react';

import { useLogin } from '@/features/sign-in/model/use-login';
import { PasswordField } from '@/features/sign-in/ui/password-field';
export const SignInForm = (): ReactElement => {
  const auth = useLogin();
  return (
    <form
      className="login__form"
      onSubmit={(e) => {
        e.preventDefault();
        auth.mutate(new FormData(e.currentTarget));
      }}
    >
      <h1>Вход в кабинет</h1>
      <label>
        Логин
        <input required name="login" autoComplete="username" />
      </label>
      <PasswordField
        invalid={auth.error?.message === 'Неверный логин или пароль'}
        error={auth.error?.message}
      />
      {auth.error && (
        <p id="login-error" role="alert">
          {auth.error.message}
        </p>
      )}
      <Button type="submit" variant="contained" disabled={auth.isPending}>
        {auth.isPending ? 'Входим…' : 'Войти'}
      </Button>
    </form>
  );
};
