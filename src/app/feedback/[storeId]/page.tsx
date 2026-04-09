import Link from "next/link";
import { notFound } from "next/navigation";
import { FeedbackForm } from "@/components/feedback-form";
import { SectionHeading } from "@/components/section-heading";
import { requireProfiledUser } from "@/lib/access";
import { getActiveQuestions, getStoreById } from "@/lib/queries";

type FeedbackPageProps = {
  params: Promise<{ storeId: string }>;
};

export const dynamic = "force-dynamic";

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { storeId } = await params;
  await requireProfiledUser(`/feedback/${storeId}`);
  const [store, questions] = await Promise.all([getStoreById(storeId), getActiveQuestions()]);

  if (!store || questions.length === 0) {
    notFound();
  }

  return (
    <div className="grid gap-6 pb-8 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <div className="panel p-5">
          <SectionHeading title={store.name} description="Complete the form for this store." />
          <dl className="mt-5 space-y-3 text-sm">
            <div>
              <dt className="text-muted">Store code</dt>
              <dd className="mt-1 text-foreground">{store.code}</dd>
            </div>
            <div>
              <dt className="text-muted">Region</dt>
              <dd className="mt-1 text-foreground">{store.region ?? "Not assigned"}</dd>
            </div>
            <div>
              <dt className="text-muted">Questions</dt>
              <dd className="mt-1 text-foreground">{questions.length} active ratings</dd>
            </div>
          </dl>
        </div>
        <Link href="/" className="button-secondary">
          Back to stores
        </Link>
      </aside>

      <section className="space-y-4">
        <SectionHeading
          title="Feedback form"
          description="Rate each question from 1 to 10 and optionally add a comment. Your signed-in email will be attached to this feedback."
        />
        <FeedbackForm storeId={store.id} storeName={store.name} questions={questions} />
      </section>
    </div>
  );
}
