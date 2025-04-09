
/**
 * Formatiert ein Datum mit Zeitangabe 
 * 
 * @param dateString Das zu formatierende Datum
 * @param language Die Sprache (de oder en)
 * @returns Formatierter String
 */
export const formatDateTime = (dateString: string, language: string = 'de'): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Ungültiges Datum';
    }

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };

    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'de-DE', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Formatierungsfehler';
  }
};

/**
 * Formatiert ein Datum
 * 
 * @param dateString Das zu formatierende Datum
 * @param language Die Sprache (de oder en)
 * @returns Formatierter String
 */
export const formatDate = (dateString: string, language: string = 'de'): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Ungültiges Datum';
    }

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };

    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'de-DE', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Formatierungsfehler';
  }
};
