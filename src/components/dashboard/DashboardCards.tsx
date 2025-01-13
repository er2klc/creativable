import { DashboardMetrics } from "./DashboardMetrics";
import { LeadPhases } from "./LeadPhases";

export function DashboardCards() {
  return (
    <div className="space-y-4 md:space-y-8">
      <div className="grid gap-4 md:gap-8">
        <DashboardMetrics />
        <LeadPhases />
      </div>
    </div>
  );
}