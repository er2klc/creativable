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
import { UserPlus, User } from 'lucide-react';

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

const CustomNode = ({ data }: { data: any }) => (
  <Card className="min-w-[200px] p-4 bg-white/80 backdrop-blur-sm border border-white/20">
    <div className="flex items-center gap-4">
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
      <div className="flex flex-col">
        <span className="font-semibold">{data.name}</span>
        {data.network_marketing_id && (
          <span className="text-sm text-gray-500">ID: {data.network_marketing_id}</span>
        )}
      </div>
    </div>
  </Card>
);

export function PartnerTree({ unassignedPartners, currentUser }: PartnerTreeProps) {
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number; parentId: string } | null>(null);
  const [partners, setPartners] = useState<PartnerWithProfile[]>([]);
  const [assignedPartnerIds, setAssignedPartnerIds] = useState<Set<string>>(new Set());

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
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const nodeTypes = {
    custom: CustomNode,
  };

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    if (node.data.isEmpty) {
      setSelectedPosition({
        x: node.position.x,
        y: node.position.y,
        parentId: node.id.replace('empty-', '')
      });
      setIsAddingPartner(true);
    }
  };

  useEffect(() => {
    const loadPartners = async () => {
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

      // Transform partners to include avatar_url
      const transformedPartners = partners?.map(partner => ({
        ...partner,
        avatar_url: null // We'll implement profile avatars in a future update
      })) || [];

      setPartners(transformedPartners);

      // Create tree structure for assigned partners
      const newNodes = [...initialNodes];
      const newEdges = [...edges];
      const assignedIds = new Set<string>();

      transformedPartners.forEach((partner) => {
        if (partner.parent_id) {
          assignedIds.add(partner.id);
          const nodeId = `partner-${partner.id}`;
          const level = partner.level || 1;
          const position = {
            x: 200 + (level % 2) * 400,
            y: 200 * level
          };

          newNodes.push({
            id: nodeId,
            type: 'custom',
            position,
            draggable: false,
            data: {
              name: partner.name,
              network_marketing_id: partner.network_marketing_id,
              avatar_url: partner.avatar_url
            }
          });

          // Add connection to parent
          newEdges.push({
            id: `e-${partner.parent_id}-${nodeId}`,
            source: partner.parent_id === 'root' ? 'root' : `partner-${partner.parent_id}`,
            target: nodeId,
            type: 'smoothstep'
          });

          // Add empty slots for potential children
          ['left', 'right'].forEach((side, sideIndex) => {
            const emptyId = `empty-${nodeId}-${side}`;
            newNodes.push({
              id: emptyId,
              type: 'custom',
              position: {
                x: position.x - 200 + sideIndex * 400,
                y: position.y + 200
              },
              draggable: false,
              data: {
                isEmpty: true,
                name: '+ Partner hinzufügen',
                parentId: nodeId
              }
            });
          });
        }
      });

      setAssignedPartnerIds(assignedIds);
      setNodes(newNodes);
      setEdges(newEdges);
    };

    if (currentUser?.id) {
      loadPartners();
    }
  }, [currentUser?.id]);

  // Filter unassigned partners for the lobby
  const lobbyPartners = partners.filter(partner => !assignedPartnerIds.has(partner.id));

  return (
    <div className="space-y-8">
      {/* Lobby Section */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Partner Lobby</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            onNodeClick={handleNodeClick}
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