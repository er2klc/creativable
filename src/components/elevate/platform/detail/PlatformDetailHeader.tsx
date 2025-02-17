
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, GraduationCap } from "lucide-react";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { useUser } from "@supabase/auth-helpers-react";
import { SearchBar } from "@/components/dashboard/SearchBar";

interface PlatformDetailHeaderProps {
  moduleTitle: string;
  title: string;
  isCompleted: boolean;
  onComplete: () => void;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  progress: number;
  videoDuration: number;
  documentsCount: number;
}

export const PlatformDetailHeader = ({
  moduleTitle,
  title,
  isCompleted,
  onComplete,
  isAdmin,
  onDelete,
  progress,
  videoDuration,
  documentsCount
}: PlatformDetailHeaderProps) => {
  const user = useUser();
  const isMobile = window.innerWidth < 768;

  return (
    <div className="fixed top-0 left-0 right-0 z-[30] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
      <div className="w-full">
        <div className="h-16 px-4 flex items-center">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              <div className="flex flex-col">
                <h1 className="text-lg md:text-xl font-semibold text-foreground">
                  {moduleTitle}
                </h1>
                <span className="text-sm text-muted-foreground">
                  {title}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {!isMobile && (
                <div className="w-[300px]">
                  <SearchBar />
                </div>
              )}
              <div className="flex gap-2">
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="text-red-600 hover:text-red-900"
                  >
                    <span className="sr-only">Löschen</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </Button>
                )}
                <Button
                  variant={isCompleted ? "outline" : "default"}
                  size="sm"
                  onClick={onComplete}
                >
                  {isCompleted ? "Als unerledigt markieren" : "Als erledigt markieren"}
                </Button>
              </div>
              <HeaderActions userEmail={user?.email} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-4 pb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span>Fortschritt</span>
          </div>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          {videoDuration > 0 && (
            <div className="flex items-center gap-2">
              <span>~{Math.round(videoDuration / 60)} Min</span>
            </div>
          )}
          {documentsCount > 0 && (
            <div className="flex items-center gap-2">
              <span>{documentsCount} {documentsCount === 1 ? 'Dokument' : 'Dokumente'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
