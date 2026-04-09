type SectionHeadingProps = {
  title: string;
  description?: string;
};

export function SectionHeading({ title, description }: SectionHeadingProps) {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">{title}</h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-6 text-muted sm:text-base">{description}</p>
      ) : null}
    </div>
  );
}
