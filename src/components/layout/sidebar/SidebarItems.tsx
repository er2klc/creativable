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
  Infinity,
  GraduationCap,
  Database,
  Wrench
} from "lucide-react";

export const personalItems = [
  { name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
  { name: "Kontakte", icon: Users, path: "/leads" },
  { 
    name: "Nachrichten", 
    icon: MessageSquare, 
    path: "/messages",
    badge: true 
  },
  { name: "Kalender", icon: Calendar, path: "/calendar" },
  { name: "Todo Liste", icon: CheckSquare, path: "/todo" },
];

export const teamItems = [
  { name: "Unity", icon: Infinity, path: "/unity" },
  { name: "Elevate", icon: GraduationCap, path: "/elevate" },
];

export const analysisItems = [
  { name: "Berichte", icon: BarChart, path: "/reports" },
  { name: "Tools", icon: Wrench, path: "/tools" },
  { name: "Einstellungen", icon: Settings, path: "/settings" },
];

export const legalItems = [
  { name: "Impressum", icon: FileText, path: "/impressum" },
  { name: "Datenschutz", icon: Shield, path: "/privacy-policy" },
  { name: "Datenlöschung", icon: Globe2, path: "/auth/data-deletion/instagram" },
];

export const adminItems = [
  { name: "Admin Dashboard", icon: Database, path: "/admin" },
];