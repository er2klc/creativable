
/**
 * Constructs the full URL for a profile avatar from the Supabase Storage
 */
export const getAvatarUrl = (avatarPath?: string | null, email?: string | null): string => {
  if (!avatarPath) {
    return '/lovable-uploads/45d6a707-e026-4964-aac9-4f294a2b5a1c.png';  // Default avatar
  }
  
  // If it's already a complete URL
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }

  // If it's a Lovable upload path
  if (avatarPath.startsWith('/lovable-uploads/')) {
    return avatarPath;
  }

  // Construct Supabase Storage URL
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarPath}`;
};
