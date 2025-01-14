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
  Globe,
  Link2,
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
  { icon: Linkedin, name: "LinkedIn", url: "linkedin.com/in/" },
  { icon: Youtube, name: "YouTube", url: "youtube.com/@" },
  { icon: Twitter, name: "Twitter", url: "twitter.com/" },
  { icon: Mail, name: "Email", url: "mailto:" },
  { icon: Phone, name: "Phone", url: "tel:" },
  { icon: Globe, name: "Website", url: "" },
  { icon: Link2, name: "Custom Link", url: "" },
];

export const IconSelector = () => {
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      description: "URL prefix copied to clipboard!",
    });
  };

  return (
    <Card className="p-4 bg-[#1A1F2C]/60 border-white/10 backdrop-blur-sm">
      <h3 className="text-lg font-medium text-white mb-4">Quick Link Icons</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {ICON_OPTIONS.map((option) => (
          <Button
            key={option.name}
            variant="outline"
            className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 border-white/10"
            onClick={() => handleCopyUrl(option.url)}
          >
            <option.icon className="h-6 w-6 text-white" />
            <span className="text-xs text-white/80">{option.name}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
};