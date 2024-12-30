import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Bell, Calendar, FolderOpen } from "lucide-react";

interface TeamTabsProps {
  children: React.ReactNode;
  defaultValue?: string;
}

export function TeamTabs({ children, defaultValue = "posts" }: TeamTabsProps) {
  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList className="w-full justify-start bg-transparent space-x-4">
        <TabsTrigger 
          value="posts" 
          className="data-[state=active]:bg-primary/10 rounded-2xl p-4 h-16 w-16 flex flex-col items-center gap-1 hover:bg-accent transition-colors"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="text-xs">Beiträge</span>
        </TabsTrigger>
        <TabsTrigger 
          value="news" 
          className="data-[state=active]:bg-primary/10 rounded-2xl p-4 h-16 w-16 flex flex-col items-center gap-1 hover:bg-accent transition-colors"
        >
          <Bell className="h-6 w-6" />
          <span className="text-xs">News</span>
        </TabsTrigger>
        <TabsTrigger 
          value="calendar" 
          className="data-[state=active]:bg-primary/10 rounded-2xl p-4 h-16 w-16 flex flex-col items-center gap-1 hover:bg-accent transition-colors"
        >
          <Calendar className="h-6 w-6" />
          <span className="text-xs">Kalender</span>
        </TabsTrigger>
        <TabsTrigger 
          value="files" 
          className="data-[state=active]:bg-primary/10 rounded-2xl p-4 h-16 w-16 flex flex-col items-center gap-1 hover:bg-accent transition-colors"
        >
          <FolderOpen className="h-6 w-6" />
          <span className="text-xs">Dateien</span>
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}