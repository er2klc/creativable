import { cn } from "@/lib/utils";

interface PlatformIndicatorProps {
  platform: string;
}

export const PlatformIndicator = ({ platform }: PlatformIndicatorProps) => {
  return (
    <div className={cn(
      "absolute -right-2 -top-2 rounded-full w-7 h-7 border-2 border-white shadow-lg flex items-center justify-center",
      "bg-primary text-primary-foreground"
    )}>
      {platform.charAt(0).toUpperCase()}
    </div>
  );
};