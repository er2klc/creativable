import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface NewsListProps {
  teamId: string;
}

export function NewsList({ teamId }: NewsListProps) {
  const { data: news = [], isLoading } = useQuery({
    queryKey: ["team-news", teamId],
    queryFn: async () => {
      const { data: newsData, error } = await supabase
        .from("team_news")
        .select("*")
        .eq("team_id", teamId);

      if (error) throw error;

      // Fetch creator information separately
      const newsWithCreators = await Promise.all(
        newsData.map(async (newsItem) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", newsItem.created_by)
            .single();

          return {
            ...newsItem,
            creator_name: profileData?.display_name
          };
        })
      );

      return newsWithCreators;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!news?.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Noch keine News vorhanden
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {news.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <div className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(item.created_at), {
                addSuffix: true,
                locale: de,
              })}{" "}
              von {item.creator_name || "Unbekannt"}
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{item.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}