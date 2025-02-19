
import { cn } from "@/lib/utils";

interface ActivityCalendarProps {
  activities: any[];
}

export const ActivityCalendar = ({ activities }: ActivityCalendarProps) => {
  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Activity</h3>
      <div className="grid grid-cols-7 gap-1">
        {[...Array(28)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-4 h-4 rounded-sm",
              activities?.[i] ? "bg-green-200" : "bg-gray-100"
            )}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded-sm bg-gray-100" />
          <div className="w-4 h-4 rounded-sm bg-green-100" />
          <div className="w-4 h-4 rounded-sm bg-green-200" />
          <div className="w-4 h-4 rounded-sm bg-green-300" />
          <div className="w-4 h-4 rounded-sm bg-green-400" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};
