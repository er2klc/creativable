
import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { useUser } from "@supabase/auth-helpers-react";

interface PlatformDetailHeaderProps {
  platform: {
    name: string;
  } | null;
}

export const PlatformDetailHeader = ({ platform }: PlatformDetailHeaderProps) => {
  const user = useUser();

  return (
    <div className="fixed top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
      <div className="w-full">
        <div className="h-16 px-4 flex items-center">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              <div className="flex items-center gap-2">
                <Link 
                  to="/elevate" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Elevate
                </Link>
                <span className="text-sm text-muted-foreground">/</span>
                <h1 className="text-lg md:text-xl font-semibold text-foreground">
                  {platform?.name || 'Lerneinheit'}
                </h1>
              </div>
            </div>

            <HeaderActions userEmail={user?.email} />
          </div>
        </div>
      </div>
    </div>
  );
};
