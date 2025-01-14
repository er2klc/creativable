import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clipboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BioPreviewProps {
  generatedBio: string;
}

export const BioPreview = ({ generatedBio }: BioPreviewProps) => {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedBio);
    toast({
      title: "Kopiert!",
      description: "Bio wurde in die Zwischenablage kopiert.",
    });
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Generierte Bio</h2>
      <div className="min-h-[200px] p-4 bg-muted rounded-lg relative">
        {generatedBio ? (
          <>
            <p className="whitespace-pre-wrap">{generatedBio}</p>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={copyToClipboard}
            >
              <Clipboard className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <p className="text-muted-foreground">
            Ihre generierte Bio wird hier angezeigt...
          </p>
        )}
      </div>
    </Card>
  );
};