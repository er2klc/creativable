
import { cn } from "@/lib/utils";
import { getPlatformIcon, getPlatformColor } from "../utils/platformUtils";

interface PlatformIndicatorProps {
  platform: string;
}

export const PlatformIndicator = ({ platform }: PlatformIndicatorProps) => {
  return (
    <div className={cn(
      "absolute -right-2 -top-2 rounded-full w-7 h-7 border-2 border-white shadow-lg flex items-center justify-center",
      getPlatformColor(platform)
    )}>
      {getPlatformIcon(platform)}
    </div>
  );
};
