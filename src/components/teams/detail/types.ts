
import { ReactNode } from "react";

export interface Snap {
  id: string;
  icon: ReactNode;
  label: string;
  description: string;
  gradient: string;
  onClick?: () => void;
  component?: React.ComponentType<any>;
}

export interface TeamSnapsProps {
  isAdmin: boolean;
  isManaging: boolean;
  teamId: string;
  teamSlug: string;
  onCalendarClick: () => void;
  onSnapClick: (snapId: string) => void;
  onBack: () => void;
  activeSnapView: string | null;
}
