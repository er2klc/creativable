
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ExternalLink, Users, Heart, MessageCircle } from 'lucide-react';

interface InstagramProfileProps {
  profile: any;
  name: string;
}

export const InstagramProfile = ({ profile, name }: InstagramProfileProps) => {
  if (!profile) return null;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
          Instagram Profile
          {profile.url && (
            <a href={profile.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-pink-500 hover:text-pink-700">
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
            <h3 className="font-medium text-base">{profile.username || name}</h3>
            {profile.biography && <p className="text-sm text-gray-600">{profile.biography}</p>}
            
            <div className="flex gap-4 mt-2">
              {profile.followersCount !== undefined && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="h-3 w-3" />
                  <span>{profile.followersCount} followers</span>
                </div>
              )}
              {profile.followingCount !== undefined && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="h-3 w-3" />
                  <span>{profile.followingCount} following</span>
                </div>
              )}
              {profile.engagement && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Heart className="h-3 w-3" />
                  <span>{profile.engagement.toFixed(2)}% engagement</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstagramProfile;
