import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Twitter,
  Mail,
  Phone,
  Github,
  type LucideIcon
} from "lucide-react";

interface IconOption {
  icon: LucideIcon;
  name: string;
  url: string;
}

const ICON_OPTIONS: IconOption[] = [
  { icon: Facebook, name: "Facebook", url: "facebook.com/" },
  { icon: Instagram, name: "Instagram", url: "instagram.com/" },
  { icon: Twitter, name: "Twitter", url: "twitter.com/" },
  { icon: Linkedin, name: "LinkedIn", url: "linkedin.com/in/" },
  { icon: Youtube, name: "YouTube", url: "youtube.com/@" },
  { icon: Github, name: "GitHub", url: "github.com/" },
  { icon: Mail, name: "Email", url: "mailto:" },
  { icon: Phone, name: "Phone", url: "tel:" },
];

export const IconSelector = () => {
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      description: "URL prefix copied to clipboard!",
    });
  };

  return (
    <Card className="p-4 bg-transparent border-white/10">
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
        {ICON_OPTIONS.map((option) => (
          <Button
            key={option.name}
            variant="glassy"
            size="icon"
            className="h-12 w-12"
            onClick={() => handleCopyUrl(option.url)}
            title={option.name}
          >
            <option.icon className="h-6 w-6" />
          </Button>
        ))}
      </div>
    </Card>
  );
};