
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { LeadPhases } from "@/components/dashboard/LeadPhases";
import { useAuth } from "@/hooks/use-auth";
import { MobileMenu } from "@/components/layout/MobileMenu";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/90 px-2 py-2 border-b border-sidebar-border md:hidden">
        <MobileMenu />
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" 
            alt="Logo" 
            className="h-8 w-8"
          />
          <span className="text-sm text-white font-light">creativable</span>
        </div>
      </div>
      <DashboardHeader userEmail={user?.email} />
      <div className="pt-[132px] md:pt-[84px] space-y-8">
        <QuickActions />
        <DashboardMetrics />
        <LeadPhases />
      </div>
    </div>
  );
};

export default Dashboard;

