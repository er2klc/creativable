
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { LeadPhases } from "@/components/dashboard/LeadPhases";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <DashboardHeader />
      <div className="pt-[132px] md:pt-[84px] space-y-8">
        <QuickActions />
        <DashboardMetrics />
        <LeadPhases />
      </div>
    </div>
  );
};

export default Dashboard;
