
import { differenceInDays, differenceInHours, format } from "date-fns";
import { de } from "date-fns/locale";
import { useSettings } from "@/hooks/use-settings";

interface TimeDisplayProps {
  dueDate?: string;
}

export const TimeDisplay = ({ dueDate }: TimeDisplayProps) => {
  const { settings } = useSettings();

  const getTimeDisplay = (date: string) => {
    const days = differenceInDays(new Date(date), new Date());
    const hours = differenceInHours(new Date(date), new Date());
    
    if (days === 0) {
      if (hours < 0) return null;
      if (hours === 0) return "Jetzt";
      return `Heute in ${hours} ${hours === 1 ? 'Stunde' : 'Stunden'}`;
    }
    if (days < 0) return null;
    return `In ${days} ${days === 1 ? 'Tag' : 'Tagen'}`;
  };

  if (!dueDate) return null;

  return (
    <div className="flex justify-between items-center text-sm text-gray-600">
      <div>
        {format(new Date(dueDate), 'PPp', {
          locale: settings?.language === "en" ? undefined : de
        })}
      </div>
      {getTimeDisplay(dueDate) && (
        <div className="text-blue-500">
          {getTimeDisplay(dueDate)}
        </div>
      )}
    </div>
  );
};
