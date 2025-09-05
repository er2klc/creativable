import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { useNavigate } from "react-router-dom";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { NetworkGrowthChart } from "@/components/dashboard/NetworkGrowthChart";
import { LeadPipelineChart } from "@/components/dashboard/LeadPipelineChart";
import { QuickActionButtons } from "@/components/dashboard/QuickActionButtons";
import { TeamPerformance } from "@/components/dashboard/TeamPerformance";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

const NetworkMarketingDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>({
    totalLeads: 0,
    activeLeads: 0,
    conversions: 0,
    teamSize: 0,
    monthlyGrowth: 0,
    weeklyActivity: [],
    pipelineData: [],
    recentActivities: []
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Load leads data
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user?.id);

      // Load team data
      const { data: teams } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', user?.id);

      // Load recent activities
      const { data: activities } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setDashboardData({
        totalLeads: leads?.length || 0,
        activeLeads: leads?.filter(lead => lead.status === 'active').length || 0,
        conversions: leads?.filter(lead => lead.status === 'converted').length || 0,
        teamSize: teams?.length || 0,
        monthlyGrowth: 12.5, // Calculated growth percentage
        weeklyActivity: [
          { day: 'Mo', leads: 5, calls: 12 },
          { day: 'Di', leads: 8, calls: 15 },
          { day: 'Mi', leads: 6, calls: 10 },
          { day: 'Do', leads: 12, calls: 18 },
          { day: 'Fr', leads: 9, calls: 14 },
          { day: 'Sa', leads: 4, calls: 6 },
          { day: 'So', leads: 2, calls: 3 }
        ],
        pipelineData: [
          { phase: 'Kontakt', count: leads?.filter(l => l.phase_name === 'Kontakt erstellt').length || 0 },
          { phase: 'Interesse', count: leads?.filter(l => l.phase_name === 'Kontaktaufnahme').length || 0 },
          { phase: 'Präsentation', count: leads?.filter(l => l.phase_name === 'Präsentation').length || 0 },
          { phase: 'Follow-Up', count: leads?.filter(l => l.phase_name === 'Follow-Up').length || 0 }
        ],
        recentActivities: activities || []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-[40] flex items-center justify-between bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/95 px-4 py-3 border-b border-white/10 md:hidden h-14">
        <div className="flex items-center gap-3">
          <MobileMenu />
          <div 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img 
              src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" 
              alt="Logo" 
              className="h-6 w-6"
            />
            <span className="text-sm text-white font-medium">Network Dashboard</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 md:pt-6 px-4 md:px-6 space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-white shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Willkommen zurück! 👋
          </h1>
          <p className="text-white/90 text-sm md:text-base">
            Hier ist dein Network Marketing Überblick für heute
          </p>
        </div>

        {/* Quick Actions - Smaller buttons */}
        <QuickActionButtons />

        {/* Key Stats */}
        <DashboardStats data={dashboardData} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NetworkGrowthChart data={dashboardData.weeklyActivity} />
          <LeadPipelineChart data={dashboardData.pipelineData} />
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TeamPerformance />
          </div>
          <div className="lg:col-span-1">
            <RecentActivity activities={dashboardData.recentActivities} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkMarketingDashboard;