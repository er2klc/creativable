import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
}

interface RecentUsersTableProps {
  recentUsers: UserProfile[];
}

export const RecentUsersTable = ({ recentUsers }: RecentUsersTableProps) => {
  return (
    <Card className="bg-black/40 border-none shadow-lg backdrop-blur-md mb-8">
      <CardHeader>
        <CardTitle className="text-white">Neue Benutzer</CardTitle>
        <CardDescription className="text-gray-300">
          Die letzten 5 registrierten Benutzer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-white/10">
                <th className="p-4 text-gray-300">Name</th>
                <th className="p-4 text-gray-300">Email</th>
                <th className="p-4 text-gray-300">Registriert am</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id} className="border-b border-white/10">
                  <td className="p-4 text-gray-200">{user.display_name || 'N/A'}</td>
                  <td className="p-4 text-gray-200">{user.email}</td>
                  <td className="p-4 text-gray-200">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};