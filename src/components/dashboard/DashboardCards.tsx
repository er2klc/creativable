import { DashboardMetrics } from "./DashboardMetrics";
import { LeadPhases } from "./LeadPhases";

export function DashboardCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DashboardMetrics />
      <LeadPhases />
    </div>
  );
}