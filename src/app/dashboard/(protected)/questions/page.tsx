import { QuestionManager } from "@/components/question-manager";
import { getAllQuestionsForDashboard } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardQuestionsPage() {
  const questions = await getAllQuestionsForDashboard();

  return (
    <div className="space-y-6 pb-8">
      <section className="space-y-2 border-b border-card-border pb-4">
        <h2 className="text-2xl font-semibold text-foreground">Manage rating questions</h2>
        <p className="max-w-2xl text-sm leading-6 text-muted sm:text-base">
          Managers can add, rename, reorder, or deactivate the 1-10 rating questions that appear
          on the feedback form.
        </p>
      </section>

      <QuestionManager questions={questions} />
    </div>
  );
}
