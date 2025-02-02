import { format } from "date-fns";
import { de } from "date-fns/locale";

export const formatDateTime = (dateString: string, language: string = 'de') => {
  const date = new Date(dateString);
  return format(date, "EEE'.' dd'.' MMM'.' yyyy HH:mm 'Uhr'", { 
    locale: language === 'en' ? undefined : de 
  });
};