import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { AddPartnerDialog } from './AddPartnerDialog';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { UserPlus, User, Plus, CheckCircle, CircleSlash, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PartnerTreeProps {
  unassignedPartners: Tables<'leads'>[];
  currentUser: {
    id: string;
    avatar_url?: string | null;
    display_name?: string | null;
  } | null;
}

interface PartnerWithProfile extends Tables<'leads'> {
  avatar_url?: string | null;
}

const CustomNode = ({ data }: { data: any }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!data.isEmpty && data.id) {
      navigate(`/leads/${data.id}`);
    }
  };

  return (
    <Card 
      className="min-w-[200px] p-4 bg-white/80 backdrop-blur-sm border border-white/20 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center gap-4">
        {data.isEmpty ? (
          <Button 
            variant="ghost" 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            onClick={data.onAdd}
          >
            <Plus className="w-6 h-6" />
          </Button>
        ) : (
          <div className="relative">
            <Avatar className="w-12 h-12">
              {!data.avatar_url && (
                <div className="bg-primary text-primary-foreground w-full h-full rounded-full flex items-center justify-center text-xl font-semibold">
                  {data.name?.substring(0, 2).toUpperCase() || <User className="w-6 h-6" />}
                </div>
              )}
              {data.avatar_url && (
                <img
                  src={data.avatar_url}
                  alt={data.name}
                  className="w-full h-full object-cover rounded-full"
                />
              )}
            </Avatar>
            {data.user_created && (
              <img 
                src="/your-logo.png" 
                alt="Company Logo" 
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full"
              />
            )}
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-semibold">{data.isEmpty ? 'Partner hinzufügen' : data.name}</span>
          {data.network_marketing_id && !data.isEmpty && (
            <span className="text-sm text-gray-500">ID: {data.network_marketing_id}</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export function PartnerTree({ unassignedPartners, currentUser }: PartnerTreeProps) {
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number; parentId: string } | null>(null);
  const [partners, setPartners] = useState<PartnerWithProfile[]>([]);
  const [assignedPartnerIds, setAssignedPartnerIds] = useState<Set<string>>(new Set());

  const createEmptySlot = (id: string, position: { x: number, y: number }, parentId: string) => ({
    id: `empty-${id}`,
    type: 'custom',
    position,
    draggable: false,
    data: {
      isEmpty: true,
      onAdd: () => {
        setSelectedPosition({ ...position, parentId });
        setIsAddingPartner(true);
      }
    },
  });

  const initialNodes: Node[] = [
    {
      id: 'root',
      type: 'custom',
      position: { x: 400, y: 50 },
      draggable: false,
      data: {
        name: currentUser?.display_name || 'Mein Profil',
        avatar_url: currentUser?.avatar_url,
        network_marketing_id: null,
      },
    },
    createEmptySlot('root-left', { x: 200, y: 200 }, 'root'),
    createEmptySlot('root-right', { x: 600, y: 200 }, 'root'),
  ];

  const initialEdges: Edge[] = [
    {
      id: 'root-to-left',
      source: 'root',
      target: 'empty-root-left',
      type: 'smoothstep',
    },
    {
      id: 'root-to-right',
      source: 'root',
      target: 'empty-root-right',
      type: 'smoothstep',
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const nodeTypes = {
    custom: CustomNode,
  };

  const loadPartners = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Get all partners
      const { data: partners, error } = await supabase
        .from('leads')
        .select('*')
        .eq('status', 'partner')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading partners:', error);
        return;
      }

      const transformedPartners = partners?.map(partner => ({
        ...partner,
        avatar_url: null,
        user_created: partner.user_id === user.id
      })) || [];

      setPartners(transformedPartners);

      // Create tree structure for assigned partners
      const newNodes = [...initialNodes];
      const newEdges = [...initialEdges];
      const assignedIds = new Set<string>();

      transformedPartners.forEach((partner) => {
        if (partner.parent_id !== null || partner.parent_id === 'root') {
          assignedIds.add(partner.id);
          const nodeId = `partner-${partner.id}`;
          const level = partner.level || 1;
          
          // Calculate position based on whether it's a left or right child
          const parentNode = partner.parent_id === null ? 
            newNodes.find(n => n.id === 'root') : 
            newNodes.find(n => n.id === `partner-${partner.parent_id}`);

          if (!parentNode) return;

          const parentX = parentNode.position.x;
          const isLeftChild = parentX > 400;
          const baseX = isLeftChild ? parentX - 200 : parentX + 200;
          const y = 200 * level;

          // Add partner node
          newNodes.push({
            id: nodeId,
            type: 'custom',
            position: { x: baseX, y },
            draggable: false,
            data: {
              id: partner.id,
              name: partner.name,
              network_marketing_id: partner.network_marketing_id,
              avatar_url: partner.avatar_url,
              user_created: partner.user_created,
              onboarding_progress: partner.onboarding_progress
            }
          });

          // Add empty slots for this partner
          const leftSlotId = `empty-${nodeId}-left`;
          const rightSlotId = `empty-${nodeId}-right`;

          newNodes.push(
            createEmptySlot(nodeId + '-left', { x: baseX - 200, y: y + 200 }, nodeId),
            createEmptySlot(nodeId + '-right', { x: baseX + 200, y: y + 200 }, nodeId)
          );

          // Add connections
          newEdges.push(
            {
              id: `e-${partner.parent_id}-${nodeId}`,
              source: partner.parent_id === null ? 'root' : `partner-${partner.parent_id}`,
              target: nodeId,
              type: 'smoothstep'
            },
            {
              id: `e-${nodeId}-left`,
              source: nodeId,
              target: leftSlotId,
              type: 'smoothstep'
            },
            {
              id: `e-${nodeId}-right`,
              source: nodeId,
              target: rightSlotId,
              type: 'smoothstep'
            }
          );
        }
      });

      setAssignedPartnerIds(assignedIds);
      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      console.error('Error in loadPartners:', error);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      loadPartners();
    }

    // Set up real-time subscription
    const channel = supabase
      .channel('partner-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `user_id=eq.${currentUser?.id}`
        },
        () => {
          loadPartners(); // Reload partners when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);

  // Filter partners for onboarding status
  const pendingOnboardingPartners = partners.filter(partner => 
    partner.onboarding_progress && 
    Object.values(partner.onboarding_progress).some(value => !value)
  );

  const completedOnboardingPartners = partners.filter(partner => 
    partner.onboarding_progress && 
    Object.values(partner.onboarding_progress).every(value => value)
  );

  // Filter unassigned partners for the lobby
  const lobbyPartners = partners.filter(partner => !assignedPartnerIds.has(partner.id));

  return (
    <div className="space-y-8">
      {/* Onboarding Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CircleSlash className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Onboarding ausstehend ({pendingOnboardingPartners.length})</h3>
          </div>
          <div className="space-y-2">
            {pendingOnboardingPartners.map(partner => (
              <div key={partner.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>{partner.name}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate(`/leads/${partner.id}`)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold">Onboarding abgeschlossen ({completedOnboardingPartners.length})</h3>
          </div>
          <div className="space-y-2">
            {completedOnboardingPartners.map(partner => (
              <div key={partner.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>{partner.name}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate(`/leads/${partner.id}`)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Partner Lobby */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Partner Lobby</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {lobbyPartners.map((partner) => (
            <CustomNode key={partner.id} data={partner} />
          ))}
        </div>
      </div>

      {/* Tree Section */}
      <div className="h-[600px] w-full">
        <div className="w-full h-full border rounded-lg bg-gray-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            nodesDraggable={false}
          >
            <Controls />
            <MiniMap />
            <Background />
          </ReactFlow>
        </div>
      </div>

      <AddPartnerDialog
        open={isAddingPartner}
        onOpenChange={setIsAddingPartner}
        position={selectedPosition}
        availablePartners={lobbyPartners}
      />
    </div>
  );
}