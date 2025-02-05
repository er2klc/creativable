import { 
  LayoutGrid, 
  Users, 
  MessageSquare, 
  Calendar, 
  CheckSquare, 
  BarChart, 
  Settings, 
  FileText, 
  Shield, 
  Globe2, 
  Database,
  Wrench,
  Waves,
  Link2
} from "lucide-react";

export const personalItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutGrid },
  { name: "Kontakte", path: "/leads", icon: Users },
  { name: "Pool", path: "/pool", icon: Waves },
  { name: "Nachrichten", path: "/messages", icon: MessageSquare },
  { name: "Kalender", path: "/calendar", icon: Calendar },
  { name: "Todo Liste", path: "/todo", icon: CheckSquare },
  { name: "Links", path: "/links", icon: Link2 },
];

export const teamItems = [
  { name: "Unity", path: "/unity", icon: Users },
  { name: "Elevate", path: "/elevate", icon: Users },
];

export const analysisItems = [
  { name: "Berichte", path: "/reports", icon: BarChart },
  { name: "Tools", path: "/tools", icon: Wrench },
  { name: "Einstellungen", path: "/settings", icon: Settings },
];

export const legalItems = [
  { name: "Impressum", path: "/impressum", icon: FileText },
  { name: "Datenschutz", path: "/privacy-policy", icon: Shield },
  { name: "Datenlöschung", path: "/auth/data-deletion/instagram", icon: Globe2 },
];

export const adminItems = [
  { name: "Admin Dashboard", path: "/admin", icon: Database },
];
