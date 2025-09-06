import { Button } from "@/components/ui/button";

interface TeamActionsProps {
  teamId: string;
  isAdmin: boolean;
  isOwner: boolean;
  members: any[];
}

export function TeamActions({ isAdmin }: TeamActionsProps) {
  if (!isAdmin) return null;
  
  return null;
}