import { Separator } from "@/components/ui/separator";
import { HiddenSnapCard } from "../snap-cards/HiddenSnapCard";
import { Snap } from "../types";

interface HiddenSnapsListProps {
  snaps: Snap[];
  onUnhide: (id: string) => void;
}

export const HiddenSnapsList = ({ snaps, onUnhide }: HiddenSnapsListProps) => {
  if (snaps.length === 0) return null;

  return (
    <div className="space-y-4">
      <Separator className="my-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
        {snaps.map((snap) => (
          <HiddenSnapCard
            key={snap.id}
            snap={snap}
            onUnhide={onUnhide}
          />
        ))}
      </div>
    </div>
  );
};