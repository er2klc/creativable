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
  { title: "Dashboard", icon: LayoutGrid, url: "/dashboard" },
  { title: "Kontakte", icon: Users, url: "/leads" },
  { 
    title: "Nachrichten", 
    icon: MessageSquare, 
    url: "/messages",
    badge: true 
  },
  { title: "Kalender", icon: Calendar, url: "/calendar" },
  { title: "Todo Liste", icon: CheckSquare, url: "/todo" },
  { title: "Tools", icon: Wrench, url: "/tools" },
];

export const teamItems = [
  { title: "Unity", icon: Infinity, url: "/unity" },
  { title: "Elevate", icon: GraduationCap, url: "/elevate" },
];

export const analysisItems = [
  { title: "Berichte", icon: BarChart, url: "/reports" },
  { title: "Einstellungen", icon: Settings, url: "/settings" },
];

export const legalItems = [
  { title: "Impressum", icon: FileText, url: "/impressum" },
  { title: "Datenschutz", icon: Shield, url: "/privacy-policy" },
  { title: "Datenlöschung", icon: Globe2, url: "/auth/data-deletion/instagram" },
];

export const adminItems = [
  { title: "Admin Dashboard", icon: Database, url: "/admin" },
];
