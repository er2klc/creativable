
import { useNavigate } from 'react-router-dom';
import { 
  TeamNavigationOptions,
  getTeamUrl,
  getTeamMembersUrl,
  getTeamPostsUrl,
  getTeamCalendarUrl,
  getTeamLeaderboardUrl,
  getTeamPulseUrl,
  getTeamMemberManagementUrl
} from '@/lib/navigation/team-navigation';

export const useTeamNavigation = () => {
  const navigate = useNavigate();

  const navigateToTeam = (teamSlug: string) => {
    navigate(getTeamUrl(teamSlug));
  };

  const navigateToMembers = (options: TeamNavigationOptions) => {
    navigate(getTeamMembersUrl(options));
  };

  const navigateToPosts = (options: TeamNavigationOptions) => {
    navigate(getTeamPostsUrl(options));
  };

  const navigateToCalendar = (options: TeamNavigationOptions) => {
    navigate(getTeamCalendarUrl(options));
  };

  const navigateToLeaderboard = (options: TeamNavigationOptions) => {
    navigate(getTeamLeaderboardUrl(options));
  };

  const navigateToPulse = (options: TeamNavigationOptions) => {
    navigate(getTeamPulseUrl(options));
  };

  const navigateToMemberManagement = (options: TeamNavigationOptions) => {
    navigate(getTeamMemberManagementUrl(options));
  };

  return {
    navigateToTeam,
    navigateToMembers,
    navigateToPosts,
    navigateToCalendar,
    navigateToLeaderboard,
    navigateToPulse,
    navigateToMemberManagement,
  };
};
