import type { ReactElement } from 'react';
import { useEffect, useRef } from 'react';

export const PasswordField = ({
  invalid,
  error,
}: {
  invalid: boolean;
  error: string | undefined;
}): ReactElement => {
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (invalid) field.current?.focus();
  }, [invalid, error]);
  return (
    <label>
      Пароль
      <input
        ref={field}
        required
        name="password"
        type="password"
        autoComplete="current-password"
        aria-invalid={invalid || undefined}
        aria-describedby={error ? 'login-error' : undefined}
      />
    </label>
  );
};
