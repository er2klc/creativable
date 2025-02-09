
import { DashboardSidebar } from "./DashboardSidebar";
import { MainContent } from "./MainContent";
import { NotificationSidebar } from "../notifications/NotificationSidebar";
import { useState } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <div className="hidden md:block w-[60px] shrink-0 fixed h-full z-50">
        <DashboardSidebar />
      </div>
      <div className="flex-1 md:pl-[60px]">
        <NotificationSidebar 
          open={showNotifications} 
          onOpenChange={setShowNotifications} 
        />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
};
