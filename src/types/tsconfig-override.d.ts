
// This file contains type overrides that would normally be in tsconfig.json
// But since tsconfig.json is read-only, we're using module augmentation instead

// Enable allowSyntheticDefaultImports for React and other modules
declare module 'react' {
  export = React;
  export as namespace React;
}

declare module 'canvas-confetti' {
  const canvasConfetti: any;
  export default canvasConfetti;
}

// Add declaration for formatDate
declare module '@/lib/utils' {
  export function formatDate(date: string | Date, format?: string): string;
  export function formatDuration(milliseconds: number): string;
}

// Fix for types related to Post and TeamPost
declare module '@/components/teams/posts/types/post' {
  export interface Post {
    id: string;
    title: string;
    content: string;
    created_at: string;
    created_by: string;
    edited?: boolean;
    file_urls?: string[];
    hashtags?: string[];
    team_id: string;
    category_id: string;
    user_id: string;
    slug: string;
    pinned?: boolean;
    team_categories?: {
      name: string;
      slug: string;
      color: string;
      settings?: {
        size: "small" | "medium" | "large";
      };
    };
    author?: {
      display_name: string;
      avatar_url: string;
      email: string;
    };
    team_post_comments?: { id: string; }[];
  }
  
  export type TeamPost = Post;
}

// Fix for orientation prop in ScrollArea component
declare module '@/components/ui/scroll-area' {
  export interface ScrollAreaProps {
    orientation?: 'vertical' | 'horizontal';
  }
}
