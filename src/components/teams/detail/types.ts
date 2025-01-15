import { ReactNode } from "react";

export interface Snap {
  id: string;
  icon: ReactNode;
  label: string;
  description: string;
  gradient: string;
  onClick?: () => void;
}