import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignatureData } from "@/types/signature";
import { Instagram, Linkedin, Youtube, Twitter, MessageCircle } from "lucide-react";

interface SignatureSocialMediaProps {
  data: SignatureData;
  onChange: (data: SignatureData) => void;
}

export const SignatureSocialMedia = ({ data, onChange }: SignatureSocialMediaProps) => {
  const handleChange = (field: keyof SignatureData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({
      ...data,
      [field]: e.target.value,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Social Media</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="linkedin" className="flex items-center gap-2">
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </Label>
          <Input
            id="linkedin"
            value={data.linkedin}
            onChange={handleChange("linkedin")}
            placeholder="linkedin.com/in/maxmustermann"
            className="bg-white/5 backdrop-blur-sm border-white/10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="twitter" className="flex items-center gap-2">
            <Twitter className="w-4 h-4" />
            Twitter
          </Label>
          <Input
            id="twitter"
            value={data.twitter}
            onChange={handleChange("twitter")}
            placeholder="twitter.com/maxmustermann"
            className="bg-white/5 backdrop-blur-sm border-white/10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram" className="flex items-center gap-2">
            <Instagram className="w-4 h-4" />
            Instagram
          </Label>
          <Input
            id="instagram"
            value={data.instagram}
            onChange={handleChange("instagram")}
            placeholder="instagram.com/maxmustermann"
            className="bg-white/5 backdrop-blur-sm border-white/10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </Label>
          <Input
            id="whatsapp"
            value={data.whatsapp}
            onChange={handleChange("whatsapp")}
            placeholder="+49 123 456789"
            className="bg-white/5 backdrop-blur-sm border-white/10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tiktok" className="flex items-center gap-2">
            <TikTokIcon />
            TikTok
          </Label>
          <Input
            id="tiktok"
            value={data.tiktok}
            onChange={handleChange("tiktok")}
            placeholder="tiktok.com/@maxmustermann"
            className="bg-white/5 backdrop-blur-sm border-white/10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="youtube" className="flex items-center gap-2">
            <Youtube className="w-4 h-4" />
            YouTube
          </Label>
          <Input
            id="youtube"
            value={data.youtube}
            onChange={handleChange("youtube")}
            placeholder="youtube.com/@maxmustermann"
            className="bg-white/5 backdrop-blur-sm border-white/10"
          />
        </div>
      </div>
    </div>
  );
};