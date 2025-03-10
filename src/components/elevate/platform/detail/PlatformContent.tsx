
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PlatformHeader } from "./content/PlatformHeader";
import { PlatformTabs } from "./content/PlatformTabs";
import { DialogManager } from "./content/DialogManager";
import { EmptyState } from "./EmptyState";
import { GraduationCap, ChevronRight } from "lucide-react";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { useUser } from "@supabase/auth-helpers-react";
import { Link } from "react-router-dom";

interface PlatformContentProps {
  platform: any;
  sortedSubmodules: any[];
  isAdmin: boolean;
  activeUnitId: string;
  handleUnitChange: (unitId: string) => void;
  isCompleted: (id: string) => boolean;
  markAsCompleted: (id: string, completed?: boolean) => Promise<void>;
  handleVideoProgress: (lerninhalteId: string, progress: number) => void;
  refetch: () => Promise<any>;
}

export const PlatformContent = ({
  platform,
  sortedSubmodules,
  isAdmin,
  activeUnitId,
  handleUnitChange,
  isCompleted,
  markAsCompleted,
  handleVideoProgress,
  refetch,
}: PlatformContentProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [documentsCount, setDocumentsCount] = useState(0);
  const user = useUser();

  const activeUnit = sortedSubmodules.find(unit => unit.id === activeUnitId);
  const completedCount = sortedSubmodules.filter(unit => isCompleted(unit.id)).length;
  const progress = (completedCount / sortedSubmodules.length) * 100;

  useEffect(() => {
    const fetchDocumentsCount = async () => {
      if (activeUnitId) {
        const { data: documents } = await supabase
          .from('elevate_lerninhalte_documents')
          .select('*')
          .eq('lerninhalte_id', activeUnitId);
        
        setDocumentsCount(documents?.length || 0);
      }
    };
    fetchDocumentsCount();
  }, [activeUnitId]);

  const handleDeleteUnit = async () => {
    try {
      const { error: notesError } = await supabase
        .from('elevate_lerninhalte_notes')
        .delete()
        .eq('lerninhalte_id', activeUnitId);

      if (notesError) throw notesError;

      const { error: docsError } = await supabase
        .from('elevate_lerninhalte_documents')
        .delete()
        .eq('lerninhalte_id', activeUnitId);

      if (docsError) throw docsError;

      const { error } = await supabase
        .from('elevate_lerninhalte')
        .delete()
        .eq('id', activeUnitId);

      if (error) throw error;

      await refetch();
      toast.success("Lerneinheit erfolgreich gelöscht");
    } catch (error) {
      console.error('Error deleting learning unit:', error);
      toast.error("Fehler beim Löschen der Lerneinheit");
    }
  };

  if (sortedSubmodules.length === 0) {
    return (
      <div className="pt-16">
        <EmptyState 
          isAdmin={isAdmin} 
          onCreateUnit={async (data) => {
            try {
              const { data: lerninhalte, error: unitError } = await supabase
                .from('elevate_lerninhalte')
                .insert({
                  module_id: platform?.elevate_modules?.[0]?.id,
                  title: data.title,
                  description: data.description,
                  video_url: data.videoUrl,
                  created_by: platform.created_by,
                  submodule_order: sortedSubmodules.length
                })
                .select()
                .single();

              if (unitError) throw unitError;

              for (const file of data.files) {
                const filePath = `${lerninhalte.id}/${file.name}`;
                const { error: uploadError } = await supabase.storage
                  .from('elevate-documents')
                  .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { error: docError } = await supabase
                  .from('elevate_lerninhalte_documents')
                  .insert({
                    lerninhalte_id: lerninhalte.id,
                    file_name: file.name,
                    file_path: filePath,
                    file_type: file.type,
                    created_by: platform.created_by
                  });

                if (docError) throw docError;
              }

              toast.success("Neue Lerneinheit erfolgreich erstellt");
              setIsDialogOpen(false);
              await refetch();
            } catch (error) {
              console.error('Error creating learning unit:', error);
              toast.error("Fehler beim Erstellen der Lerneinheit");
            }
          }}
        />
      </div>
    );
  }

  return (
    <>
      {/* New Global Header */}
      <div className="fixed top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            <Link to="/elevate" className="text-lg font-semibold hover:text-primary transition-colors">
              Elevate
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{platform.name}</span>
          </div>
          
          <div className="hidden md:block w-[300px]">
            <SearchBar />
          </div>
          
          <HeaderActions userEmail={user?.email} />
        </div>
      </div>

      {/* Main Content with Original Header */}
      <div className="pt-16">
        <PlatformHeader
          platform={platform}
          activeUnit={activeUnit}
          isAdmin={isAdmin}
          isCompleted={isCompleted}
          markAsCompleted={markAsCompleted}
          handleDeleteUnit={handleDeleteUnit}
          setIsEditDialogOpen={setIsEditDialogOpen}
          progress={progress}
          videoDuration={videoDuration}
          documentsCount={documentsCount}
        />

        <div className="bg-gray-50 rounded-lg">
          <PlatformTabs
            sortedSubmodules={sortedSubmodules}
            activeUnitId={activeUnitId}
            handleUnitChange={handleUnitChange}
            isAdmin={isAdmin}
            setIsDialogOpen={setIsDialogOpen}
            isCompleted={isCompleted}
            markAsCompleted={markAsCompleted}
            handleVideoProgress={handleVideoProgress}
            platform={platform}
            handleDeleteUnit={handleDeleteUnit}
            refetch={refetch}
            setIsEditDialogOpen={setIsEditDialogOpen}
            progress={progress}
          />
        </div>

        <DialogManager
          platform={platform}
          sortedSubmodules={sortedSubmodules}
          refetch={refetch}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          isEditDialogOpen={isEditDialogOpen}
          setIsEditDialogOpen={setIsEditDialogOpen}
          activeUnit={activeUnit}
        />
      </div>
    </>
  );
};
