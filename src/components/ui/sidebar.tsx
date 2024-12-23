import { LayoutDashboard, Users, Settings } from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Kontakte",
    href: "/leads",
    icon: Users,
  },
  {
    title: "Einstellungen",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  return (
    <div className="sidebar">
      {menuItems.map((item) => (
        <div key={item.href} className="menu-item">
          <item.icon />
          <span>{item.title}</span>
        </div>
      ))}
    </div>
  );
}
