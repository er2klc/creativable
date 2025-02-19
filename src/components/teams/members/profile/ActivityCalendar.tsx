
import { eachDayOfInterval, format, isSameDay, startOfYear, endOfYear, isToday, startOfWeek, endOfWeek, addWeeks } from "date-fns";
import { de } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ActivityCalendarProps, DayActivity } from "./types/calendar";

export const ActivityCalendar = ({ activities }: ActivityCalendarProps) => {
  const currentYear = new Date().getFullYear();
  const startDate = startOfYear(new Date(currentYear, 0, 1));
  const endDate = endOfYear(new Date(currentYear, 11, 31));
  
  const activityByDay = new Map<string, DayActivity>();
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });
  
  allDays.forEach(day => {
    const dayActivities = activities.filter(activity => 
      isSameDay(new Date(activity.created_at), day)
    );

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

  const weeks: Date[][] = [];
  let currentDate = startDate;
  
  while (currentDate <= endDate) {
    const weekDays = eachDayOfInterval({
      start: startOfWeek(currentDate, { weekStartsOn: 1 }),
      end: endOfWeek(currentDate, { weekStartsOn: 1 })
    });
    weeks.push(weekDays);
    currentDate = addWeeks(currentDate, 1);
  }

  const getIntensity = (total: number): number => {
    if (total === 0) return 0;
    if (total <= 2) return 1;
    if (total <= 5) return 2;
    if (total <= 10) return 3;
    return 4;
  };

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
    <div className="bg-white rounded-lg p-2 border border-gray-200 w-full">
      <h3 className="text-lg font-semibold mb-2 text-gray-900">Activity</h3>
      <TooltipProvider>
        <div className="relative overflow-x-auto">
          <div className="flex gap-1">
            <div className="grid grid-rows-7 text-[9px] text-gray-500 gap-[2px] pr-2">
              {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day, index) => (
                <div key={day} className="h-[20px] flex items-center">
                  {day}
                </div>
              ))}
            </div>

            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-rows-7 gap-[2px]">
                  {week.map((day, dayIndex) => {
                    const activity = activityByDay.get(format(day, 'yyyy-MM-dd'));
                    if (!activity) return null;

                    const specialMessage = getSpecialMessage(activity);
                    
                    return (
                      <Tooltip key={`${weekIndex}-${dayIndex}`}>
                        <TooltipTrigger asChild>
                          <div className="relative">
                            <div
                              className={cn(
                                "w-[20px] h-[20px] flex items-center justify-center text-[9px] rounded-sm transition-colors",
                                isToday(day) && "ring-1 ring-black ring-offset-1",
                                getIntensity(activity.total) === 0 && "bg-[#ebedf0]",
                                getIntensity(activity.total) === 1 && "bg-[#9be9a8]",
                                getIntensity(activity.total) === 2 && "bg-[#40c463]",
                                getIntensity(activity.total) === 3 && "bg-[#30a14e]",
                                getIntensity(activity.total) === 4 && "bg-[#216e39]",
                                activity.total > 0 && "text-white font-medium"
                              )}
                            >
                              {format(day, 'd')}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent 
                          className="bg-white border border-gray-200 text-gray-900 p-2 rounded-md shadow-sm"
                        >
                          <div className="text-[10px] space-y-0.5">
                            <div>
                              {activity.total} {activity.total === 1 ? 'activity' : 'activities'}
                              {activity.posts > 0 && ` (${activity.posts} posts)`}
                              {activity.comments > 0 && ` (${activity.comments} comments)`}
                              {activity.likes > 0 && ` (${activity.likes} reactions)`}
                            </div>
                            <div className="font-medium">
                              {format(day, 'EEEE, d. MMMM yyyy', { locale: de })}
                            </div>
                            {specialMessage && (
                              <div className="text-gray-500">{specialMessage}</div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end text-[10px] text-gray-500 mt-2">
            <div className="flex items-center gap-1">
              <span>Less</span>
              <div className="flex gap-[1px]">
                <div className="w-[16px] h-[16px] rounded-sm bg-[#ebedf0]" />
                <div className="w-[16px] h-[16px] rounded-sm bg-[#9be9a8]" />
                <div className="w-[16px] h-[16px] rounded-sm bg-[#40c463]" />
                <div className="w-[16px] h-[16px] rounded-sm bg-[#30a14e]" />
                <div className="w-[16px] h-[16px] rounded-sm bg-[#216e39]" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};
