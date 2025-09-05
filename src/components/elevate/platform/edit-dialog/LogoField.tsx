
import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";

interface LogoFieldProps {
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
}

export const LogoField = ({ imageUrl, setImageUrl }: LogoFieldProps) => (
  <TeamLogoUpload
    currentLogoUrl={imageUrl}
    onLogoChange={(e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }}
    onLogoRemove={() => setImageUrl(null)}
  />
);
