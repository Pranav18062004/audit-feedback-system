import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 items-center pb-8">
      <section className="glass-panel w-full rounded-[36px] p-6 text-center sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">Not found</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          We couldn&apos;t find that page.
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
          The store or dashboard route may be unavailable, inactive, or mistyped.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-strong"
        >
          Return home
        </Link>
      </section>
    </div>
  );
}
