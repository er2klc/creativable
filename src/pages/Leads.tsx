import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  MoreVertical,
  Star,
  Grid,
  List,
  Plus,
} from "lucide-react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Lead = Tables<"leads">;
type ViewMode = "table" | "kanban";

const LeadsPage = () => {
  const session = useSession();
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads", session?.user.id],
    queryFn: async () => {
      let query = supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      if (selectedPhase) {
        query = query.eq("phase", selectedPhase);
      }

      if (selectedPlatform) {
        query = query.eq("platform", selectedPlatform);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching leads:", error);
        return [];
      }

      return data as Lead[];
    },
    enabled: !!session?.user.id,
  });

  const TableView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[30px]"></TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Plattform</TableHead>
          <TableHead>Phase</TableHead>
          <TableHead>Letzte Aktion</TableHead>
          <TableHead>Branche</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow key={lead.id}>
            <TableCell>
              <Button variant="ghost" size="icon" className="h-4 w-4">
                <Star className="h-4 w-4" />
              </Button>
            </TableCell>
            <TableCell className="font-medium">{lead.name}</TableCell>
            <TableCell>{lead.platform}</TableCell>
            <TableCell>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  lead.phase === "initial_contact"
                    ? "bg-yellow-100 text-yellow-800"
                    : lead.phase === "follow_up"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {lead.phase === "initial_contact"
                  ? "Erstkontakt"
                  : lead.phase === "follow_up"
                  ? "Follow-up"
                  : "Abschluss"}
              </span>
            </TableCell>
            <TableCell>
              {lead.last_action_date
                ? new Date(lead.last_action_date).toLocaleDateString()
                : "-"}
            </TableCell>
            <TableCell>{lead.industry}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Details anzeigen</DropdownMenuItem>
                  <DropdownMenuItem>Nachricht senden</DropdownMenuItem>
                  <DropdownMenuItem>Phase ändern</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Löschen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const KanbanView = () => (
    <div className="grid grid-cols-3 gap-4">
      {["initial_contact", "follow_up", "closed"].map((phase) => (
        <div
          key={phase}
          className="bg-muted/50 p-4 rounded-lg"
        >
          <h3 className="font-medium mb-4">
            {phase === "initial_contact"
              ? "Erstkontakt"
              : phase === "follow_up"
              ? "Follow-up"
              : "Abschluss"}
          </h3>
          <div className="space-y-2">
            {leads
              .filter((lead) => lead.phase === phase)
              .map((lead) => (
                <div
                  key={lead.id}
                  className="bg-background p-4 rounded-lg shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{lead.name}</span>
                    <Button variant="ghost" size="icon" className="h-4 w-4">
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {lead.platform} · {lead.industry}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Leads</h1>
        <div className="flex items-center gap-4">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("table")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "kanban" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("kanban")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Lead
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Lead suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onClick={() => setSelectedPhase(null)}>
              Alle Phasen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedPhase("initial_contact")}>
              Erstkontakt
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedPhase("follow_up")}>
              Follow-up
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedPhase("closed")}>
              Abschluss
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : viewMode === "table" ? (
        <TableView />
      ) : (
        <KanbanView />
      )}
    </div>
  );
};

export default LeadsPage;