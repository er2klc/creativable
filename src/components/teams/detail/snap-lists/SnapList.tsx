import { SnapCard } from "../snap-cards/SnapCard";
import { Snap } from "../types";

interface SnapListProps {
  snaps: Snap[];
  hiddenSnaps: string[];
  isManaging: boolean;
  onSnapClick: (snapId: string) => void;
  toggleSnapVisibility: (snapId: string) => void;
}

export const SnapList = ({ 
  snaps,
  hiddenSnaps,
  isManaging,
  onSnapClick,
  toggleSnapVisibility
}: SnapListProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
      {snaps.map((snap) => (
        <SnapCard
          key={snap.id}
          snap={snap}
          isManaging={isManaging}
          onHide={toggleSnapVisibility}
          onClick={() => onSnapClick(snap.id)}
        />
      ))}
    </div>
  );
};