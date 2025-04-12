
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";

export const formatDateTime = (date: string | Date, language?: string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const locale = language === "en" ? enUS : de;
  
  return format(dateObj, "PPpp", { locale });
};
