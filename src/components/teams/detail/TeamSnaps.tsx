
import { SnapList } from "./snap-lists/SnapList";
import { AdminSnapList } from "./snap-lists/AdminSnapList";
import { HiddenSnapsList } from "./snap-lists/HiddenSnapsList";
import { PostSnapsList } from "./snap-lists/PostSnapsList";
import { useSnapManagement } from "./hooks/useSnapManagement";
import { MembersCard } from "./snap-cards/MembersCard";
import { useSnapNavigation } from "./hooks/useSnapNavigation";
import { getRegularSnaps, getAdminSnaps } from "./constants/snaps";
import { Snap } from "./types/snaps";

interface TeamSnapsProps {
  isAdmin: boolean;
  isManaging: boolean;
  teamId: string;
  teamSlug: string;
  onCalendarClick: () => void;
  onSnapClick: (snapId: string) => void;
  onBack: () => void;
  activeSnapView: string | null;
}

export const TeamSnaps = ({ 
  isAdmin, 
  isManaging, 
  teamId,
  teamSlug,
  onCalendarClick,
  onSnapClick,
  onBack,
  activeSnapView 
}: TeamSnapsProps) => {
  const { hiddenSnaps, hideSnapMutation, unhideSnapMutation } = useSnapManagement(teamId);
  const { handleSnapClick } = useSnapNavigation({ teamId, teamSlug, onCalendarClick, onSnapClick });

  const regularSnaps = getRegularSnaps(teamId, teamSlug).map(snap => ({
    ...snap,
    onClick: () => handleSnapClick(snap.id)
  }));

  const adminSnaps = isAdmin ? getAdminSnaps().map(snap => ({
    ...snap,
    onClick: () => handleSnapClick(snap.id)
  })) : [];

  // Define the variables needed for filtering visible and hidden snaps
  const allSnaps = [...regularSnaps, ...adminSnaps];
  const visibleRegularSnaps = regularSnaps.filter(snap => !hiddenSnaps.includes(snap.id));
  const visibleAdminSnaps = adminSnaps.filter(snap => !hiddenSnaps.includes(snap.id));
  const hiddenSnapsList = allSnaps.filter(snap => hiddenSnaps.includes(snap.id));

  if (!teamSlug) {
    return (
      <div className="p-4 text-center text-red-500">
        Fehler: Team-Slug nicht gefunden
      </div>
    );
  }

  if (activeSnapView === "posts") {
    return <PostSnapsList teamId={teamId} isAdmin={isAdmin} />;
  }

  if (activeSnapView === "members") {
    return <MembersCard teamId={teamId} teamSlug={teamSlug} />;
  }

  return (
    <div className="space-y-8">
      <SnapList
        snaps={visibleRegularSnaps}
        isManaging={isManaging}
        onHide={hideSnapMutation.mutate}
        onBack={onBack}
        activeSnapView={activeSnapView}
      />

      {isAdmin && (
        <AdminSnapList
          snaps={visibleAdminSnaps}
          isManaging={isManaging}
          onHide={hideSnapMutation.mutate}
          onBack={onBack}
          activeSnapView={activeSnapView}
        />
      )}

      {isAdmin && (
        <HiddenSnapsList
          snaps={hiddenSnapsList}
          onUnhide={unhideSnapMutation.mutate}
        />
      )}
    </div>
  );
};
