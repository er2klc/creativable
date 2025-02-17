
import { DocumentSection } from "../DocumentSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DocumentManagerProps {
  existingFiles?: Array<{
    id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    preview_file_path: string | null;
  }>;
  isAdmin?: boolean;
  onDocumentDeleted?: () => Promise<void>;
  lerninhalteId: string;
}

export const DocumentManager = ({ 
  isAdmin = false,
  lerninhalteId
}: DocumentManagerProps) => {
  // Früher Rückgabe wenn keine lerninhalteId vorhanden
  if (!lerninhalteId) {
    return null;
  }

  const { data: documents = [], refetch } = useQuery({
    queryKey: ['documents', lerninhalteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('elevate_lerninhalte_documents')
        .select('*')
        .eq('lerninhalte_id', lerninhalteId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!lerninhalteId // Query nur ausführen wenn lerninhalteId existiert
  });

  return (
    <div className="col-span-4">
      <DocumentSection
        documents={documents}
        isAdmin={isAdmin}
        onDelete={() => refetch()}
        lerninhalteId={lerninhalteId}
      />
    </div>
  );
};
