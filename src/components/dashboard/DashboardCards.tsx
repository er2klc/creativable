import { DashboardMetrics } from "./DashboardMetrics";
import { LeadPhases } from "./LeadPhases";

export function DashboardCards() {
  return (
    <div className="space-y-8">
      <DashboardMetrics />
      <LeadPhases />
    </div>
  );
}