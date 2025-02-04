import { format } from "date-fns";
import { de } from "date-fns/locale";
import { MEETING_TYPES } from "@/constants/meetingTypes"; 

export const getMeetingTypeLabel = (meetingTypeValue: string) => {
  return MEETING_TYPES.find(type => type.value === meetingTypeValue)?.label || meetingTypeValue;
};

export const formatDateTime = (dateString: string, language: string = 'de') => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return language === 'en' ? 'Unknown date' : 'Datum unbekannt';
    }
    return format(date, "dd.MM.yyyy", { 
      locale: language === 'en' ? undefined : de 
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return language === 'en' ? 'Unknown date' : 'Datum unbekannt';
  }
};