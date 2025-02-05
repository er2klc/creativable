import { format } from "date-fns";
import { de } from "date-fns/locale";
import { MEETING_TYPES } from "@/constants/meetingTypes"; 

export const getMeetingTypeLabel = (meetingTypeValue: string) => {
  return MEETING_TYPES.find(type => type.value === meetingTypeValue)?.label || meetingTypeValue;
};

export const formatDateTime = (dateString: string | undefined, language: string = 'de') => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return '';
    }
    
    return format(date, "EEEE', den' d. MMM yyyy '|' HH:mm 'Uhr'", { 
      locale: language === 'en' ? undefined : de 
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};