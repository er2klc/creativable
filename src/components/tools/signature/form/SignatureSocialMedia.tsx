import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignatureData } from "@/types/signature";
import { Linkedin, Instagram, Youtube, Twitter, MessageSquare } from "lucide-react";

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
            <Linkedin className="w-4 h-4" /> LinkedIn
          </Label>
          <Input
            id="linkedin"
            placeholder="LinkedIn URL"
            value={data.linkedin || ""}
            onChange={handleChange("linkedin")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram" className="flex items-center gap-2">
            <Instagram className="w-4 h-4" /> Instagram
          </Label>
          <Input
            id="instagram"
            placeholder="Instagram URL"
            value={data.instagram || ""}
            onChange={handleChange("instagram")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="youtube" className="flex items-center gap-2">
            <Youtube className="w-4 h-4" /> YouTube
          </Label>
          <Input
            id="youtube"
            placeholder="YouTube URL"
            value={data.youtube || ""}
            onChange={handleChange("youtube")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="twitter" className="flex items-center gap-2">
            <Twitter className="w-4 h-4" /> X (Twitter)
          </Label>
          <Input
            id="twitter"
            placeholder="X (Twitter) URL"
            value={data.twitter || ""}
            onChange={handleChange("twitter")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> WhatsApp
          </Label>
          <Input
            id="whatsapp"
            placeholder="WhatsApp Number"
            value={data.whatsapp || ""}
            onChange={handleChange("whatsapp")}
          />
        </div>
      </div>
    </div>
  );
};