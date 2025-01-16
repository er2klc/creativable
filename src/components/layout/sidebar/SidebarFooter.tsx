import { cn } from "@/lib/utils";

interface SidebarFooterProps {
  isExpanded: boolean;
  currentVersion: string;
}

export const SidebarFooter = ({ isExpanded, currentVersion }: SidebarFooterProps) => {
  return (
    <div className={cn(
      "sticky bottom-0 left-0 flex items-center justify-center px-4 py-2 text-sm text-gray-400 border-t border-white/10 bg-[#111111]/80 transition-all duration-300",
      isExpanded ? "justify-between w-full" : "w-[72px]"
    )}>
      <div className="flex items-center gap-2">
        <span className="text-white">{currentVersion}</span>
        {isExpanded && (
          <a href="/changelog" className="whitespace-nowrap text-gray-400 hover:text-white transition-opacity duration-300">
            Changelog
          </a>
        )}
      </div>
    </div>
  );
};
