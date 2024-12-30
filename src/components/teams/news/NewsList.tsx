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
      const { data, error } = await supabase
        .from("team_news")
        .select(`
          *,
          profiles (
            display_name
          )
        `)
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
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
              von {item.profiles?.display_name}
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