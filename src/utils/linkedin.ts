export const linkedInApi = {
  validateProfileUrl(url: string): string {
    console.log('Validating LinkedIn URL:', url);
    
    if (!url) {
      throw new Error('LinkedIn Profil URL ist erforderlich');
    }

    // Handle different URL formats
    let profileId = '';
    
    try {
      // Format: linkedin.com/in/username
      if (url.includes('linkedin.com/in/')) {
        profileId = url.split('linkedin.com/in/')[1].split('/')[0].split('?')[0];
      } 
      // Format: Just the username
      else if (!url.includes('http') && !url.includes('/')) {
        profileId = url;
      }
      // Format: Full URL with https
      else if (url.match(/https?:\/\/(www\.)?linkedin\.com\/in\/([^\/\?]+)/)) {
        profileId = url.match(/https?:\/\/(www\.)?linkedin\.com\/in\/([^\/\?]+)/)![2];
      }

      if (!profileId) {
        console.error('Could not extract profile ID from URL:', url);
        throw new Error('Ungültiges LinkedIn Profil URL Format');
      }

      console.log('Extracted LinkedIn profile ID:', profileId);
      return profileId.trim();
    } catch (error) {
      console.error('Error parsing LinkedIn URL:', error);
      throw new Error('Konnte LinkedIn Profil URL nicht verarbeiten');
    }
  }
};