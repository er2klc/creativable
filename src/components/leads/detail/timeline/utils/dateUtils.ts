
export const formatDateTime = (dateString: string, language = "de") => {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date string:", dateString);
      return "Invalid date";
    }
    
    // Format time
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit'
    };
    
    // Format date based on language
    const dateOptions: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    };
    
    const timeString = date.toLocaleTimeString(language === "en" ? "en-US" : "de-DE", timeOptions);
    const dateString = date.toLocaleDateString(language === "en" ? "en-US" : "de-DE", dateOptions);
    
    return `${dateString} ${timeString}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Return the original string if there's an error
  }
};

export const formatRelativeTime = (dateString: string, language = "de") => {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    // Less than a minute
    if (diffInSeconds < 60) {
      return language === "en" ? "just now" : "gerade eben";
    }
    
    // Less than an hour
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return language === "en" 
        ? `${minutes} minute${minutes > 1 ? 's' : ''} ago` 
        : `vor ${minutes} Minute${minutes > 1 ? 'n' : ''}`;
    }
    
    // Less than a day
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return language === "en" 
        ? `${hours} hour${hours > 1 ? 's' : ''} ago` 
        : `vor ${hours} Stunde${hours > 1 ? 'n' : ''}`;
    }
    
    // Less than a week
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return language === "en" 
        ? `${days} day${days > 1 ? 's' : ''} ago` 
        : `vor ${days} Tag${days > 1 ? 'en' : ''}`;
    }
    
    // Format the date
    return formatDateTime(dateString, language);
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return dateString; // Return the original string if there's an error
  }
};
