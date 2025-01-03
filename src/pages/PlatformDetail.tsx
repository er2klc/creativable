import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, FileText, Video, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const PlatformDetail = () => {
  const { moduleSlug } = useParams();
  const user = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");

  const { data: platform, isLoading } = useQuery({
    queryKey: ['platform', moduleSlug],
    queryFn: async () => {
      console.log('Fetching platform data for slug:', moduleSlug);
      
      const { data, error } = await supabase
        .from('elevate_platforms')
        .select(`
          *,
          elevate_modules!elevate_modules_platform_id_fkey (
            id,
            title,
            description,
            elevate_lerninhalte!elevate_lerninhalte_module_id_fkey (
              id,
              title,
              description,
              video_url,
              submodule_order
            )
          )
        `)
        .eq('slug', moduleSlug)
        .maybeSingle();

      if (error) {
        console.error('Error fetching platform:', error);
        throw error;
      }
      
      console.log('Fetched platform data:', data);
      return data;
    },
    enabled: !!moduleSlug && !!user
  });

  const { data: userProgress } = useQuery({
    queryKey: ['userProgress', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('elevate_user_progress')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const handleCreateLerneinheit = async () => {
    if (!user || !platform?.elevate_modules?.[0]?.id) return;

    try {
      const { error } = await supabase
        .from('elevate_lerninhalte')
        .insert({
          module_id: platform.elevate_modules[0].id,
          title: newTitle,
          description: newDescription,
          video_url: newVideoUrl,
          created_by: user.id,
          submodule_order: sortedSubmodules.length
        });

      if (error) throw error;

      toast.success("Neue Lerneinheit erfolgreich erstellt");
      setIsDialogOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewVideoUrl("");
    } catch (error) {
      console.error('Error creating Lerneinheit:', error);
      toast.error("Fehler beim Erstellen der Lerneinheit");
    }
  };

  const markAsCompleted = async (lerninhalteId: string) => {
    try {
      const { error } = await supabase
        .from('elevate_user_progress')
        .upsert({
          user_id: user?.id,
          lerninhalte_id: lerninhalteId,
          completed: true,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success("Lerneinheit als erledigt markiert");
    } catch (error) {
      console.error('Error marking as completed:', error);
      toast.error("Fehler beim Markieren als erledigt");
    }
  };

  const isAdmin = platform?.created_by === user?.id;

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!platform) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Modul nicht gefunden</h1>
          <p className="mt-2 text-gray-600">
            Das von Ihnen gesuchte Modul konnte nicht gefunden werden.
          </p>
        </div>
      </div>
    );
  }

  const sortedSubmodules = platform.elevate_modules
    ?.flatMap(module => module.elevate_lerninhalte || [])
    .sort((a, b) => (a.submodule_order || 0) - (b.submodule_order || 0)) || [];

  const isCompleted = (lerninhalteId: string) => {
    return userProgress?.some(
      progress => progress.lerninhalte_id === lerninhalteId && progress.completed
    );
  };

  const completedCount = sortedSubmodules.filter(submodule => 
    isCompleted(submodule.id)
  ).length;

  const progressPercentage = sortedSubmodules.length > 0
    ? (completedCount / sortedSubmodules.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex justify-between items-start gap-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {platform.name}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                {platform.description}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-md">
                  <Progress value={progressPercentage} className="h-3" />
                </div>
                <span className="text-sm font-medium">
                  {completedCount} von {sortedSubmodules.length} abgeschlossen
                </span>
              </div>
            </div>
            {isAdmin && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Neue Lerneinheit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Neue Lerneinheit erstellen</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Titel</label>
                      <Input
                        placeholder="Titel der Lerneinheit"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Beschreibung</label>
                      <Textarea
                        placeholder="Beschreibung der Lerneinheit"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Video URL</label>
                      <Input
                        placeholder="https://youtube.com/..."
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateLerneinheit}>
                      Lerneinheit erstellen
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Content Section */}
        {sortedSubmodules.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-2">Keine Lerneinheiten verfügbar</h3>
            <p className="text-muted-foreground">
              Für dieses Modul wurden noch keine Lerneinheiten erstellt.
            </p>
          </div>
        ) : (
          <Tabs defaultValue={sortedSubmodules[0]?.id} className="w-full">
            <TabsList className="w-full justify-start bg-white p-1 rounded-lg mb-6">
              {sortedSubmodules.map((submodule, index) => (
                <TabsTrigger 
                  key={submodule.id} 
                  value={submodule.id}
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative py-2 px-4"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10">
                      {index + 1}
                    </span>
                    {submodule.title}
                  </span>
                  {isCompleted(submodule.id) && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            {sortedSubmodules.map((submodule) => (
              <TabsContent key={submodule.id} value={submodule.id}>
                <div className="bg-white p-8 rounded-xl shadow-sm space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{submodule.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {submodule.video_url && (
                          <span className="flex items-center gap-1">
                            <Video className="h-4 w-4" />
                            Video verfügbar
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          ~15 Minuten
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          Lernmaterial
                        </span>
                      </div>
                    </div>
                    <Button
                      variant={isCompleted(submodule.id) ? "secondary" : "default"}
                      onClick={() => markAsCompleted(submodule.id)}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {isCompleted(submodule.id) ? "Erledigt" : "Als erledigt markieren"}
                    </Button>
                  </div>
                  
                  {submodule.video_url && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-black">
                      <iframe
                        src={submodule.video_url.replace('watch?v=', 'embed/')}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  )}
                  
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {submodule.description}
                    </p>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default PlatformDetail;