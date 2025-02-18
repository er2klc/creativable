
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { TitleField } from "./form-fields/TitleField";
import { ContentField } from "./form-fields/ContentField";
import { FileField } from "./form-fields/FileField";
import { useFileUpload } from "./hooks/useFileUpload";
import { usePostSubmission } from "./hooks/usePostSubmission";
import { toast } from "sonner";

interface FormValues {
  title: string;
  content: string;
  files?: FileList;
  categoryId: string;
}

interface CreatePostFormProps {
  teamId: string;
  categoryId?: string;
  onSuccess: () => void;
  teamMembers?: any[];
  initialValues?: Partial<FormValues>;
  editMode?: {
    postId: string;
    originalFiles?: string[] | null;
  };
  isAdmin?: boolean;
  teamSlug: string;
}

export const CreatePostForm = ({ 
  teamId, 
  categoryId, 
  onSuccess, 
  teamMembers,
  initialValues,
  editMode,
  isAdmin = false,
  teamSlug
}: CreatePostFormProps) => {
  const form = useForm<FormValues>({
    defaultValues: {
      ...initialValues,
      categoryId: categoryId || ''
    }
  });
  
  const { isUploading, setIsUploading, handleFileUpload } = useFileUpload(teamId);
  const { handleSubmission } = usePostSubmission(teamId, categoryId, onSuccess, teamMembers);
  const [existingFiles, setExistingFiles] = useState<string[]>(editMode?.originalFiles || []);

  const handleDeleteFile = (fileUrl: string) => {
    setExistingFiles(prev => prev.filter(url => url !== fileUrl));
  };

  const onSubmit = async (values: FormValues) => {
    if (!categoryId) {
      toast.error("Bitte wählen Sie eine Kategorie aus");
      return;
    }

    setIsUploading(true);
    try {
      const fileUrls = values.files ? await handleFileUpload(values.files) : [];
      const finalFileUrls = [...existingFiles, ...fileUrls];

      await handleSubmission(values, finalFileUrls, editMode?.postId);
      form.reset();
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4 h-[calc(100vh-280px)] overflow-y-auto px-6">
          <TitleField form={form} />
          <ContentField 
            form={form} 
            teamMembers={teamMembers}
            preventSubmitOnEnter={true}
            isAdmin={isAdmin}
            teamId={teamId}
          />
          <FileField 
            form={form} 
            existingFiles={existingFiles}
            onDeleteFile={handleDeleteFile}
          />
        </div>
        <div className="border-t bg-background pt-4 px-6 mt-4">
          <div className="flex justify-end">
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Wird hochgeladen...
                </>
              ) : (
                editMode ? 'Aktualisieren' : 'Erstellen'
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
