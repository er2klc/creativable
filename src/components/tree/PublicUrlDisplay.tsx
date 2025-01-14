import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "lucide-react";
import { toast } from "sonner";

interface PublicUrlDisplayProps {
  slug: string;
}

export const PublicUrlDisplay = ({ slug }: PublicUrlDisplayProps) => {
  const publicUrl = `${window.location.origin}/tree/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    toast({
      description: "URL copied to clipboard",
    });
  };

  return (
    <div className="pt-4 border-t border-white/10">
      <p className="text-sm text-gray-400">Your public URL:</p>
      <div className="flex items-center gap-2 mt-1">
        <Input 
          value={publicUrl}
          readOnly
          className="font-mono text-sm bg-white/5 border-white/10 text-white"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopy}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <Link className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};