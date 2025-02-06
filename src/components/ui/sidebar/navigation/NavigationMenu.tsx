
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { mainRoutes } from "@/config/routes/main-routes";
import { toolRoutes } from "@/config/routes/tool-routes";
import { platformRoutes } from "@/config/routes/platform-routes";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  Settings,
  Crown,
  Tool,
  Users2,
  Link,
} from "lucide-react";

const getIcon = (path: string) => {
  switch (path) {
    case "/dashboard":
      return LayoutDashboard;
    case "/contacts":
      return Users;
    case "/messages":
      return MessageSquare;
    case "/calendar":
      return Calendar;
    case "/settings":
      return Settings;
    case "/unity":
      return Crown;
    case "/tools":
      return Tool;
    case "/pool":
      return Users2;
    case "/links":
      return Link;
    default:
      return LayoutDashboard;
  }
};

export const NavigationMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const allRoutes = [...mainRoutes, ...toolRoutes, ...platformRoutes].filter(
    route => !route.path.includes(":") && route.label
  );

  return (
    <nav className="flex flex-col gap-2 p-2">
      {allRoutes.map((route) => {
        const Icon = getIcon(route.path);
        const isActive = location.pathname === route.path;

        return (
          <button
            key={route.path}
            onClick={() => navigate(route.path)}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
              "hover:bg-sidebar-hover",
              isActive && "bg-sidebar-active text-sidebar-active-foreground"
            )}
            title={route.label}
          >
            <Icon className="w-5 h-5" />
          </button>
        );
      })}
    </nav>
  );
}
