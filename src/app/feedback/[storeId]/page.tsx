import Link from "next/link";
import { notFound } from "next/navigation";
import { FeedbackForm } from "@/components/feedback-form";
import { SectionHeading } from "@/components/section-heading";
import { getActiveQuestions, getStoreById } from "@/lib/queries";

type FeedbackPageProps = {
  params: Promise<{ storeId: string }>;
};

export const dynamic = "force-dynamic";

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { storeId } = await params;
  const [store, questions] = await Promise.all([getStoreById(storeId), getActiveQuestions()]);

  if (!store || questions.length === 0) {
    notFound();
  }

  return (
    <div className="grid gap-6 pb-8 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="glass-panel rounded-[36px] p-6 sm:p-8">
        <SectionHeading
          eyebrow="Store selected"
          title={store.name}
          description="Rate each category from 1 to 10. Feedback is anonymous and no personal data is stored."
        />
        <dl className="mt-8 grid gap-4 text-sm text-muted">
          <div className="rounded-[24px] border border-card-border bg-background/65 p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Store code
            </dt>
            <dd className="mt-2 text-base font-medium text-foreground">{store.code}</dd>
          </div>
          <div className="rounded-[24px] border border-card-border bg-background/65 p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Region
            </dt>
            <dd className="mt-2 text-base font-medium text-foreground">
              {store.region ?? "Not assigned"}
            </dd>
          </div>
          <div className="rounded-[24px] border border-card-border bg-background/65 p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Privacy
            </dt>
            <dd className="mt-2 text-base font-medium text-foreground">
              No names, emails, IDs, or IPs collected.
            </dd>
          </div>
        </dl>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full border border-card-border px-5 text-sm font-semibold text-foreground hover:border-accent/60 hover:text-accent"
        >
          Choose another store
        </Link>
      </section>

      <section className="space-y-5">
        <FeedbackForm storeId={store.id} storeName={store.name} questions={questions} />
      </section>
    </div>
  );
}
