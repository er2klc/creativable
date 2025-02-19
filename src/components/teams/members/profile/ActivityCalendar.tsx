
import { addMonths, eachDayOfInterval, endOfDay, format, isSameDay, startOfDay, subMonths } from "date-fns";
import { de } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ActivityCalendarProps, DayActivity } from "./types/calendar";

export const ActivityCalendar = ({ activities }: ActivityCalendarProps) => {
  // Get date range for last 12 months
  const endDate = new Date();
  const startDate = subMonths(endDate, 11);
  
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

  // Group days by month
  const monthGroups: DayActivity[][] = [];
  let currentMonth: DayActivity[] = [];
  
  activityByDay.forEach(day => {
    if (currentMonth.length && format(day.date, 'M') !== format(currentMonth[0].date, 'M')) {
      monthGroups.push(currentMonth);
      currentMonth = [];
    }
    currentMonth.push(day);
  });
  if (currentMonth.length) {
    monthGroups.push(currentMonth);
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Activity</h3>
      <TooltipProvider>
        <div className="space-y-4">
          {/* Month Labels */}
          <div className="grid grid-cols-[auto_repeat(12,1fr)] gap-2 text-xs text-muted-foreground">
            <div />
            {monthGroups.map((month, i) => (
              <div key={i} className="text-center">
                {format(month[0].date, 'MMM', { locale: de })}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-[auto_repeat(12,1fr)] gap-2">
            {/* Day Labels */}
            <div className="grid grid-rows-7 gap-2 text-xs text-muted-foreground pr-2">
              <div>Mon</div>
              <div>Wed</div>
              <div>Fri</div>
              <div>Sun</div>
            </div>

            {/* Activity Squares */}
            {monthGroups.map((month, monthIndex) => (
              <div key={monthIndex} className="grid grid-rows-7 gap-2">
                {month.map((day, dayIndex) => (
                  <Tooltip key={dayIndex}>
                    <TooltipTrigger>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-sm",
                          getIntensity(day.total) === 0 && "bg-gray-100",
                          getIntensity(day.total) === 1 && "bg-green-100",
                          getIntensity(day.total) === 2 && "bg-green-200",
                          getIntensity(day.total) === 3 && "bg-green-300",
                          getIntensity(day.total) === 4 && "bg-green-400"
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs p-2 space-y-1">
                        <div className="font-medium">
                          {format(day.date, 'EEEE, d. MMMM yyyy', { locale: de })}
                        </div>
                        {day.total > 0 ? (
                          <>
                            <div className="text-muted-foreground">
                              {day.total} {day.total === 1 ? 'Aktivität' : 'Aktivitäten'}
                            </div>
                            <div className="space-y-0.5 text-muted-foreground">
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
                          </>
                        ) : (
                          <div className="text-muted-foreground">Keine Aktivitäten</div>
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
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded-sm bg-gray-100" />
              <div className="w-4 h-4 rounded-sm bg-green-100" />
              <div className="w-4 h-4 rounded-sm bg-green-200" />
              <div className="w-4 h-4 rounded-sm bg-green-300" />
              <div className="w-4 h-4 rounded-sm bg-green-400" />
            </div>
            <span>Mehr</span>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};
