import { useLocation, Link } from "react-router-dom";
import { LayoutGrid, Users, MessageSquare, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const location = useLocation();

  const navigationItems = [
    { title: "Dashboard", icon: LayoutGrid, url: "/dashboard" },
    { title: "Leads", icon: Users, url: "/leads" },
    { title: "Nachrichten", icon: MessageSquare, url: "/messages" },
    { title: "Kalender", icon: Calendar, url: "/calendar" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t md:top-0 md:left-0 md:h-screen md:w-64 md:border-r">
      <div className="flex justify-around md:flex-col md:justify-start md:p-4 md:space-y-2">
        {navigationItems.map((item) => (
          <Link
            key={item.title}
            to={item.url}
            className={cn(
              "flex items-center gap-3 p-4 hover:bg-muted rounded-lg transition-colors",
              location.pathname === item.url && "bg-muted"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="hidden md:inline">{item.title}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};