
-- Standardize icon names in team_categories
UPDATE team_categories
SET icon = CASE 
    WHEN icon = 'Video' THEN 'video'
    WHEN icon = 'LightBulb' THEN 'lightbulb'
    WHEN icon = 'Lightbulb' THEN 'lightbulb'
    WHEN icon = 'FileText' THEN 'file-text'
    WHEN icon = 'Calendar' THEN 'bell'
    ELSE COALESCE(icon, 'message-circle')
END;

-- Set default icon for any remaining NULL or invalid icons
UPDATE team_categories
SET icon = 'message-circle'
WHERE icon IS NULL OR icon NOT IN (
    'message-circle', 'users', 'book', 'sparkles', 'megaphone', 
    'help-circle', 'heart', 'bell', 'flag', 'award', 'star', 
    'rocket', 'zap', 'target', 'coffee', 'gift', 'party-popper', 
    'smile', 'trophy', 'crown'
);
