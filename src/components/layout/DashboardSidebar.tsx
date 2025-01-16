import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarFooter } from "./sidebar/SidebarFooter";
import { SidebarMenuSection } from "./sidebar/SidebarMenuSection";
import { 
  usePersonalItems, 
  teamItems, 
  analysisItems, 
  legalItems,
  adminItems 
} from "./sidebar/SidebarItems";

export const DashboardSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentVersion, setCurrentVersion] = useState("0.31");
  const personalItems = usePersonalItems();

  const { data: latestVersion } = useQuery({
    queryKey: ['latest-version'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('changelog_entries')
        .select('version')
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching latest version:', error);
        return currentVersion;
      }

      return data?.version || currentVersion;
    },
  });

  useEffect(() => {
    if (latestVersion) {
      setCurrentVersion(latestVersion);
    }
  }, [latestVersion]);

  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsSuperAdmin(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_super_admin')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching super admin status:', error);
          setIsSuperAdmin(false);
          return;
        }

        setIsSuperAdmin(profile?.is_super_admin || false);
      } catch (error) {
        console.error('Error checking super admin status:', error);
        setIsSuperAdmin(false);
      }
    };

    checkSuperAdminStatus();
  }, []);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-messages-count'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      return count || 0;
    },
    refetchInterval: 30000,
  });
  
  return (
    <Sidebar 
      className={`fixed group w-[75px] hover:w-[240px] transition-all duration-300 ease-in-out ${isExpanded ? 'w-[240px] z-[999]' : 'z-[10]'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={`absolute inset-0 pointer-events-none ${isExpanded ? 'w-[240px]' : 'w-[75px]'} bg-[#0A0A0A]/95 backdrop-blur-xl shadow-2xl transition-all duration-300`} />
      <SidebarContent className="flex flex-col h-full relative">
        <SidebarHeader isExpanded={isExpanded} />

        <div className="flex-1 overflow-y-auto no-scrollbar pt-6">
          <SidebarMenuSection 
            title="Persönlich" 
            items={personalItems} 
            isExpanded={isExpanded}
            unreadCount={unreadCount}
          />

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />

          <SidebarMenuSection 
            title="Teams & Gruppen" 
            items={teamItems} 
            isExpanded={isExpanded}
          />

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />

          <SidebarMenuSection 
            title="Analyse & Tools" 
            items={analysisItems} 
            isExpanded={isExpanded}
          />

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />

          <SidebarMenuSection 
            title="Rechtliches" 
            items={legalItems} 
            isExpanded={isExpanded}
          />
        </div>

        {isSuperAdmin && (
          <>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />
            <SidebarMenuSection 
              title="Super Admin" 
              items={adminItems} 
              isExpanded={isExpanded}
            />
          </>
        )}

        <SidebarFooter 
          isExpanded={isExpanded} 
          currentVersion={currentVersion}
        />
      </SidebarContent>
    </Sidebar>
  );
};
