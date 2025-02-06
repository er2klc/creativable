import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarFooter } from "./sidebar/SidebarFooter";
import { SidebarMenuSection } from "./sidebar/SidebarMenuSection";
import { usePersonalItems, teamItems, analysisItems, legalItems } from "./sidebar/SidebarItems";
import { useSidebarState } from "./sidebar/SidebarState";
import { useUnreadCount } from "./sidebar/SidebarUnreadCount";
import { AdminSection } from "./sidebar/AdminSection";
import { useQuery } from "@tanstack/react-query";

export const DashboardSidebar = () => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { isExpanded, handlers } = useSidebarState();
  const personalItems = usePersonalItems();
  const unreadCount = useUnreadCount();

  // Fetch latest version from changelog_entries
  const { data: versionData, error } = useQuery({
    queryKey: ['latest-version'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('changelog_entries')
        .select('version')
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data?.version || '0.1';
    },
  });

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

  return (
    <Sidebar 
      className={`fixed group w-[72px] hover:w-[240px] transition-all no-scrollbar duration-300 ease-in-out h-screen`}
      {...handlers}
    >
      {/* Hintergrund */}
      <div className={`absolute inset-0 pointer-events-none ${isExpanded ? 'w-[240px]' : 'w-[72px]'} bg-[#0A0A0A]/95 backdrop-blur-xl shadow-2xl transition-all duration-300`} />

      {/* Sidebar-Inhalt */}
      <SidebarContent className="flex flex-col h-full">
        {/* Header fixiert */}
        <div className="sticky top-0 z-10">
          <SidebarHeader isExpanded={isExpanded} />
        </div>

        {/* Mittlerer Bereich scrollbar */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <SidebarMenuSection 
            title="Persönlich" 
            items={personalItems} 
            isExpanded={isExpanded}
            unreadCount={unreadCount}
          />
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <SidebarMenuSection title="Teams & Gruppen" items={teamItems} isExpanded={isExpanded} />
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <SidebarMenuSection title="Analyse & Tools" items={analysisItems} isExpanded={isExpanded} />
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <SidebarMenuSection title="Rechtliches" items={legalItems} isExpanded={isExpanded} />
          <div className="mt-2">
            <AdminSection isExpanded={isExpanded} isSuperAdmin={isSuperAdmin} />
          </div>
        </div>

        {/* Footer fixiert */}
        <div className="sticky bottom-0 z-10">
          <SidebarFooter 
            isExpanded={isExpanded} 
            currentVersion={versionData || '0.1'}
          />

          {/* Changelog unterhalb des Footers */}
          <div className="flex items-center gap-2">
        <span className="text-white">{currentVersion}</span>
        {isExpanded && (
          <a href="/changelog" className="whitespace-nowrap text-gray-400 hover:text-white transition-opacity duration-300">
            Changelog
          </a>
        )}
      </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};
