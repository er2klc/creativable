
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";

interface UnitFormProps {
  initialContent: {
    title: string;
    description: string;
    videoUrl: string;
  };
  onContentChange: (data: { title: string; description: string; videoUrl: string }) => void;
  existingFiles?: string[];
}

export const UnitForm = ({ initialContent, onContentChange, existingFiles = [] }: UnitFormProps) => {
  const handleChange = (key: string, value: string) => {
    onContentChange({
      ...initialContent,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4 py-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Titel</Label>
          <Input
            id="title"
            value={initialContent.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Titel der Lerneinheit"
          />
        </div>
        
        <Tabs defaultValue="content">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Inhalt</TabsTrigger>
            <TabsTrigger value="media">Medien</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content">
            <Card className="p-4">
              <div className="grid gap-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={initialContent.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={10}
                  placeholder="Beschreibung der Lerneinheit..."
                />
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="media">
            <Card className="p-4 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={initialContent.videoUrl}
                  onChange={(e) => handleChange("videoUrl", e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Dateien</Label>
                <FileUpload 
                  onFileSelect={(urls) => console.log("Files selected:", urls)} 
                  existingFiles={existingFiles} 
                  folder="platform-content"
                  maxFiles={5}
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
