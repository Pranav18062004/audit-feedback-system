import { QuestionManager } from "@/components/question-manager";
import { getAllQuestionsForDashboard } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardQuestionsPage() {
  const questions = await getAllQuestionsForDashboard();

  return (
    <div className="space-y-6 pb-8">
      <section className="glass-panel rounded-[32px] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
          Feedback configuration
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Manage rating questions
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted sm:text-base">
          Managers can add, rename, reorder, or deactivate the 1-10 rating questions that appear
          on the public feedback form.
        </p>
      </section>

      <QuestionManager questions={questions} />
    </div>
  );
}
