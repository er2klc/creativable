
export interface PostActivity {
  id: string;
  title: string;
  content: string;
  created_at: string;
  file_urls: string[] | null;
  type: 'post';
  category: {
    name: string;
    color: string;
  };
  reactions_count: number;
  comments_count: number;
  slug: string;
}

export interface CommentActivity {
  id: string;
  content: string;
  created_at: string;
  type: 'comment';
  post: {
    title: string;
    slug: string;
    category: {
      name: string;
      color: string;
    };
  };
}

export type Activity = PostActivity | CommentActivity;
