import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarMenuSection } from "./SidebarMenuSection";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  Settings,
  Briefcase,
  GraduationCap,
  Shield,
  Wrench,
} from "lucide-react";

export const SidebarItems = () => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setIsSuperAdmin(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_super_admin')
          .eq('id', session.user.id)
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

  const mainItems = [
    { href: "/dashboard", icon: LayoutDashboard, title: "Dashboard" },
    { href: "/leads", icon: Users, title: "Leads" },
    { href: "/messages", icon: MessageSquare, title: "Messages" },
    { href: "/calendar", icon: Calendar, title: "Calendar" },
  ];

  const platformItems = [
    { href: "/unity", icon: Briefcase, title: "Unity" },
    { href: "/elevate", icon: GraduationCap, title: "Elevate" },
  ];

  const settingsItems = [
    { href: "/settings", icon: Settings, title: "Settings" },
  ];

  const adminItems = [
    { href: "/admin", icon: Shield, title: "Admin" },
    { href: "/tools", icon: Wrench, title: "Tools" },
  ];

  return (
    <div className="space-y-6 px-3">
      <SidebarMenuSection title="Menu" items={mainItems} />
      <SidebarMenuSection title="Platform" items={platformItems} />
      <SidebarMenuSection title="Settings" items={settingsItems} />
      {isSuperAdmin && (
        <SidebarMenuSection title="Super Admin" items={adminItems} />
      )}
    </div>
  );
};