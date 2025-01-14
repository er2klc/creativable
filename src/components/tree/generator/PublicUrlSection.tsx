import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PublicUrlSectionProps {
  profile: any;
}

export const PublicUrlSection: React.FC<PublicUrlSectionProps> = ({ profile }) => {
  const copyUrl = () => {
    navigator.clipboard.writeText(`${window.location.origin}/tree/${profile.slug}`);
    toast({
      description: "URL copied to clipboard",
    });
  };

  return (
    <div className="pt-4 border-t">
      <p className="text-sm text-muted-foreground">Your public URL:</p>
      <div className="flex items-center gap-2 mt-1">
        <Input 
          value={`${window.location.origin}/tree/${profile.slug}`}
          readOnly
          className="font-mono text-sm"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={copyUrl}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};