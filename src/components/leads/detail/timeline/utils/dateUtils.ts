import { format } from "date-fns";
import { de } from "date-fns/locale";

export const formatDateTime = (dateString: string | null, language: string = 'de') => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return format(date, "EEE'.' dd'.' MMM'.' yyyy HH:mm 'Uhr'", { 
      locale: language === 'en' ? undefined : de 
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};