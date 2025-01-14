import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamAdminListProps {
  admins: any[];
}

export function TeamAdminList({ admins }: TeamAdminListProps) {
  return (
    <div className="mt-4 space-y-4">
      {admins?.filter(admin => ['admin', 'owner'].includes(admin.role)).map((admin) => (
        <div key={admin.id} className="flex items-center justify-between p-2 border rounded">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={admin.profiles?.avatar_url} alt={admin.profiles?.display_name || 'Avatar'} />
              <AvatarFallback>
                {admin.profiles?.display_name?.substring(0, 2).toUpperCase() || '??'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {admin.profiles?.display_name || 'Unbekannter Benutzer'}
              </span>
              <Badge variant={admin.role === 'owner' ? 'default' : 'secondary'} className="mt-1">
                {admin.role === 'owner' ? 'Owner' : 'Admin'}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}