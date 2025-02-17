
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
import { CreatePostCategoriesScroll } from "../components/categories/CreatePostCategoriesScroll";
import { toast } from "sonner";
import { useTeamCategories } from "@/hooks/useTeamCategories";

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
  categoryId: defaultCategoryId, 
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
      categoryId: defaultCategoryId || ''
    }
  });
  
  const { isUploading, setIsUploading, handleFileUpload } = useFileUpload(teamId);
  const { handleSubmission } = usePostSubmission(teamId, form.watch('categoryId'), onSuccess, teamMembers);
  const { data: categories } = useTeamCategories(teamSlug);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

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
    setSelectedCategory(categorySlug);
    const category = categories?.find(c => c.slug === categorySlug);
    if (category) {
      form.setValue('categoryId', category.id);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative">
          <CreatePostCategoriesScroll 
            activeTab={selectedCategory || ''}
            onCategoryClick={handleCategoryChange}
            isAdmin={isAdmin}
            teamSlug={teamSlug}
          />
        </div>
        
        <div className="px-6">
          <TitleField form={form} />
          <ContentField 
            form={form} 
            teamMembers={teamMembers}
            preventSubmitOnEnter={true}
          />
          <FileField form={form} />
        </div>

        <div className="px-6 flex justify-between">
          <div className="flex gap-2">
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
