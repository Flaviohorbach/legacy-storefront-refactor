// Replaces the bootstrap-touchspin jQuery plugin: two buttons and a number input,
// with labels a screen reader can announce.
export function Quantity({
  value,
  max,
  onChange,
  label,
  id,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
  id: string;
}) {
  const button = "grid size-10 place-items-center border border-line text-lg hover:bg-wash disabled:opacity-30";
  return (
    <div className="flex items-center">
      <label htmlFor={id} className="sr-only">{label}</label>
      <button type="button" className={button} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label={`Decrease ${label.toLowerCase()}`}>
        −
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        value={value}
        onChange={(e) => {
          const next = e.currentTarget.valueAsNumber;
          if (Number.isFinite(next)) onChange(Math.min(Math.max(1, next), max));
        }}
        className="h-10 w-14 border-y border-line text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button type="button" className={button} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Increase ${label.toLowerCase()}`}>
        +
      </button>
    </div>
  );
}
