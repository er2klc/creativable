const fetchPlatforms = async () => {
  if (!user?.id) return [];

  try {
    // Schritt 1: Team-IDs abrufen
    const { data: teamIds, error: teamError } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", user.id);

    if (teamError) {
      console.error("Error fetching team IDs:", teamError.message);
      toast.error("Fehler beim Abrufen der Team-IDs");
      throw teamError;
    }

    const teamIdList = teamIds?.map((team) => team.team_id) || [];

    // Schritt 2: Plattformen abrufen
    const { data: platforms, error: platformsError } = await supabase
      .from("elevate_platforms")
      .select(`
        *,
        elevate_team_access (
          team_id,
          teams (
            id,
            name
          )
        )
      `)
      .or(`created_by.eq.${user.id},elevate_team_access.team_id.in.(${teamIdList.map(id => `"${id}"`).join(",")})`);

    if (platformsError) {
      console.error("Error in platform loading:", platformsError.message);
      toast.error("Fehler beim Laden der Plattformen");
      throw platformsError;
    }

    return platforms || [];
  } catch (err) {
    console.error("Error loading platforms:", err.message);
    toast.error("Fehler beim Laden der Plattformen");
    return [];
  }
};
