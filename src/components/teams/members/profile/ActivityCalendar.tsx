
import { eachDayOfInterval, format, isSameDay, startOfYear, endOfYear, isToday, startOfWeek, endOfWeek, differenceInWeeks } from "date-fns";
import { de } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ActivityCalendarProps, DayActivity } from "./types/calendar";

export const ActivityCalendar = ({ activities }: ActivityCalendarProps) => {
  const currentYear = new Date().getFullYear();
  const startDate = startOfYear(new Date(currentYear, 0, 1));
  const endDate = endOfYear(new Date(currentYear, 11, 31));
  
  // Get all days in the year
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Calculate activity for each day
  const activityByDay = new Map<string, DayActivity>();
  allDays.forEach(day => {
    const dayActivities = activities.filter(activity => 
      isSameDay(new Date(activity.created_at), day)
    );

    // Zähle Posts und Kommentare
    const posts = dayActivities.filter(a => a.type === 'post').length;
    const comments = dayActivities.filter(a => a.type === 'comment').length;
    const likes = dayActivities.reduce((sum, a) => sum + (a.reactions_count || 0), 0);

    activityByDay.set(format(day, 'yyyy-MM-dd'), {
      date: day,
      posts,
      comments,
      likes,
      total: posts + comments + likes
    });
  });

  // Calculate activity intensity (0-4)
  const getIntensity = (total: number): number => {
    if (total === 0) return 0;
    if (total <= 2) return 1;
    if (total <= 5) return 2;
    if (total <= 10) return 3;
    return 4;
  };

  // Calculate weeks
  const totalWeeks = differenceInWeeks(endDate, startDate) + 1;
  const weeks: Date[][] = [];
  let currentDate = startDate;

  for (let week = 0; week < totalWeeks; week++) {
    const weekDays = eachDayOfInterval({
      start: startOfWeek(currentDate, { weekStartsOn: 1 }),
      end: endOfWeek(currentDate, { weekStartsOn: 1 })
    });
    weeks.push(weekDays);
    currentDate = new Date(currentDate.setDate(currentDate.getDate() + 7));
  }

  // Gleichmäßige Verteilung der Monate
  const monthLabels = Array.from({ length: 13 }, (_, i) => {
    const date = new Date(currentYear, (i + 11) % 12, 1); // Start mit Dezember des Vorjahres
    return {
      month: format(date, 'MMM', { locale: de }) + '.',
      weekIndex: Math.floor(i * (weeks.length / 13))
    };
  });

  const getSpecialMessage = (day: DayActivity): string | undefined => {
    if (day.total === 0) return undefined;
    
    const sortedActivities = Array.from(activityByDay.values())
      .filter(d => d.total > 0)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    if (sortedActivities[0]?.date.getTime() === day.date.getTime()) {
      return "First day 🎉";
    }
    return undefined;
  };

  return (
    <div className="bg-white rounded-lg p-2 border border-gray-200">
      <h3 className="text-lg font-semibold mb-2 text-gray-900">Activity</h3>
      <TooltipProvider>
        <div className="relative">
          {/* Month Labels */}
          <div className="grid grid-cols-[auto_repeat(52,1fr)] mb-1 text-xs text-gray-500">
            <div /> {/* Spacer for weekday labels */}
            <div className="col-span-52 grid grid-cols-52 text-start">
              {monthLabels.map((label, index) => (
                <div
                  key={index}
                  className="text-[9px] font-medium whitespace-nowrap"
                  style={{
                    gridColumn: `${label.weekIndex + 1} / span ${
                      index < monthLabels.length - 1
                        ? monthLabels[index + 1].weekIndex - label.weekIndex
                        : 53 - label.weekIndex
                    }`
                  }}
                >
                  {label.month}
                </div>
              ))}
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-[auto_repeat(52,1fr)] gap-[0.5px]">
            {/* Weekday Labels */}
            <div className="grid grid-rows-7 text-[9px] text-gray-500 gap-[0.5px] pr-1">
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
              <div>Sun</div>
            </div>

            {/* Activity Grid */}
            <div className="col-span-52 grid grid-cols-52 grid-rows-7 gap-[0.5px]">
              {weeks.map((week, weekIndex) =>
                week.map((day, dayIndex) => {
                  const activity = activityByDay.get(format(day, 'yyyy-MM-dd'));
                  if (!activity) return null;

                  const specialMessage = getSpecialMessage(activity);
                  
                  return (
                    <Tooltip key={`${weekIndex}-${dayIndex}`}>
                      <TooltipTrigger asChild>
                        <div
                          style={{
                            gridColumn: weekIndex + 1,
                            gridRow: dayIndex + 1,
                          }}
                          className={cn(
                            "w-[8px] h-[8px]",
                            isToday(day) && "ring-1 ring-black ring-offset-1",
                            getIntensity(activity.total) === 0 && "bg-[#ebedf0]",
                            getIntensity(activity.total) === 1 && "bg-[#9be9a8]",
                            getIntensity(activity.total) === 2 && "bg-[#40c463]",
                            getIntensity(activity.total) === 3 && "bg-[#30a14e]",
                            getIntensity(activity.total) === 4 && "bg-[#216e39]"
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent 
                        className="bg-white border border-gray-200 text-gray-900 p-1 rounded-md shadow-sm"
                      >
                        <div className="text-[10px] space-y-0.5">
                          <div>
                            {activity.total} {activity.total === 1 ? 'activity' : 'activities'}
                            {activity.posts > 0 && ` (${activity.posts} posts)`}
                            {activity.comments > 0 && ` (${activity.comments} comments)`}
                            {activity.likes > 0 && ` (${activity.likes} reactions)`}
                          </div>
                          <div className="font-medium">
                            {format(day, 'EEEE, MMMM d, yyyy', { locale: de })}
                          </div>
                          {specialMessage && (
                            <div className="text-gray-500">{specialMessage}</div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end text-[10px] text-gray-500 mt-1">
            <div className="flex items-center gap-1">
              <span>Less</span>
              <div className="flex gap-[0.5px]">
                <div className="w-[8px] h-[8px] bg-[#ebedf0]" />
                <div className="w-[8px] h-[8px] bg-[#9be9a8]" />
                <div className="w-[8px] h-[8px] bg-[#40c463]" />
                <div className="w-[8px] h-[8px] bg-[#30a14e]" />
                <div className="w-[8px] h-[8px] bg-[#216e39]" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};
