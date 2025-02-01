import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface PostMetadataProps {
  likesCount: number;
  commentsCount: number;
  timestamp: string;
  platform: string;
}

export const PostMetadata = ({ likesCount, commentsCount, timestamp, platform }: PostMetadataProps) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span>{platform}</span>
        <span>{likesCount} Likes | {commentsCount} Comments</span>
      </CardTitle>
      <CardContent>
        <span>{new Date(timestamp).toLocaleString()}</span>
      </CardContent>
    </CardHeader>
  );
};
