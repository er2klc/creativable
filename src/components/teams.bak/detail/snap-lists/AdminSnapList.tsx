
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SnapList } from "./SnapList";
import { Snap } from "../types";

interface AdminSnapListProps {
  snaps: Snap[];
  isManaging: boolean;
  onHide: (snapId: string) => void;
  onBack: () => void;
  activeSnapView: string | null;
}

export const AdminSnapList = ({ snaps, isManaging, onHide, onBack, activeSnapView }: AdminSnapListProps) => {
  if (!snaps.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Admin</h2>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      </div>
      <SnapList
        snaps={snaps}
        isManaging={isManaging}
        onHide={onHide}
        onBack={onBack}
        activeSnapView={activeSnapView}
      />
    </div>
  );
};
