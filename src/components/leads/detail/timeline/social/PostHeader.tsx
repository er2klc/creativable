export interface PostHeaderProps {
  username: string;
  profileImage: string;
  isVerified: boolean;
}

export const PostHeader = ({ username, profileImage, isVerified }: PostHeaderProps) => {
  return (
    <div className="flex items-center space-x-3">
      <img 
        src={profileImage || '/placeholder.svg'} 
        alt={username}
        className="w-10 h-10 rounded-full"
      />
      <div>
        <span className="font-semibold">{username}</span>
        {isVerified && <span className="ml-1">✓</span>}
      </div>
    </div>
  );
};