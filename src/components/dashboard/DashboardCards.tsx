import { DashboardMetrics } from "./DashboardMetrics";
import { LeadPhases } from "./LeadPhases";

export function DashboardCards() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetrics />
      </div>
      <div className="grid gap-4">
        <LeadPhases />
      </div>
    </div>
  );
}