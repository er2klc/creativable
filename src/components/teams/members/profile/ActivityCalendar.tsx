
import { eachDayOfInterval, format, isSameDay, startOfYear, endOfYear, isToday } from "date-fns";
import { de } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ActivityCalendarProps, DayActivity } from "./types/calendar";

export const ActivityCalendar = ({ activities }: ActivityCalendarProps) => {
  // Get date range for current year
  const currentYear = new Date().getFullYear();
  const startDate = startOfYear(new Date(currentYear, 0, 1));
  const endDate = endOfYear(new Date(currentYear, 11, 31));
  
  // Get all days in the range
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Aggregate activities by day
  const activityByDay = days.map(day => {
    const dayActivities = activities.filter(activity => 
      isSameDay(new Date(activity.created_at), day)
    );

    const posts = dayActivities.filter(a => a.type === 'post').length;
    const comments = dayActivities.filter(a => a.type === 'comment').length;
    const likes = dayActivities.reduce((sum, a) => sum + (a.reactions_count || 0), 0);

    return {
      date: day,
      posts,
      comments,
      likes,
      total: posts + comments + likes
    } as DayActivity;
  });

  // Calculate activity intensity (0-4)
  const getIntensity = (total: number): number => {
    if (total === 0) return 0;
    if (total <= 2) return 1;
    if (total <= 5) return 2;
    if (total <= 10) return 3;
    return 4;
  };

  // Group days by month (January to December)
  const monthGroups: DayActivity[][] = Array.from({ length: 12 }, (_, monthIndex) => {
    return activityByDay.filter(day => day.date.getMonth() === monthIndex);
  });

  const getSpecialMessage = (day: DayActivity): string | undefined => {
    if (day.total === 0) return undefined;
    
    // Check if it's the first activity of the year
    const isFirstActivity = activityByDay
      .filter(d => d.total > 0)
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0]?.date.getTime() === day.date.getTime();

    if (isFirstActivity) return "First day 🎉";
    return undefined;
  };

  return (
    <div className="bg-[#1A1F2C] rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">Activity</h3>
      <TooltipProvider>
        <div>
          {/* Month Labels */}
          <div className="grid grid-cols-[auto_repeat(12,1fr)] text-xs text-gray-400 mb-1">
            <div />
            {monthGroups.map((_, i) => (
              <div key={i} className="text-center text-[10px]">
                {format(new Date(currentYear, i), 'MMM', { locale: de })}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-[auto_repeat(12,1fr)]">
            {/* Day Labels */}
            <div className="grid grid-rows-7 text-xs text-gray-400 pr-2">
              <div>Mon</div>
              <div>Wed</div>
              <div>Fri</div>
              <div>Sun</div>
            </div>

            {/* Activity Squares */}
            {monthGroups.map((month, monthIndex) => (
              <div key={monthIndex} className="grid grid-rows-7">
                {month.map((day, dayIndex) => {
                  const specialMessage = getSpecialMessage(day);
                  return (
                    <Tooltip key={dayIndex}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "w-[10px] h-[10px]",
                            isToday(day.date) && "ring-1 ring-white ring-offset-1",
                            getIntensity(day.total) === 0 && "bg-[#222]",
                            getIntensity(day.total) === 1 && "bg-green-900",
                            getIntensity(day.total) === 2 && "bg-green-700",
                            getIntensity(day.total) === 3 && "bg-green-500",
                            getIntensity(day.total) === 4 && "bg-green-300"
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent 
                        className="bg-[#1A1F2C] border border-gray-700 text-white p-2 rounded-md shadow-lg"
                      >
                        <div className="text-xs space-y-1">
                          <div>
                            {day.total} {day.total === 1 ? 'activity' : 'activities'}
                          </div>
                          <div className="font-medium">
                            {format(day.date, 'EEEE, MMMM d, yyyy', { locale: de })}
                          </div>
                          {specialMessage && (
                            <div className="text-gray-400">{specialMessage}</div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
            <a href="#" className="hover:text-white transition-colors">What is this?</a>
            <div className="flex items-center gap-2">
              <span>Less</span>
              <div className="flex">
                <div className="w-[10px] h-[10px] bg-[#222]" />
                <div className="w-[10px] h-[10px] bg-green-900" />
                <div className="w-[10px] h-[10px] bg-green-700" />
                <div className="w-[10px] h-[10px] bg-green-500" />
                <div className="w-[10px] h-[10px] bg-green-300" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};
