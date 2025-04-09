
/**
 * Konstruiert die vollständige URL für ein Profilbild aus dem Supabase Storage
 */
export const getAvatarUrl = (avatarPath?: string | null, email?: string | null): string => {
  if (!avatarPath) {
    // Wenn kein Avatar vorhanden ist, generiere einen Default-Avatar mit den Initialen
    if (email) {
      const initial = email.charAt(0).toUpperCase();
      return `https://ui-avatars.com/api/?name=${initial}&background=random`;
    }
    return '/placeholder.svg';
  }
  
  // Wenn es bereits eine vollständige URL ist
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }

  // Wenn es ein Lovable-Upload ist
  if (avatarPath.startsWith('/lovable-uploads/')) {
    return avatarPath;
  }

  // Konstruiere die Supabase Storage URL
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarPath}`;
};

/**
 * Konvertiert eine Kategoriefarbe in eine gültige CSS-Klasse oder Style
 */
export const getCategoryColorClass = (color?: string | null): string => {
  if (!color) return 'bg-primary/10';

  // Wenn es eine Hex-Farbe oder CSS-Farbe ist
  if (color.startsWith('#') || color.startsWith('rgb')) {
    return color;
  }

  // Tailwind-Farben mit Transparenz (z.B. bg-primary/10)
  if (color.includes('/')) {
    return color;
  }

  // Standard Tailwind-Farben
  if (color.startsWith('bg-')) {
    return color;
  }

  // Fallback für andere Farben
  return `bg-${color}`;
};

/**
 * Erstellt ein Style-Objekt für Kategoriefarben
 */
export const getCategoryStyle = (color?: string | null): React.CSSProperties => {
  const colorValue = getCategoryColorClass(color);
  
  if (colorValue.startsWith('bg-')) {
    return {}; // Verwende Tailwind-Klassen
  }

  // Für Hex- und RGB-Farben
  return {
    backgroundColor: colorValue,
    color: 'white'
  };
};
