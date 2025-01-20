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
  Position,
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
  <div className="bg-white rounded-full shadow-lg p-4 min-w-[100px] min-h-[100px] flex items-center justify-center">
    <div className="text-center">
      <div className="font-semibold">{data.name}</div>
      {data.network_marketing_id && (
        <div className="text-sm text-gray-500">ID: {data.network_marketing_id}</div>
      )}
    </div>
  </div>
);

export function PartnerTree({ unassignedPartners, currentUser }: PartnerTreeProps) {
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number } | null>(null);

  const initialNodes: Node[] = [
    {
      id: 'root',
      type: 'custom',
      position: { x: 400, y: 50 },
      data: {
        name: currentUser?.display_name || 'Mein Profil',
        network_marketing_id: null,
      },
    },
    {
      id: 'empty-1',
      type: 'custom',
      position: { x: 200, y: 200 },
      data: { isEmpty: true, name: '+ Partner hinzufügen' },
    },
    {
      id: 'empty-2',
      type: 'custom',
      position: { x: 600, y: 200 },
      data: { isEmpty: true, name: '+ Partner hinzufügen' },
    },
  ];

  const initialEdges: Edge[] = [
    { 
      id: 'e1', 
      source: 'root', 
      target: 'empty-1', 
      type: 'smoothstep',
      style: { stroke: '#999' }
    },
    { 
      id: 'e2', 
      source: 'root', 
      target: 'empty-2', 
      type: 'smoothstep',
      style: { stroke: '#999' }
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

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    if (node.data.isEmpty) {
      setSelectedPosition(node.position);
      setIsAddingPartner(true);
    }
  };

  return (
    <div className="h-[600px] w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Nicht zugeordnete Partner:</h3>
        <div className="flex flex-wrap gap-4">
          {unassignedPartners.map((partner) => (
            <Card
              key={partner.id}
              className="p-4 flex flex-col items-center gap-2 w-[200px]"
            >
              <Avatar className="w-16 h-16">
                {!partner.avatar_url && (
                  <div className="bg-primary text-primary-foreground w-full h-full rounded-full flex items-center justify-center text-xl font-semibold">
                    {partner.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                {partner.avatar_url && (
                  <img
                    src={partner.avatar_url}
                    alt={partner.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                )}
              </Avatar>
              <div className="text-center">
                <div className="font-semibold">{partner.name}</div>
                {partner.network_marketing_id && (
                  <div className="text-sm text-gray-500">
                    ID: {partner.network_marketing_id}
                  </div>
                )}
              </div>
            </Card>
          ))}
          <Card
            className="p-4 flex flex-col items-center justify-center gap-2 w-[200px] h-[160px] cursor-pointer hover:bg-accent transition-colors"
            onClick={() => setIsAddingPartner(true)}
          >
            <UserPlus className="w-8 h-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Partner hinzufügen</span>
          </Card>
        </div>
      </div>

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
      />
    </div>
  );
}