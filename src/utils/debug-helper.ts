
import { supabase } from '@/integrations/supabase/client';

/**
 * Fixes duplicate email folders in the database
 * @param userId The user ID
 * @returns Result of the cleanup operation
 */
export async function fixDuplicateEmailFolders(userId: string) {
  try {
    const { data, error } = await supabase.rpc('fix_duplicate_email_folders', {
      user_id_param: userId
    });
    
    if (error) {
      console.error('Error fixing duplicate email folders:', error);
      return { success: false, message: error.message };
    }
    
    console.log('Fixed duplicate email folders:', data);
    return { success: true, message: `Fixed ${data.duplicates_removed || 0} duplicate folders` };
  } catch (error: any) {
    console.error('Exception fixing duplicate email folders:', error);
    return { success: false, message: error.message };
  }
}
