
export interface TeamUrlParts {
  teamSlug: string;
  section?: string;
  subSection?: string;
  id?: string;
}

export const buildTeamUrl = (parts: TeamUrlParts): string => {
  const { teamSlug, section, subSection, id } = parts;
  let url = `/unity/${teamSlug}`;
  
  if (section) {
    url += `/${section}`;
    if (subSection) {
      url += `/${subSection}`;
      if (id) {
        url += `/${id}`;
      }
    }
  }
  
  return url;
};

export const parseTeamUrl = (url: string): TeamUrlParts => {
  const parts = url.split('/').filter(Boolean);
  const unityIndex = parts.indexOf('unity');
  
  if (unityIndex === -1) {
    throw new Error('Not a team URL');
  }
  
  return {
    teamSlug: parts[unityIndex + 1] || '',
    section: parts[unityIndex + 2],
    subSection: parts[unityIndex + 3],
    id: parts[unityIndex + 4],
  };
};

export const isTeamUrl = (url: string): boolean => {
  return url.includes('/unity/') && !url.includes('/unity/team/');
};
