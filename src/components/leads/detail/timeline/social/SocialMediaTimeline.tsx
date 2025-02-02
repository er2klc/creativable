import { useState } from "react";
import { SocialMediaPost } from "../../types/lead";
import { formatDateTime } from "../utils/dateUtils";
import { Button } from "@/components/ui/button";

interface SocialMediaTimelineProps {
  posts: SocialMediaPost[];
  onDeletePost: (postId: string) => void;
}

export const SocialMediaTimeline = ({ posts, onDeletePost }: SocialMediaTimelineProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPost, setEditedPost] = useState<SocialMediaPost | null>(null);

  const handleEdit = (post: SocialMediaPost) => {
    setIsEditing(true);
    setEditedPost(post);
  };

  const handleDelete = (postId: string) => {
    onDeletePost(postId);
  };

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="p-4 border rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{post.content}</h3>
            <div className="flex gap-2">
              <Button onClick={() => handleEdit(post)}>Edit</Button>
              <Button variant="outline" onClick={() => handleDelete(post.id)}>Delete</Button>
            </div>
          </div>
          <p className="text-sm text-gray-500">{formatDateTime(post.posted_at)}</p>
        </div>
      ))}
    </div>
  );
};
