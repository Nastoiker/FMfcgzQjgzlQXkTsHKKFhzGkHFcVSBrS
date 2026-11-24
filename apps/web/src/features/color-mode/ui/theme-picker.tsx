import { useColorScheme } from '@mui/material/styles';
import type { ReactElement } from 'react';

import { Choice } from '@/shared/ui/choice';
const options = { system: 'Системная', light: 'Светлая', dark: 'Тёмная' };
export const ThemePicker = (): ReactElement => {
  const { mode, setMode } = useColorScheme();
  return (
    <div className="theme">
      <Choice
        label="Тема"
        value={mode ?? 'system'}
        options={options}
        onChange={(next) => {
          if (next === 'system' || next === 'light' || next === 'dark') setMode(next);
        }}
      />
    </div>
  );
};
