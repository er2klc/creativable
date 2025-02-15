
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface BaseCategoryScrollProps {
  children: React.ReactNode;
  className?: string;
}

export const BaseCategoryScroll = ({ children, className }: BaseCategoryScrollProps) => {
  return (
    <ScrollArea className={cn("w-full", className)}>
      <div className="flex items-center gap-2 p-1">
        {children}
      </div>
      <ScrollBar orientation="horizontal" className="h-2.5" />
    </ScrollArea>
  );
};
