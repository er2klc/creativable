
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
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <div className="sticky top-0 bg-background z-10 border-b px-6 py-2">
          <ScrollArea className="w-full whitespace-nowrap">
            <CreatePostCategoriesScroll 
              activeTab={selectedCategory || ''}
              onCategoryClick={handleCategoryChange}
              isAdmin={isAdmin}
              teamSlug={teamSlug}
            />
          </ScrollArea>
        </div>
        
        <ScrollArea className="flex-1 px-6">
          <div className="py-4 space-y-4">
            <TitleField form={form} />
            <ContentField 
              form={form} 
              teamMembers={teamMembers}
              preventSubmitOnEnter={true}
            />
            <FileField form={form} />
          </div>
        </ScrollArea>

        <div className="sticky bottom-0 bg-background px-6 py-4 border-t mt-auto">
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
