
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
  categories?: any[];
  onSuccess: () => void;
  teamMembers?: any[];
  initialValues?: Partial<FormValues>;
  editMode?: {
    postId: string;
    originalFiles?: string[] | null;
  };
}

export const CreatePostForm = ({ 
  teamId, 
  categoryId: defaultCategoryId, 
  categories,
  onSuccess, 
  teamMembers,
  initialValues,
  editMode 
}: CreatePostFormProps) => {
  const form = useForm<FormValues>({
    defaultValues: {
      ...initialValues,
      categoryId: defaultCategoryId || ''
    }
  });
  
  const { isUploading, setIsUploading, handleFileUpload } = useFileUpload(teamId);
  const { handleSubmission } = usePostSubmission(teamId, form.watch('categoryId'), onSuccess, teamMembers);

  const onSubmit = async (values: FormValues) => {
    if (!values.categoryId) {
      toast.error("Bitte wählen Sie eine Kategorie aus");
      return;
    }

    setIsUploading(true);
    try {
      const fileUrls = values.files ? await handleFileUpload(values.files) : [];
      
      const finalFileUrls = editMode?.originalFiles 
        ? [...editMode.originalFiles, ...fileUrls]
        : fileUrls;

      await handleSubmission(values, finalFileUrls, editMode?.postId);
      form.reset();
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category">Kategorie</Label>
          <Select
            value={form.watch('categoryId')}
            onValueChange={(value) => form.setValue('categoryId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Kategorie auswählen" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
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
              editMode ? 'Aktualisieren' : 'Erstellen'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
