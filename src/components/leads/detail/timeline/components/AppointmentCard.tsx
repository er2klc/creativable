import { CalendarDays } from "lucide-react";
import { formatDateTime } from "../utils/dateUtils";

interface AppointmentCardProps {
  title: string;
  type?: string;
  date?: string;
}

export const AppointmentCard = ({ title, type, date }: AppointmentCardProps) => {
  return (
    <div className="flex items-center gap-2">
      <CalendarDays className="h-5 w-5" />
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        {type && <div className="text-sm text-muted-foreground">{type}</div>}
        {date && <div className="text-xs text-muted-foreground">{formatDateTime(date)}</div>}
      </div>
    </div>
  );
};
