import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Bell, Calendar, FolderOpen } from "lucide-react";

interface TeamTabsProps {
  children: React.ReactNode;
  defaultValue?: string;
}

export function TeamTabs({ children, defaultValue = "posts" }: TeamTabsProps) {
  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList className="w-full justify-start bg-transparent space-x-2">
        <TabsTrigger 
          value="posts" 
          className="data-[state=active]:bg-primary/10 rounded-xl p-3 h-auto flex flex-col items-center gap-1"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs">Beiträge</span>
        </TabsTrigger>
        <TabsTrigger 
          value="news" 
          className="data-[state=active]:bg-primary/10 rounded-xl p-3 h-auto flex flex-col items-center gap-1"
        >
          <Bell className="h-5 w-5" />
          <span className="text-xs">News</span>
        </TabsTrigger>
        <TabsTrigger 
          value="calendar" 
          className="data-[state=active]:bg-primary/10 rounded-xl p-3 h-auto flex flex-col items-center gap-1"
        >
          <Calendar className="h-5 w-5" />
          <span className="text-xs">Kalender</span>
        </TabsTrigger>
        <TabsTrigger 
          value="files" 
          className="data-[state=active]:bg-primary/10 rounded-xl p-3 h-auto flex flex-col items-center gap-1"
        >
          <FolderOpen className="h-5 w-5" />
          <span className="text-xs">Dateien</span>
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}