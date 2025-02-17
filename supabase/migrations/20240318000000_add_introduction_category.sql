
-- Create introduction category if it doesn't exist
INSERT INTO team_categories (team_id, name, slug, icon, color, is_public, order_index)
SELECT 
  id as team_id,
  'Vorstellung' as name,
  'vorstellung' as slug,
  'Wave' as icon,
  'bg-[#F8E8F8] hover:bg-[#E8D8E8] text-[#4A2A4A]' as color,
  true as is_public,
  0 as order_index
FROM teams
WHERE NOT EXISTS (
  SELECT 1 FROM team_categories 
  WHERE team_categories.team_id = teams.id 
  AND team_categories.name = 'Vorstellung'
);
