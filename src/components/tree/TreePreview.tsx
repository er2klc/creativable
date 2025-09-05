import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LinkTypeIcon, type LinkType } from "./LinkTypeIcon";
import { TreeLink } from "@/pages/TreeGenerator";
import { cn } from "@/lib/utils";

interface TreePreviewProps {
  username: string;
  avatarUrl: string | null;
  bio?: string | null;
  links: TreeLink[];
}

export const TreePreview = ({ username, avatarUrl, bio, links }: TreePreviewProps) => {
  const getLinkType = (url: string): LinkType | null => {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('facebook.com')) return 'facebook';
    if (urlLower.includes('instagram.com')) return 'instagram';
    if (urlLower.includes('linkedin.com')) return 'linkedin';
    if (urlLower.includes('youtube.com')) return 'youtube';
    if (urlLower.includes('twitter.com')) return 'twitter';
    if (urlLower.includes('mailto:')) return 'email';
    if (urlLower.includes('tel:')) return 'phone';
    if (urlLower.includes('spotify.com') || urlLower.includes('apple.music')) return 'music';
    if (urlLower.includes('tiktok.com')) return 'video';
    if (urlLower.includes('amazon.com') || urlLower.includes('shop')) return 'shop';
    if (urlLower.includes('calendar') || urlLower.includes('meet')) return 'calendar';
    return null;
  };

  return (
    <div className="h-full w-full bg-[#0A0A0A] flex items-center justify-center p-4">
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-yellow-500/10 to-blue-500/20 opacity-30" />
      
      {/* Logo Background Blur - Now matches parent height */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 h-full">
        <img 
          src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" 
          alt="Background Logo" 
          className="w-[800px] h-[800px] blur-3xl"
        />
      </div>

      <Card className="relative w-full max-w-[450px] mx-auto bg-[#1A1F2C]/60 border-white/10 shadow-lg backdrop-blur-sm p-6">
        <div className="flex flex-col items-center space-y-6">
          {avatarUrl && (
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20">
              <img 
                src={avatarUrl} 
                alt={username} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="text-center">
            <h2 className="text-xl font-medium text-white">@{username}</h2>
            <div className="h-[1px] w-32 mx-auto mt-2 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          </div>
          
          {bio && (
            <p className="text-white/80 text-center max-w-sm">{bio}</p>
          )}
          
          <div className="w-full space-y-4">
            {links.map((link, index) => {
              const linkType = getLinkType(link.url);
              return (
                <a
                  key={link.id || index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full bg-white/10 hover:bg-white/20 text-white border border-white/20",
                      "flex items-center gap-2 relative transition-all duration-300",
                      "after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full",
                      "after:bg-gradient-to-r after:from-red-500 after:via-yellow-500 after:to-blue-500"
                    )}
                  >
                    {linkType && <LinkTypeIcon type={linkType} className="h-4 w-4" />}
                    {link.title}
                  </Button>
                </a>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};