import { HeaderActions } from "@/components/layout/HeaderActions";

interface ProfileHeaderProps {
  teamData?: any;
  userEmail?: string;
  teamSlug: string;
}

export const ProfileHeader = ({ teamData, userEmail, teamSlug }: ProfileHeaderProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
      <div className="h-16 px-4 flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span>{teamData?.name || teamSlug}</span>
          <span>/</span>
          <span>Mitglied</span>
        </div>
        <HeaderActions profile={null} userEmail={userEmail} />
      </div>
    </div>
  );
};