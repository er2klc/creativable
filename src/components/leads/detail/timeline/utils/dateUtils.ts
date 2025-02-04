import { format } from "date-fns";
import { de } from "date-fns/locale";
import { MEETING_TYPES } from "@/constants/meetingTypes"; 

export const getMeetingTypeLabel = (meetingTypeValue: string) => {
  return MEETING_TYPES.find(type => type.value === meetingTypeValue)?.label || meetingTypeValue;
};

export const formatDateTime = (dateString: string, language: string = 'de') => {
  const date = new Date(dateString);
  return format(date, "EEEE', den' d. MMM yyyy '|' HH:mm 'Uhr'", { 
    locale: language === 'en' ? undefined : de 
  });
};