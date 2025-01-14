import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";

interface ProfileImageUploadProps {
  avatarUrl: string | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAvatarRemove: () => void;
  logoPreview: string | null;
}

export const ProfileImageUpload = ({
  avatarUrl,
  onAvatarChange,
  onAvatarRemove,
  logoPreview
}: ProfileImageUploadProps) => {
  return (
    <div className="space-y-2">
      <div className="h-32 w-32 mx-auto">
        <TeamLogoUpload
          currentLogoUrl={avatarUrl}
          onLogoChange={onAvatarChange}
          onLogoRemove={onAvatarRemove}
          logoPreview={logoPreview}
        />
      </div>
    </div>
  );
};