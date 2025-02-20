
import { parseTeamUrl } from '../helpers/url-helpers';

export interface BreadcrumbItem {
  label: string;
  href: string;
  current: boolean;
}

export const generateTeamBreadcrumbs = (currentUrl: string): BreadcrumbItem[] => {
  const parts = parseTeamUrl(currentUrl);
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Unity',
      href: '/unity',
      current: false,
    },
  ];

  if (parts.teamSlug) {
    breadcrumbs.push({
      label: parts.teamSlug,
      href: `/unity/${parts.teamSlug}`,
      current: !parts.section,
    });
  }

  if (parts.section) {
    const sectionLabel = {
      members: 'Mitglieder',
      posts: 'Community',
      calendar: 'Kalender',
      leaderboard: 'Leaderboard',
      pulse: 'Pulse',
    }[parts.section] || parts.section;

    breadcrumbs.push({
      label: sectionLabel,
      href: `/unity/${parts.teamSlug}/${parts.section}`,
      current: !parts.subSection,
    });
  }

  if (parts.subSection && parts.section === 'posts' && parts.subSection === 'category') {
    breadcrumbs.push({
      label: parts.id || 'Kategorie',
      href: `/unity/${parts.teamSlug}/posts/category/${parts.id}`,
      current: true,
    });
  }

  return breadcrumbs;
};
