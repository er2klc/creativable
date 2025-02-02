import { TimelineItemStatus } from "../../types/lead";

interface TaskCardProps {
  title: string;
  status?: TimelineItemStatus;
  color?: string;
  date?: string;
}

export const TaskCard = ({ title, status, color, date }: TaskCardProps) => {
  return (
    <div className={`flex items-center justify-between p-4 border rounded ${color}`}>
      <div>
        <h3 className="font-semibold">{title}</h3>
        {status && <span className={`badge ${status}`}>{status}</span>}
      </div>
      {date && <span className="text-sm text-gray-500">{date}</span>}
    </div>
  );
};
