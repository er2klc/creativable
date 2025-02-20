
import { LucideIcon } from "lucide-react";

export interface Snap {
  id: string;
  icon: JSX.Element;
  label: string;
  description: string;
  gradient: string;
  onClick?: () => void;
  component?: React.ComponentType<any>;
}

export interface SnapNavigationOptions {
  teamId: string;
  teamSlug: string;
  onCalendarClick: () => void;
  onSnapClick: (snapId: string) => void;
}
