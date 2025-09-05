import { formatDateTime } from "../utils/dateUtils";

interface TimelineItemDateProps {
  dueDate?: string;
  oldDate?: string;
  newDate?: string;
  isOutdated?: boolean;
}

export const TimelineItemDate = ({ dueDate, oldDate, newDate, isOutdated }: TimelineItemDateProps) => {
  if (!isOutdated && dueDate) {
    return (
      <div className="text-sm text-gray-500">
        Fällig am: {formatDateTime(dueDate)}
      </div>
    );
  }

  if (oldDate && newDate) {
    return (
      <div className="text-sm">
        <div className="text-gray-400">
          Alter Termin: {formatDateTime(oldDate)}
        </div>
        <div className="text-blue-600">
          Neuer Termin: {formatDateTime(newDate)}
        </div>
      </div>
    );
  }

  return null;
};