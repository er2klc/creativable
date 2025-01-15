import { Separator } from "@/components/ui/separator";
import { SnapList } from "./SnapList";
import { Snap } from "../types";

interface AdminSnapListProps {
  snaps: Snap[];
  isManaging: boolean;
  onHide: (id: string) => void;
  onBack: () => void;
  activeSnapView: string | null;
}

export const AdminSnapList = ({
  snaps,
  isManaging,
  onHide,
  onBack,
  activeSnapView
}: AdminSnapListProps) => {
  if (snaps.length === 0) return null;

  return (
    <>
      <Separator className="my-6" />
      <SnapList
        snaps={snaps}
        isManaging={isManaging}
        onHide={onHide}
        onBack={onBack}
        activeSnapView={activeSnapView}
      />
    </>
  );
};