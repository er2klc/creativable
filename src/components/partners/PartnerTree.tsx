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
import { UserPlus } from 'lucide-react';

interface PartnerTreeProps {
  unassignedPartners: Tables<'leads'>[];
  currentUser: {
    id: string;
    avatar_url?: string | null;
    display_name?: string | null;
  } | null;
}

const CustomNode = ({ data }: { data: any }) => (
  <Card className="min-w-[200px] p-4 bg-white/80 backdrop-blur-sm border border-white/20">
    <div className="flex items-center gap-4">
      <Avatar className="w-12 h-12">
        {!data.avatar_url && (
          <div className="bg-primary text-primary-foreground w-full h-full rounded-full flex items-center justify-center text-xl font-semibold">
            {data.name?.substring(0, 2).toUpperCase()}
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
  const [partners, setPartners] = useState<Tables<'leads'>[]>([]);

  const initialNodes: Node[] = [
    {
      id: 'root',
      type: 'custom',
      position: { x: 400, y: 50 },
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

      // Join with profiles to get avatar_url
      const { data: partners, error } = await supabase
        .from('leads')
        .select(`
          *,
          profile:user_id (
            avatar_url
          )
        `)
        .eq('status', 'partner')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading partners:', error);
        return;
      }

      // Transform the data to include avatar_url at the top level
      const transformedPartners = partners?.map(partner => ({
        ...partner,
        avatar_url: partner.profile?.avatar_url
      })) || [];

      setPartners(transformedPartners);

      const newNodes = [...initialNodes];
      const newEdges = [...edges];

      transformedPartners.forEach((partner, index) => {
        const nodeId = `partner-${partner.id}`;
        const parentId = partner.parent_id || 'root';
        const level = partner.level || 1;
        const position = {
          x: 200 + (index % 2) * 400,
          y: 200 * level
        };

        newNodes.push({
          id: nodeId,
          type: 'custom',
          position,
          data: {
            name: partner.name,
            network_marketing_id: partner.network_marketing_id,
            avatar_url: partner.avatar_url
          }
        });

        newEdges.push({
          id: `e-${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: 'smoothstep'
        });

        ['left', 'right'].forEach((side, sideIndex) => {
          const emptyId = `empty-${nodeId}-${side}`;
          newNodes.push({
            id: emptyId,
            type: 'custom',
            position: {
              x: position.x - 200 + sideIndex * 400,
              y: position.y + 200
            },
            data: {
              isEmpty: true,
              name: '+ Partner hinzufügen',
              parentId: nodeId
            }
          });
        });
      });

      if (partners.length === 0) {
        ['left', 'right'].forEach((side, index) => {
          newNodes.push({
            id: `empty-root-${side}`,
            type: 'custom',
            position: {
              x: 200 + index * 400,
              y: 200
            },
            data: {
              isEmpty: true,
              name: '+ Partner hinzufügen',
              parentId: 'root'
            }
          });
        });
      }

      setNodes(newNodes);
      setEdges(newEdges);
    };

    if (currentUser?.id) {
      loadPartners();
    }
  }, [currentUser?.id]);

  return (
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
        >
          <Controls />
          <MiniMap />
          <Background />
        </ReactFlow>
      </div>

      <AddPartnerDialog
        open={isAddingPartner}
        onOpenChange={setIsAddingPartner}
        position={selectedPosition}
        availablePartners={unassignedPartners}
      />
    </div>
  );
}