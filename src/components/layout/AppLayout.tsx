import { DashboardSidebar } from "./DashboardSidebar";
import { MainContent } from "./MainContent";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <div className="w-[60px] shrink-0">
        <DashboardSidebar />
      </div>
      <MainContent>{children}</MainContent>
    </div>
  );
};