
import { useTeamQuery } from "./useTeamQuery";
import { useCategoriesQuery } from "./useCategoriesQuery";

export const useCategoryQueries = (teamId?: string) => {
  const { data: team } = useTeamQuery(teamId);
  const { data: categories } = useCategoriesQuery(team?.id);

  return { team, categories };
};
