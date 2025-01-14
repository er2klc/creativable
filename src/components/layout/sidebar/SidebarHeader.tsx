import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  isExpanded: boolean;
}

export const SidebarHeader = ({ isExpanded }: SidebarHeaderProps) => {
  return (
    <div className="sticky top-0 left-0 z-50 bg-[#111111]/80 w-full">
      <div className="w-full h-16 flex items-center px-4">
        <div className="absolute inset-0 bg-[url('/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png')] opacity-10 blur-2xl scale-150" />
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" 
            alt="Logo" 
            className="h-8 w-8 relative z-10"
          />
          <span className={cn("text-white font-medium transition-opacity duration-300 whitespace-nowrap", 
            isExpanded ? "opacity-100" : "opacity-0")}>
            creativable
          </span>
        </div>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
};