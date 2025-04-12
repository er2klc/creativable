
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ExternalLink } from 'lucide-react';

interface LinkedInProfileProps {
  profile: any;
  name: string;
}

export const LinkedInProfile = ({ profile, name }: LinkedInProfileProps) => {
  if (!profile) return null;
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2" stroke="#0A66C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect x="2" y="9" width="4" height="12"></rect>
            <circle cx="4" cy="4" r="2"></circle>
          </svg>
          LinkedIn Profile
          {profile.url && (
            <a href={profile.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-blue-500 hover:text-blue-700">
              <ExternalLink size={16} />
            </a>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={profile.profilePicture || profile.avatar_url} alt={name} />
            <AvatarFallback>{name?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-medium text-base">{profile.name || name}</h3>
            {profile.headline && <p className="text-sm text-gray-600">{profile.headline}</p>}
            {profile.connections && (
              <div className="mt-1 text-xs text-gray-500">
                {profile.connections} connections
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkedInProfile;
