import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { LeadPhases } from "@/components/dashboard/LeadPhases";
import { EmbeddingsManager } from "@/components/dashboard/EmbeddingsManager";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <DashboardHeader />
      <QuickActions />
      <DashboardMetrics />
      <LeadPhases />
      <EmbeddingsManager />
    </div>
  );
};

export default Dashboard;