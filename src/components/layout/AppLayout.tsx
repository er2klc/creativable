import { DashboardSidebar } from "./DashboardSidebar";
import { SidebarToggleButton } from "./SidebarToggleButton";
import { MainContent } from "./MainContent";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen flex w-full bg-background relative">
      <DashboardSidebar />
      <SidebarToggleButton />
      <MainContent>{children}</MainContent>
    </div>
  );
};