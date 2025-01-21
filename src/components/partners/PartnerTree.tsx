import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Edge,
  Node,
} from '@xyflow/react';
import "@xyflow/react/dist/style.css";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { Tables } from "@/integrations/supabase/types";

interface Partner extends Tables<"leads"> {
  level?: number;
  parent_id?: string | null;
}

const nodeTypes = {
  custom: ({ data }: { data: any }) => (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          {data.avatar_url ? (
            <img
              src={data.avatar_url}
              alt={data.name}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {data.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          )}
        </div>
        <div>
          <h3 className="font-semibold">{data.name}</h3>
          <p className="text-sm text-gray-500">{data.level ? `Level ${data.level}` : ''}</p>
        </div>
      </div>
    </div>
  ),
};

export function PartnerTree() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const user = useUser();

  const buildTreeData = useCallback((partners: Partner[]) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const levelWidth = 300;
    const levelHeight = 150;

    partners.forEach((partner) => {
      const level = partner.level || 0;
      const partnersAtLevel = partners.filter((p) => p.level === level);
      const indexAtLevel = partnersAtLevel.findIndex((p) => p.id === partner.id);
      const totalAtLevel = partnersAtLevel.length;

      const xOffset = (indexAtLevel - (totalAtLevel - 1) / 2) * levelWidth;
      const yOffset = level * levelHeight;

      nodes.push({
        id: partner.id,
        position: { x: xOffset, y: yOffset },
        data: partner,
        type: "custom",
      });

      if (partner.parent_id) {
        edges.push({
          id: `${partner.parent_id}-${partner.id}`,
          source: partner.parent_id,
          target: partner.id,
          type: "smoothstep",
        });
      }
    });

    return { nodes, edges };
  }, []);

  useEffect(() => {
    const fetchPartners = async () => {
      if (!user) return;

      const { data: partners, error } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching partners:", error);
        return;
      }

      // Add level information
      const partnersWithLevels = partners.map((partner: Partner) => {
        const level = partner.parent_id ? 1 : 0;
        return { ...partner, level };
      });

      const { nodes: newNodes, edges: newEdges } = buildTreeData(partnersWithLevels);
      setNodes(newNodes);
      setEdges(newEdges);
    };

    fetchPartners();
  }, [user, buildTreeData]);

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}