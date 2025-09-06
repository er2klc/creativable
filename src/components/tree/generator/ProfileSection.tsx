import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ProfileSectionProps {
  username: string;
  bio: string;
  avatarUrl: string | null;
  logoPreview: string | null;
  onUsernameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onAvatarRemove: () => Promise<void>;
  onSaveProfile: () => Promise<void>;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  username,
  bio,
  avatarUrl,
  logoPreview,
  onUsernameChange,
  onBioChange,
  onAvatarChange,
  onAvatarRemove,
  onSaveProfile,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Profile Picture</Label>
        <div className="h-32 w-32 mx-auto">
          <TeamLogoUpload
            currentLogoUrl={avatarUrl}
            onLogoChange={onAvatarChange}
            onLogoRemove={onAvatarRemove}
            logoPreview={logoPreview}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          placeholder="Your username"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder="Tell us about yourself"
          className="resize-none"
          rows={3}
        />
      </div>

      <Button
        onClick={onSaveProfile}
        className="w-full"
      >
        Save Profile
      </Button>
    </div>
  );
};