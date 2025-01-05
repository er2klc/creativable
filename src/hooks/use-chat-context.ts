import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";

export const useChatContext = () => {
  const { settings } = useSettings();

  const { data: teams } = useQuery({
    queryKey: ["chat-context-teams"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: userTeams, error } = await supabase.rpc("get_user_teams", {
        uid: user.id,
      });

      if (error) {
        console.error("Error loading teams for chat context:", error);
        return [];
      }

      return userTeams;
    },
  });

  const { data: platforms } = useQuery({
    queryKey: ["chat-context-platforms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("elevate_platforms")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading platforms for chat context:", error);
        return [];
      }

      return data;
    },
  });

  const buildSystemMessage = () => {
    const userInfo = settings ? `
      User Information:
      - Language: ${settings.language}
      - Company: ${settings.company_name || "Not specified"}
      - Products/Services: ${settings.products_services || "Not specified"}
      - Target Audience: ${settings.target_audience || "Not specified"}
      - Business Description: ${settings.business_description || "Not specified"}
    ` : "";

    const teamsInfo = teams?.length ? `
      Teams (${teams.length}):
      ${teams.map(team => `- ${team.name}`).join("\n")}
    ` : "";

    const platformsInfo = platforms?.length ? `
      Learning Platforms (${platforms.length}):
      ${platforms.map(platform => `- ${platform.name}`).join("\n")}
    ` : "";

    return `
      You are an AI assistant with access to the following context:
      ${userInfo}
      ${teamsInfo}
      ${platformsInfo}

      Please use this information to provide personalized and contextually relevant responses.
      Always respond in ${settings?.language === "en" ? "English" : "German"}.
    `.trim();
  };

  return {
    systemMessage: buildSystemMessage(),
    isLoading: false, // We'll add more loading states as we add more data
  };
};