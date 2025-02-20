
import { useTeamDataContext } from "@/components/teams/context/TeamDataContext";
import { useTeamPresence } from "@/components/teams/context/TeamPresenceContext";

export const useTeamData = () => {
  const context = useTeamDataContext();
  const { isOnline } = useTeamPresence();

  const getMemberWithPresence = (memberId: string) => {
    const member = context.members.find(m => m.id === memberId);
    if (!member) return null;

    return {
      ...member,
      profile: {
        ...member.profile,
        status: isOnline(member.user_id) ? 'online' : member.profile.status
      }
    };
  };

  return {
    ...context,
    getMemberWithPresence
  };
};
