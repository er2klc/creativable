
-- Fix missing colors in team_categories
UPDATE team_categories 
SET color = CASE 
    WHEN name = 'Neuigkeiten' THEN 'bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]'
    WHEN name = 'Termine' THEN 'bg-[#FEF7CD] hover:bg-[#EEE7BD] text-[#4A4A2A]'
    WHEN name = 'Recognition' THEN 'bg-[#FEC6A1] hover:bg-[#EEB691] text-[#4A2A2A]'
    WHEN name = 'Plauderecke' THEN 'bg-[#E5DEFF] hover:bg-[#D4CDE8] text-[#2A2A4A]'
    WHEN name = 'Aufzeichnungen' THEN 'bg-[#FFDEE2] hover:bg-[#EBD0D4] text-[#4A2A3A]'
    WHEN name = 'Vorstellung' THEN 'bg-[#F8E8F8] hover:bg-[#E8D8E8] text-[#4A2A4A]'
    WHEN name = 'Kundenfeedbacks' THEN 'bg-[#FDE1D3] hover:bg-[#ECCFC2] text-[#4A3A2A]'
    WHEN name = 'Charity' THEN 'bg-[#D3E4FD] hover:bg-[#C2D3EC] text-[#2A3A4A]'
    WHEN name = 'Fragen & Antworten' THEN 'bg-[#F1F0FB] hover:bg-[#E5E4F3] text-[#2A2A2A]'
    ELSE 'bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]'
END
WHERE color IS NULL;

-- Ensure all categories have an icon
UPDATE team_categories
SET icon = COALESCE(icon, 'message-circle')
WHERE icon IS NULL;
