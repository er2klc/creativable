import { DashboardSidebar } from "./DashboardSidebar";
import { MainContent } from "./MainContent";
import { useState } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <div className="w-[60px] shrink-0">
        <DashboardSidebar 
          onExpandChange={setIsSidebarExpanded}
        />
      </div>
      <div className={`flex-1 ${!isSidebarExpanded ? "z-50" : ""} relative`}>
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
};