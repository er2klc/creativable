import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { UserStats } from "@/components/admin/stats/UserStats";
import { TeamPlatformStats } from "@/components/admin/stats/TeamPlatformStats";
import { RecentUsersTable } from "@/components/admin/users/RecentUsersTable";
import { AdminTabs } from "@/components/admin/AdminTabs";

interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  last_sign_in_at: string;
  created_at: string;
}

const Admin = () => {
  const session = useSession();
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalTeams, setTotalTeams] = useState<number>(0);
  const [totalPlatforms, setTotalPlatforms] = useState<number>(0);
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total users count
        const { count: totalCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        setTotalUsers(totalCount || 0);

        // Get total teams count
        const { count: teamsCount } = await supabase
          .from('teams')
          .select('*', { count: 'exact', head: true });

        setTotalTeams(teamsCount || 0);

        // Get total platforms count
        const { count: platformsCount } = await supabase
          .from('elevate_platforms')
          .select('*', { count: 'exact', head: true });

        setTotalPlatforms(platformsCount || 0);

        // Get recent users
        const { data: recentUsersData } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentUsersData) {
          setRecentUsers(recentUsersData as UserProfile[]);
        }

        // For demo purposes, set a random number of online users
        setOnlineUsers(Math.floor(Math.random() * (totalCount || 10)));
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error("Fehler beim Laden der Statistiken");
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] text-white">
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-yellow-500/10 to-blue-500/20 opacity-30" />
      
      <div className="container mx-auto p-6 relative bg-black/40 backdrop-blur-sm">
        <AdminHeader />

        {/* First Row: User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <UserStats totalUsers={totalUsers} onlineUsers={onlineUsers} />
        </div>

        {/* Second Row: Teams & Platforms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <TeamPlatformStats totalTeams={totalTeams} totalPlatforms={totalPlatforms} />
        </div>

        {/* Recent Users Table */}
        <RecentUsersTable recentUsers={recentUsers} />

        {/* Admin Tools */}
        <AdminTabs />
      </div>
    </div>
  );
};

export default Admin;