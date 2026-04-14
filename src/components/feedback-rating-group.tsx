type FeedbackRatingGroupProps = {
  name: string;
  label: string;
  description: string;
  value?: number | null;
  onChange: (value: number | null) => void;
  error?: string;
};

export function FeedbackRatingGroup({
  name,
  label,
  description,
  value,
  onChange,
  error,
}: FeedbackRatingGroupProps) {
  const options = [
    ...Array.from({ length: 10 }, (_, index) => ({
      key: String(index + 1),
      label: String(index + 1),
      value: index + 1,
    })),
    {
      key: "na",
      label: "N/A",
      value: null,
    },
  ];

  return (
    <fieldset className="panel space-y-4 p-5">
      <div className="space-y-1">
        <legend className="text-base font-semibold text-foreground">{label}</legend>
        <p className="text-sm text-muted">{description}</p>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-11 sm:gap-3">
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <label
              key={option.key}
              className={`flex min-h-11 cursor-pointer items-center justify-center rounded-md border text-sm font-medium ${
                selected
                  ? "border-accent bg-accent text-white"
                  : "border-card-border bg-card text-foreground hover:border-accent hover:bg-accent-soft"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value ?? "na"}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
    </fieldset>
  );
}
