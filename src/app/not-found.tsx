import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 items-center pb-8">
      <section className="panel w-full p-6 text-center sm:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          We couldn&apos;t find that page.
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
          The store or dashboard route may be unavailable, inactive, or mistyped.
        </p>
        <Link
          href="/"
          className="button-primary mt-6"
        >
          Return home
        </Link>
      </section>
    </div>
  );
}
