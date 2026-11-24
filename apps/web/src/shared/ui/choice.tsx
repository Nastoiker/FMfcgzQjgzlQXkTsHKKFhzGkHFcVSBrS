import Select from '@mui/material/Select';
import type { ReactElement } from 'react';
import { useId } from 'react';
interface IChoiceProps {
  label: string;
  value: string;
  all?: string;
  options: Record<string, string>;
  onChange: (value: string) => void;
  disabled?: boolean;
}
export const Choice = ({
  label,
  value,
  options,
  all,
  onChange,
  disabled,
}: IChoiceProps): ReactElement => {
  const id = useId();
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <Select<string>
        native
        size="small"
        value={value}
        disabled={disabled}
        inputProps={{ id }}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      >
        {all !== undefined && <option value="">{all}</option>}
        {Object.entries(options).map(([key, text]) => (
          <option key={key} value={key}>
            {text}
          </option>
        ))}
      </Select>
    </div>
  );
};
