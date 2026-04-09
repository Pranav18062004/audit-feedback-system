type FeedbackRatingGroupProps = {
  name: string;
  label: string;
  description: string;
  value?: number;
  onChange: (value: number) => void;
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
  return (
    <fieldset className="panel space-y-4 p-5">
      <div className="space-y-1">
        <legend className="text-base font-semibold text-foreground">{label}</legend>
        <p className="text-sm text-muted">{description}</p>
      </div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10 sm:gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
          const selected = value === score;

          return (
            <label
              key={score}
              className={`flex min-h-11 cursor-pointer items-center justify-center rounded-md border text-sm font-medium ${
                selected
                  ? "border-accent bg-accent text-white"
                  : "border-card-border bg-card text-foreground hover:border-accent hover:bg-accent-soft"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={score}
                checked={selected}
                onChange={() => onChange(score)}
                className="sr-only"
              />
              {score}
            </label>
          );
        })}
      </div>
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
    </fieldset>
  );
}
