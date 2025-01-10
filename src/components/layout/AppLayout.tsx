import { DashboardSidebar } from "./DashboardSidebar";
import { MainContent } from "./MainContent";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen flex w-full bg-background relative">
      <DashboardSidebar />
      <MainContent>{children}</MainContent>
    </div>
  );
};