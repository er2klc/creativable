import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignatureData } from "@/types/signature";
import { Instagram, Linkedin, Youtube } from "lucide-react";
import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";

interface SignatureFormProps {
  signatureData: SignatureData;
  onChange: (data: SignatureData) => void;
  onLogoChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoRemove?: () => void;
  logoPreview?: string | null;
}

const TikTokIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export const SignatureForm = ({ 
  signatureData, 
  onChange,
  onLogoChange,
  onLogoRemove,
  logoPreview 
}: SignatureFormProps) => {
  const handleChange = (field: keyof SignatureData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({
      ...signatureData,
      [field]: e.target.value,
    });
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="space-y-4">
        <Label>Logo</Label>
        <TeamLogoUpload
          currentLogoUrl={signatureData.logoUrl}
          onLogoChange={onLogoChange}
          onLogoRemove={onLogoRemove}
          logoPreview={logoPreview}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={signatureData.name}
            onChange={handleChange("name")}
            placeholder="Max Mustermann"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            value={signatureData.position}
            onChange={handleChange("position")}
            placeholder="Marketing Manager"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company">Unternehmen</Label>
          <Input
            id="company"
            value={signatureData.company}
            onChange={handleChange("company")}
            placeholder="Musterfirma GmbH"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            type="email"
            value={signatureData.email}
            onChange={handleChange("email")}
            placeholder="max@musterfirma.de"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            value={signatureData.phone}
            onChange={handleChange("phone")}
            placeholder="+49 123 456789"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={signatureData.website}
            onChange={handleChange("website")}
            placeholder="www.musterfirma.de"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Social Media</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin" className="flex items-center gap-2">
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </Label>
            <Input
              id="linkedin"
              value={signatureData.linkedin}
              onChange={handleChange("linkedin")}
              placeholder="linkedin.com/in/maxmustermann"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <Instagram className="w-4 h-4" />
              Instagram
            </Label>
            <Input
              id="instagram"
              value={signatureData.instagram}
              onChange={handleChange("instagram")}
              placeholder="instagram.com/maxmustermann"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tiktok" className="flex items-center gap-2">
              <TikTokIcon />
              TikTok
            </Label>
            <Input
              id="tiktok"
              value={signatureData.tiktok}
              onChange={handleChange("tiktok")}
              placeholder="tiktok.com/@maxmustermann"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube" className="flex items-center gap-2">
              <Youtube className="w-4 h-4" />
              YouTube
            </Label>
            <Input
              id="youtube"
              value={signatureData.youtube}
              onChange={handleChange("youtube")}
              placeholder="youtube.com/@maxmustermann"
            />
          </div>
        </div>
      </div>
    </div>
  );
};