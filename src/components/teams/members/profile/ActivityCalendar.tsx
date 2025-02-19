
import { eachDayOfInterval, format, isSameDay, startOfYear, endOfYear } from "date-fns";
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

  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Activity</h3>
      <TooltipProvider>
        <div className="space-y-1">
          {/* Month Labels */}
          <div className="grid grid-cols-[auto_repeat(12,1fr)] text-xs text-muted-foreground">
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
            <div className="grid grid-rows-7 text-xs text-muted-foreground pr-2">
              <div>Mon</div>
              <div>Wed</div>
              <div>Fri</div>
              <div>Sun</div>
            </div>

            {/* Activity Squares */}
            {monthGroups.map((month, monthIndex) => (
              <div key={monthIndex} className="grid grid-rows-7">
                {month.map((day, dayIndex) => (
                  <Tooltip key={dayIndex}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "w-3 h-3 border-[0.5px] border-white",
                          getIntensity(day.total) === 0 && "bg-gray-100",
                          getIntensity(day.total) === 1 && "bg-green-100",
                          getIntensity(day.total) === 2 && "bg-green-200",
                          getIntensity(day.total) === 3 && "bg-green-300",
                          getIntensity(day.total) === 4 && "bg-green-400"
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs p-1.5 space-y-1">
                        <div className="text-muted-foreground">
                          {day.total} {day.total === 1 ? 'Aktivität' : 'Aktivitäten'}
                        </div>
                        <div className="font-medium">
                          {format(day.date, 'EEEE, d. MMMM yyyy', { locale: de })}
                        </div>
                        {day.total > 0 && (
                          <div className="space-y-0.5 text-muted-foreground text-[10px]">
                            {day.posts > 0 && (
                              <div>{day.posts} {day.posts === 1 ? 'Post' : 'Posts'}</div>
                            )}
                            {day.comments > 0 && (
                              <div>{day.comments} {day.comments === 1 ? 'Kommentar' : 'Kommentare'}</div>
                            )}
                            {day.likes > 0 && (
                              <div>{day.likes} {day.likes === 1 ? 'Like' : 'Likes'}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <span>Weniger</span>
            <div className="flex">
              <div className="w-3 h-3 border-[0.5px] border-white bg-gray-100" />
              <div className="w-3 h-3 border-[0.5px] border-white bg-green-100" />
              <div className="w-3 h-3 border-[0.5px] border-white bg-green-200" />
              <div className="w-3 h-3 border-[0.5px] border-white bg-green-300" />
              <div className="w-3 h-3 border-[0.5px] border-white bg-green-400" />
            </div>
            <span>Mehr</span>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};
