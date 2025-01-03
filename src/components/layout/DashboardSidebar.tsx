import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users2,
  GraduationCap,
  TrendingUp,
  MessageSquare,
  Settings,
  Menu,
  X,
} from "lucide-react";

export const DashboardSidebar = () => {
  const { state, openMobile, setOpenMobile } = useSidebar();
  const location = useLocation();

  const isActiveRoute = (path: string) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      version: "0.4",
    },
    {
      name: "Unity",
      href: "/unity",
      icon: Users2,
      version: "0.4",
    },
    {
      name: "Elevate",
      href: "/elevate",
      icon: GraduationCap,
      version: "0.4",
    },
    {
      name: "Leads",
      href: "/leads",
      icon: TrendingUp,
      version: "0.4",
    },
    {
      name: "Messages",
      href: "/messages",
      icon: MessageSquare,
      version: "0.4",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      version: "0.4",
    },
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 z-50 md:hidden"
        onClick={() => setOpenMobile(!openMobile)}
      >
        {openMobile ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col bg-gray-900 duration-300 ease-in-out md:translate-x-0",
          openMobile && "translate-x-0"
        )}
      >
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-white">
              Overview
            </h2>
            <div className="space-y-1">
              <ScrollArea className="h-[300px] px-1">
                {navigation.map((item) => (
                  <Link key={item.href} to={item.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start hover:bg-gray-800/50",
                        isActiveRoute(item.href)
                          ? "bg-gray-800/90 text-white"
                          : "text-gray-400"
                      )}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                      <span className="ml-auto text-xs text-gray-400">
                        v{item.version}
                      </span>
                    </Button>
                  </Link>
                ))}
              </ScrollArea>
            </div>
          </div>
          <Separator className="mx-3 bg-gray-800" />
        </div>
      </div>
    </>
  );
};