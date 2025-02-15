
/**
 * Konstruiert die vollständige URL für ein Profilbild aus dem Supabase Storage
 */
export const getAvatarUrl = (avatarPath?: string | null): string => {
  if (!avatarPath) return '';
  
  // Wenn es bereits eine vollständige URL ist
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }

  // Konstruiere die Supabase Storage URL
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarPath}`;
};

/**
 * Konvertiert eine Kategoriefarbe in eine gültige CSS-Klasse
 */
export const getCategoryColorClass = (color?: string | null): string => {
  if (!color) return 'bg-primary/10';

  // Wenn es eine Hex-Farbe ist
  if (color.startsWith('#')) {
    return `bg-[${color}]`;
  }

  // Wenn es bereits eine Tailwind-Klasse ist
  return color;
};
