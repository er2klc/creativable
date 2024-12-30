import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface NewsListProps {
  teamId: string;
}

export function NewsList({ teamId }: NewsListProps) {
  const { data: news = [] } = useQuery({
    queryKey: ["team-news", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_news")
        .select(`
          *,
          profiles:created_by (
            display_name
          )
        `)
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (news.length === 0) {
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
            <CardTitle>{item.title}</CardTitle>
            <div className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(item.created_at), {
                addSuffix: true,
                locale: de,
              })}{" "}
              von {item.profiles?.display_name}
            </div>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: item.content }} 
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}