import { DashboardMetrics } from "./DashboardMetrics";
import { LeadPhases } from "./LeadPhases";
import { EmbeddingsManager } from "./EmbeddingsManager";

export function DashboardCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DashboardMetrics />
      <LeadPhases />
      <div className="md:col-span-2">
        <EmbeddingsManager />
      </div>
    </div>
  );
}