
export interface TeamNavigationOptions {
  teamSlug: string;
  view?: string;
  categorySlug?: string;
  postSlug?: string;
  memberSlug?: string;
}

export const getTeamUrl = (teamSlug: string): string => {
  return `/unity/${teamSlug}`;
};

export const getTeamMembersUrl = (options: TeamNavigationOptions): string => {
  const { teamSlug, memberSlug } = options;
  return memberSlug 
    ? `/unity/${teamSlug}/members/${memberSlug}`
    : `/unity/${teamSlug}/members`;
};

export const getTeamPostsUrl = (options: TeamNavigationOptions): string => {
  const { teamSlug, categorySlug, postSlug } = options;
  if (postSlug) {
    return `/unity/${teamSlug}/posts/${postSlug}`;
  }
  if (categorySlug) {
    return `/unity/${teamSlug}/posts/category/${categorySlug}`;
  }
  return `/unity/${teamSlug}/posts`;
};

export const getTeamCalendarUrl = (options: TeamNavigationOptions): string => {
  return `/unity/${options.teamSlug}/calendar`;
};

export const getTeamLeaderboardUrl = (options: TeamNavigationOptions): string => {
  return `/unity/${options.teamSlug}/leaderboard`;
};

export const getTeamPulseUrl = (options: TeamNavigationOptions): string => {
  return `/unity/${options.teamSlug}/pulse`;
};

export const getTeamMemberManagementUrl = (options: TeamNavigationOptions): string => {
  return `/unity/${options.teamSlug}/member-management`;
};
