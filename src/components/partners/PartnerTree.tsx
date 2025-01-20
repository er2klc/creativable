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
import { AddLeadDialog } from '@/components/leads/AddLeadDialog';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Avatar } from '@/components/ui/avatar';

interface PartnerTreeProps {
  unassignedPartners: Tables<'leads'>[];
  currentUser: {
    id: string;
    avatar_url?: string | null;
    display_name?: string | null;
  } | null;
}

const CustomNode = ({ data }: { data: any }) => (
  <div className="bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        {data.avatar_url ? (
          <img src={data.avatar_url} alt={data.name} className="object-cover" />
        ) : (
          <div className="bg-primary h-full w-full flex items-center justify-center text-white font-semibold">
            {data.name?.charAt(0)}
          </div>
        )}
      </Avatar>
      <div>
        <div className="font-semibold">{data.name}</div>
        <div className="text-sm text-gray-500">{data.company_name || 'Kein Unternehmen'}</div>
      </div>
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
        avatar_url: currentUser?.avatar_url,
      },
    },
    // Empty nodes for potential partners
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
    { id: 'e1', source: 'root', target: 'empty-1', type: 'smoothstep' },
    { id: 'e2', source: 'root', target: 'empty-2', type: 'smoothstep' },
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
            <div
              key={partner.id}
              className="bg-white rounded-lg shadow p-3 flex items-center gap-2"
            >
              <Avatar className="h-8 w-8">
                <div className="bg-primary h-full w-full flex items-center justify-center text-white font-semibold">
                  {partner.name.charAt(0)}
                </div>
              </Avatar>
              <div>
                <div className="font-medium">{partner.name}</div>
                <div className="text-sm text-gray-500">
                  {partner.company_name || 'Kein Unternehmen'}
                </div>
              </div>
            </div>
          ))}
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

      {isAddingPartner && (
        <AddLeadDialog
          open={isAddingPartner}
          onOpenChange={setIsAddingPartner}
          defaultPhase="partner"
          trigger={<Button className="hidden">Add Partner</Button>}
        />
      )}
    </div>
  );
}