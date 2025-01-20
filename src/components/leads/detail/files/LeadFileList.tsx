import { useQuery } from "@tanstack/react-query";
import { FileText, Download, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";

interface LeadFileListProps {
  leadId: string;
}

export const LeadFileList = ({ leadId }: LeadFileListProps) => {
  const { settings } = useSettings();
  
  const { data: files = [] } = useQuery({
    queryKey: ["lead-files", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_files")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDownload = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage
      .from("documents")
      .download(filePath);

    if (error) {
      console.error("Error downloading file:", error);
      return;
    }

    const url = window.URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePreview = async (filePath: string) => {
    try {
      const { data } = await supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        window.open(data.publicUrl, "_blank");
      }
    } catch (err) {
      console.error("Error getting public URL:", err);
    }
  };

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-4 rounded-lg border"
        >
          <div className="flex items-center space-x-4">
            <FileText className="h-6 w-6 text-blue-500" />
            <div>
              <p className="font-medium">{file.file_name}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(file.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreview(file.file_path)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(file.file_path, file.file_name)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};