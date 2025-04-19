
import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  ColumnDef
} from "@tanstack/react-table";
import { Tables } from "@/integrations/supabase/types";

interface LeadTableViewProps {
  leads: Tables<"leads">[];
  onLeadClick?: (id: string) => void;
  selectedPipelineId?: string | null;
}

export const LeadTableView = ({ leads, onLeadClick }: LeadTableViewProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<Tables<"leads">>[] = [
    {
      accessorKey: "name",
      header: "Name"
    },
    {
      accessorKey: "platform",
      header: "Platform"
    },
    {
      accessorKey: "status",
      header: "Status"
    }
  ];

  const table = useReactTable({
    data: leads,
    columns,
    state: {
      sorting
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <div className="p-4">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="text-left p-2">
                  {header.column.columnDef.header as string}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr 
              key={row.id} 
              onClick={() => onLeadClick && onLeadClick(row.original.id)}
              className="cursor-pointer hover:bg-gray-50"
            >
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="p-2">
                  {cell.getValue() as string}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
