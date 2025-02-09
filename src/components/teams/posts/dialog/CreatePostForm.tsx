
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

interface FormValues {
  title: string;
  content: string;
  files?: FileList;
}

interface CreatePostFormProps {
  teamId: string;
  categoryId?: string;
  onSuccess: () => void;
  teamMembers?: any[];
}

export const CreatePostForm = ({ teamId, categoryId, onSuccess, teamMembers }: CreatePostFormProps) => {
  const form = useForm<FormValues>();
  const { isUploading, setIsUploading, handleFileUpload } = useFileUpload(teamId);
  const { handleSubmission } = usePostSubmission(teamId, categoryId, onSuccess, teamMembers);

  const onSubmit = async (values: FormValues) => {
    setIsUploading(true);
    try {
      const fileUrls = values.files ? await handleFileUpload(values.files) : [];
      await handleSubmission(values, fileUrls);
      form.reset();
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <TitleField form={form} />
        <ContentField form={form} />
        <FileField form={form} />
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isUploading}>
            {isUploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Wird hochgeladen...
              </>
            ) : (
              'Erstellen'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
