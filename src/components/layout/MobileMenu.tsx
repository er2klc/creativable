import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Unity", path: "/unity" },
  { name: "Elevate", path: "/elevate" },
  { name: "Leads", path: "/leads" },
  { name: "Messages", path: "/messages" },
  { name: "Calendar", path: "/calendar" },
  { name: "Todo", path: "/todo" },
  { name: "Settings", path: "/settings" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full p-0">
        <div className="flex flex-col h-full bg-sidebar">
          <div className="p-4 border-b border-sidebar-border">
            <img 
              src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" 
              alt="Logo" 
              className="h-8 w-8"
            />
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      "w-full text-left px-4 py-2 rounded-md transition-colors",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      location.pathname === item.path
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground"
                    )}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}