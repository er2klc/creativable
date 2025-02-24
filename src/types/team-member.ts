
export interface TeamMemberProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  status: string;
  last_seen: string | null;
  slug: string | null;
  email?: string | null;
}

export interface TeamMemberPoints {
  level: number;
  points: number;
}

export interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: 'owner' | 'admin' | 'member';
  profile: TeamMemberProfile;
  points: TeamMemberPoints;
}

export const DEFAULT_MEMBER_POINTS: TeamMemberPoints = {
  level: 0,
  points: 0
};

export const transformMemberData = (rawMember: any): TeamMember => {
  if (!rawMember) {
    throw new Error('No member data provided for transformation');
  }

  // Standardisierte Transformation der Profildaten
  const profile: TeamMemberProfile = {
    id: rawMember.profiles?.id || rawMember.profile?.id || '',
    display_name: rawMember.profiles?.display_name || rawMember.profile?.display_name || 'Unnamed Member',
    avatar_url: rawMember.profiles?.avatar_url || rawMember.profile?.avatar_url || null,
    bio: rawMember.profiles?.bio || rawMember.profile?.bio || null,
    status: rawMember.profiles?.status || rawMember.profile?.status || 'offline',
    last_seen: rawMember.profiles?.last_seen || rawMember.profile?.last_seen || null,
    slug: rawMember.profiles?.slug || rawMember.profile?.slug || null,
    email: rawMember.profiles?.email || rawMember.profile?.email || null
  };

  // Standardisierte Transformation der Punktedaten
  const points: TeamMemberPoints = {
    level: rawMember.team_member_points?.[0]?.level || 
           rawMember.points?.level || 
           DEFAULT_MEMBER_POINTS.level,
    points: rawMember.team_member_points?.[0]?.points || 
            rawMember.points?.points || 
            DEFAULT_MEMBER_POINTS.points
  };

  return {
    id: rawMember.id,
    user_id: rawMember.user_id,
    team_id: rawMember.team_id,
    role: rawMember.role || 'member',
    profile,
    points
  };
};
