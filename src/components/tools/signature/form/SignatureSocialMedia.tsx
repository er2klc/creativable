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
      <div className="grid grid-cols-3 gap-4">
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
          <Label htmlFor="xing" className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.188 0c-.517 0-.741.325-.927.66 0 0-7.455 13.224-7.702 13.657.015.024 4.919 9.023 4.919 9.023.17.308.436.66.967.66h3.454c.211 0 .375-.078.463-.22.089-.151.089-.346-.009-.536l-4.879-8.916c-.004-.006-.004-.016 0-.022L22.139.756c.095-.191.097-.387.006-.535C22.056.078 21.894 0 21.686 0h-3.498zM3.648 4.74c-.211 0-.385.074-.473.216-.09.149-.078.339.02.531l2.34 4.05c.004.01.004.016 0 .021L1.86 16.051c-.099.188-.093.381 0 .529.085.142.239.234.45.234h3.461c.518 0 .766-.348.945-.667l3.734-6.609-2.378-4.155c-.172-.315-.434-.659-.962-.659H3.648v.016z"/>
            </svg>
            Xing
          </Label>
          <Input
            id="xing"
            placeholder="Xing URL"
            value={data.xing || ""}
            onChange={handleChange("xing")}
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