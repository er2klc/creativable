import { List, Mail, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChangelogForm } from "./changelog/ChangelogForm";

export const AdminTabs = () => {
  return (
    <Tabs defaultValue="changelog" className="space-y-4">
      <TabsList className="bg-black/40 border-none backdrop-blur-md">
        <TabsTrigger value="changelog" className="text-white data-[state=active]:bg-white/10">
          <List className="h-4 w-4 mr-2" />
          Changelog
        </TabsTrigger>
        <TabsTrigger value="newsletter" className="text-white data-[state=active]:bg-white/10">
          <Mail className="h-4 w-4 mr-2" />
          Newsletter
        </TabsTrigger>
        <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-white/10">
          <Bell className="h-4 w-4 mr-2" />
          Benachrichtigungen
        </TabsTrigger>
      </TabsList>

      <TabsContent value="changelog">
        <ChangelogForm />
      </TabsContent>

      <TabsContent value="newsletter">
        <Card className="bg-black/40 border-none shadow-lg backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Newsletter</CardTitle>
            <CardDescription className="text-gray-300">
              Diese Funktion wird in Kürze verfügbar sein
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card className="bg-black/40 border-none shadow-lg backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Benachrichtigungen</CardTitle>
            <CardDescription className="text-gray-300">
              Diese Funktion wird in Kürze verfügbar sein
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>
    </Tabs>
  );
};