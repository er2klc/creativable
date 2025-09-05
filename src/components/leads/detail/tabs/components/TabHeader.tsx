
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabItem } from "../config/tabsConfig";

interface TabHeaderProps {
  tabItems: TabItem[];
  selectedTab: string;
}

export function TabHeader({ tabItems, selectedTab }: TabHeaderProps) {
  return (
    <div className="w-full">
      <ScrollArea className="w-full">
        <TabsList className="w-full flex border-b">
          {tabItems.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "flex-1 flex items-center justify-center transition-all duration-200 px-4 py-2 rounded-none",
                selectedTab === tab.id 
                  ? "text-foreground border-b-2" 
                  : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
              )}
              style={{
                borderBottomColor: selectedTab === tab.id ? tab.color : 'transparent',
              }}
            >
              <span className="flex items-center justify-center">
                {tab.icon}
              </span>
              {!tab.iconOnly && (
                <span className="ml-2 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px] md:max-w-none">
                  {tab.label}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        <ScrollBar orientation="horizontal" className="h-2.5" />
      </ScrollArea>
    </div>
  );
}
