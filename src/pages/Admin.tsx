import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmbeddingsManager } from "@/components/dashboard/EmbeddingsManager";

const Admin = () => {
  const navigate = useNavigate();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [changelogTitle, setChangelogTitle] = useState("");
  const [changelogDescription, setChangelogDescription] = useState("");
  const [changelogVersion, setChangelogVersion] = useState("");
  const [changelogStatus, setChangelogStatus] = useState<"completed" | "in-progress" | "planned">("planned");

  useEffect(() => {
    checkSuperAdminStatus();
  }, []);

  const checkSuperAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_super_admin) {
      navigate("/dashboard");
      return;
    }

    setIsSuperAdmin(true);
  };

  const processAllData = async () => {
    try {
      setIsProcessing(true);
      const { error } = await supabase.functions.invoke('manage-embeddings', {
        body: { processAll: true }
      });

      if (error) throw error;
      toast.success("Data processing started successfully");
    } catch (error) {
      console.error("Error processing data:", error);
      toast.error("Error processing data");
    } finally {
      setIsProcessing(false);
    }
  };

  const addChangelogEntry = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("changelog_entries")
        .insert({
          version: changelogVersion,
          title: changelogTitle,
          description: changelogDescription,
          status: changelogStatus,
          created_by: user.id
        });

      if (error) throw error;

      toast.success("Changelog entry added successfully");
      setChangelogTitle("");
      setChangelogDescription("");
      setChangelogVersion("");
      setChangelogStatus("planned");
    } catch (error) {
      console.error("Error adding changelog entry:", error);
      toast.error("Error adding changelog entry");
    }
  };

  if (!isSuperAdmin) return null;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>
      
      <Tabs defaultValue="data">
        <TabsList>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="changelog">Changelog</TabsTrigger>
        </TabsList>

        <TabsContent value="data">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Processing</CardTitle>
                <CardDescription>
                  Process all data across the platform including teams, platforms, and user content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={processAllData} 
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Process All Data"}
                </Button>
              </CardContent>
            </Card>

            <EmbeddingsManager />
          </div>
        </TabsContent>

        <TabsContent value="changelog">
          <Card>
            <CardHeader>
              <CardTitle>Add Changelog Entry</CardTitle>
              <CardDescription>
                Create a new changelog entry to keep users informed about updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Version</label>
                  <Input
                    placeholder="e.g. 1.0.0"
                    value={changelogVersion}
                    onChange={(e) => setChangelogVersion(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={changelogStatus}
                    onValueChange={(value: "completed" | "in-progress" | "planned") => 
                      setChangelogStatus(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Feature or update title"
                  value={changelogTitle}
                  onChange={(e) => setChangelogTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Detailed description of the changes"
                  value={changelogDescription}
                  onChange={(e) => setChangelogDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <Button 
                onClick={addChangelogEntry}
                disabled={!changelogTitle || !changelogDescription || !changelogVersion}
              >
                Add Entry
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;