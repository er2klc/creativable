import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LeadWithRelations } from "@/types/leads";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useSettings } from "@/hooks/use-settings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LeadTableViewProps {
  leads: LeadWithRelations[];
  onLeadClick: (id: string) => void;
  selectedPipelineId: string | null;
}

export const LeadTableView = ({
  leads,
  onLeadClick,
  selectedPipelineId,
}: LeadTableViewProps) => {
  const { settings } = useSettings();

  const columns: ColumnDef<LeadWithRelations>[] = [
    {
      accessorKey: "name",
      header: () => <TableHeaderCell>Name</TableHeaderCell>,
      cell: ({ row }) => (
        <TableRowCell>
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Link
              to={`/contacts/${row.original.id}`}
              className="font-medium hover:underline"
            >
              {row.getValue("name")}
            </Link>
          </div>
        </TableRowCell>
      ),
    },
    {
      accessorKey: "platform",
      header: () => <TableHeaderCell>Platform</TableHeaderCell>,
      cell: ({ row }) => <TableRowCell>{row.getValue("platform")}</TableRowCell>,
    },
    {
      accessorKey: "industry",
      header: () => <TableHeaderCell>Industry</TableHeaderCell>,
      cell: ({ row }) => <TableRowCell>{row.getValue("industry")}</TableRowCell>,
    },
    {
      accessorKey: "email",
      header: () => <TableHeaderCell>Email</TableHeaderCell>,
      cell: ({ row }) => <TableRowCell>{row.getValue("email")}</TableRowCell>,
    },
    {
      accessorKey: "phone_number",
      header: () => <TableHeaderCell>Phone Number</TableHeaderCell>,
      cell: ({ row }) => <TableRowCell>{row.getValue("phone_number")}</TableRowCell>,
    },
  ];

  const table = useReactTable({
    data: leads,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {settings?.language === "en" ? "Contacts" : "Kontakte"}
        </CardTitle>
        <CardDescription>
          {settings?.language === "en"
            ? "All your contacts in one place."
            : "Alle deine Kontakte an einem Ort."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow
                  key={lead.id}
                  onClick={() => onLeadClick(lead.id)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  {columns.map((column) => (
                    <TableCell key={column.accessorKey as string}>
                      {lead[column.accessorKey as keyof LeadWithRelations]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const TableHeaderCell = ({ children }: { children: React.ReactNode }) => {
  return <div className="font-medium text-left">{children}</div>;
};

const TableRowCell = ({ children }: { children: React.ReactNode }) => {
  return <div className="text-left">{children}</div>;
};
