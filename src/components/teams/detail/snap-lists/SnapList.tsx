import { SnapCard } from "../snap-cards/SnapCard";
import { Snap } from "../types";

interface SnapListProps {
  snaps: Snap[];
  isManaging: boolean;
  onHide: (id: string) => void;
  onBack: () => void;
  activeSnapView: string | null;
}

export const SnapList = ({ 
  snaps,
  isManaging,
  onHide,
  onBack,
  activeSnapView
}: SnapListProps) => {
  if (snaps.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
        {snaps.map((snap) => (
          <SnapCard
            key={snap.id}
            snap={snap}
            isManaging={isManaging}
            onHide={onHide}
            canHide={true}
            onBack={onBack}
            showBackButton={activeSnapView === snap.id}
          />
        ))}
      </div>
    </div>
  );
};