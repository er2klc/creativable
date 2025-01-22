import { formatDate } from "../TimelineUtils";

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
        Fällig am: {formatDate(dueDate)}
      </div>
    );
  }

  if (oldDate && newDate) {
    return (
      <div className="text-sm">
        <div className="text-gray-400">
          Alter Termin: {formatDate(oldDate)}
        </div>
        <div className="text-blue-600">
          Neuer Termin: {formatDate(newDate)}
        </div>
      </div>
    );
  }

  return null;
};