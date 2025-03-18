
// Helper functions for email folder operations

/**
 * Normalizes folder paths for consistent comparison
 * @param folderPath IMAP folder path
 */
export function normalizeFolderPath(folderPath: string | undefined): string {
  if (!folderPath) return 'INBOX';
  
  // Handle common folder name variations
  const normalizedPath = folderPath.toUpperCase();
  
  // Map standard folder names to their canonical form
  if (normalizedPath === 'INBOX' || normalizedPath.includes('INBOX')) return 'INBOX';
  if (normalizedPath === 'SENT' || normalizedPath.includes('SENT') || normalizedPath.includes('GESENDET')) return 'SENT';
  if (normalizedPath === 'DRAFTS' || normalizedPath.includes('DRAFT') || normalizedPath.includes('ENTWURF')) return 'DRAFTS';
  if (normalizedPath === 'TRASH' || normalizedPath.includes('TRASH') || normalizedPath.includes('DELETED') ||
      normalizedPath.includes('PAPIERKORB') || normalizedPath.includes('MÜLL')) return 'TRASH';
  if (normalizedPath === 'JUNK' || normalizedPath.includes('JUNK') || normalizedPath.includes('SPAM')) return 'JUNK';
  if (normalizedPath === 'ARCHIVE' || normalizedPath.includes('ARCHIV')) return 'ARCHIVE';
  
  // Return the original path if it doesn't match any standard folder
  return folderPath;
}

/**
 * Formats folder name for display
 * @param folder Email folder object
 */
export function formatFolderName(folder: { name: string; type: string; path: string }): string {
  // First handle special folders with custom display names
  switch (folder.type) {
    case 'inbox': return 'Inbox';
    case 'sent': return 'Sent';
    case 'drafts': return 'Drafts';
    case 'trash': return 'Trash';
    case 'spam': return 'Spam';
    case 'archive': return 'Archive';
  }
  
  // For regular folders, just return the name with first letter capitalized
  return folder.name.charAt(0).toUpperCase() + folder.name.slice(1);
}

/**
 * Gets icon name for folder type
 * @param folderType Folder type
 */
export function getFolderIcon(folderType: string): string {
  switch (folderType) {
    case 'inbox': return 'Inbox';
    case 'sent': return 'Send';
    case 'drafts': return 'FileEdit';
    case 'trash': return 'Trash2';
    case 'spam': return 'AlertOctagon';
    case 'archive': return 'Archive';
    default: return 'Folder';
  }
}
