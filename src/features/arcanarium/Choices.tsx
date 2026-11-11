import { useId } from "react";
/** Visible native radios use no Android dialog and preserve keyboard/TalkBack semantics. */
export function Choices({
  label,
  value,
  options,
  onChange,
}: {
  readonly label: string;
  readonly value: string;
  readonly options: readonly { value: string; label: string }[];
  readonly onChange: (value: string) => void;
}) {
  const name = useId();
  return (
    <fieldset className="arcana-choices arcana-choices--compact">
      <legend>{label}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className="arcana-choice"
          data-selected={value === option.value}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
