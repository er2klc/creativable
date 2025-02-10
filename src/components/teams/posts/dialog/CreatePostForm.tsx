
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
import { TabScrollArea } from "../components/TabScrollArea";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";

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
  isAdmin?: boolean;
}

export const CreatePostForm = ({ 
  teamId, 
  categoryId: defaultCategoryId, 
  categories,
  onSuccess, 
  teamMembers,
  initialValues,
  editMode,
  isAdmin = false
}: CreatePostFormProps) => {
  const form = useForm<FormValues>({
    defaultValues: {
      ...initialValues,
      categoryId: defaultCategoryId || ''
    }
  });
  const location = useLocation();
  const teamSlug = location.pathname.split('/')[3]; // Extracts team slug from URL
  
  const { isUploading, setIsUploading, handleFileUpload } = useFileUpload(teamId);
  const { handleSubmission } = usePostSubmission(teamId, form.watch('categoryId'), onSuccess, teamMembers);

  // Filter categories based on admin status
  const filteredCategories = categories?.filter(category => isAdmin || category.is_public);

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

  const handleCategoryChange = (categorySlug?: string) => {
    const category = categories?.find(c => c.slug === categorySlug);
    if (category) {
      form.setValue('categoryId', category.id);
    } else {
      form.setValue('categoryId', '');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 pb-4">
          <TabScrollArea 
            activeTab={categories?.find(c => c.id === form.watch('categoryId'))?.slug || 'all'}
            onCategoryClick={handleCategoryChange}
            isAdmin={isAdmin}
            teamSlug={teamSlug}
          />
        </div>
        
        <TitleField form={form} />
        <ContentField form={form} />
        <FileField form={form} />
        
        <div className="sticky bottom-0 bg-white pt-4 flex justify-end">
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
