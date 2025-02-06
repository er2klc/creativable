import { adminItems } from "./SidebarItems";
import { SidebarMenuSection } from "./SidebarMenuSection";

interface AdminSectionProps {
  isExpanded: boolean;
  isSuperAdmin: boolean;
}

export const AdminSection = ({ isExpanded, isSuperAdmin }: AdminSectionProps) => {
  if (!isSuperAdmin) return null;

  return (
    <>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <SidebarMenuSection 
        title="Super Admin" 
        items={adminItems} 
        isExpanded={isExpanded}
      />
    </>
  );
};
