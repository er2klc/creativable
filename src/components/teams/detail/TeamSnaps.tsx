import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useSnapManagement } from "@/hooks/use-snap-management";
import { SnapList } from "./snap-lists/SnapList";
import { SnapView } from "./SnapView";
import { cn } from "@/lib/utils";

interface TeamSnapsProps {
  isAdmin: boolean;
  isManaging: boolean;
  teamId: string;
  onCalendarClick: () => void;
  onSnapClick: (snapId: string) => void;
  onBack: () => void;
  activeSnapView: string | null;
}

export function TeamSnaps({
  isAdmin,
  isManaging,
  teamId,
  onCalendarClick,
  onSnapClick,
  onBack,
  activeSnapView,
}: TeamSnapsProps) {
  const { snaps, hiddenSnaps, toggleSnapVisibility } = useSnapManagement(teamId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Snaps</h2>
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCalendarClick()}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Kalender
          </Button>
        )}
      </div>

      <div className={cn(
        "grid gap-6",
        activeSnapView ? "hidden" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      )}>
        <SnapList
          snaps={snaps}
          hiddenSnaps={hiddenSnaps}
          isManaging={isManaging}
          onSnapClick={onSnapClick}
          toggleSnapVisibility={toggleSnapVisibility}
        />
      </div>

      {activeSnapView && (
        <SnapView
          snapId={activeSnapView}
          teamId={teamId}
          onBack={onBack}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}