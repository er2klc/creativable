import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { LeadPhasesSimple } from "@/components/dashboard/LeadPhasesSimple";
import { useAuth } from "@/hooks/use-auth";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { useNavigate } from "react-router-dom";
const Dashboard = () => {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  return <div className="min-h-screen bg-gray-50/50">
      <div className="fixed top-0 left-0 right-0 z-[40] flex items-center justify-between bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/90 px-4 py-2 border-b border-sidebar-border md:hidden h-16">
        <div className="flex items-center gap-4">
          <MobileMenu />
          <div onClick={() => navigate("/dashboard")} className="flex items-center gap-2 cursor-pointer">
            <img src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" alt="Logo" className="h-8 w-8" />
            <span className="text-sm text-white font-light">creativable</span>
          </div>
        </div>
      </div>
      <DashboardHeader userEmail={user?.email} />
      <div className="space-y-8">
        <QuickActions />
        <DashboardMetrics />
        <LeadPhasesSimple />
      </div>
    </div>;
};
export default Dashboard;