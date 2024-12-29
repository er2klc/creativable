import { Badge } from "@/components/ui/badge";

interface TeamAdminListProps {
  admins: any[];
}

export function TeamAdminList({ admins }: TeamAdminListProps) {
  return (
    <div className="mt-4 space-y-4">
      {admins?.filter(admin => ['admin', 'owner'].includes(admin.role)).map((admin) => (
        <div key={admin.id} className="flex items-center justify-between p-2 border rounded">
          <div className="flex items-center gap-2">
            <Badge variant={admin.role === 'owner' ? 'default' : 'secondary'}>
              {admin.role === 'owner' ? 'Owner' : 'Admin'}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}