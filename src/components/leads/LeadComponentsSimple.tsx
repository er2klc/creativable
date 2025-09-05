// Temporary simplified components to avoid deep type errors
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function LeadContentSimple({ lead }: { lead: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><span className="font-medium">Name:</span> {lead?.name || "N/A"}</p>
          <p><span className="font-medium">Email:</span> {lead?.email || "N/A"}</p>
          <p><span className="font-medium">Platform:</span> {lead?.platform || "N/A"}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function LeadDetailContentSimple({ lead }: { lead: any }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <p className="text-sm text-muted-foreground">{lead?.name || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground">{lead?.email || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <p className="text-sm text-muted-foreground">{lead?.phone_number || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Company</label>
              <p className="text-sm text-muted-foreground">{lead?.company_name || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function LeadDetailHeaderSimple({ lead }: { lead: any }) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3">
        {lead?.social_media_profile_image_url ? (
          <img
            src={lead.social_media_profile_image_url}
            alt={lead.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            {lead?.name?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        <div>
          <h2 className="font-semibold">{lead?.name || "Unknown Lead"}</h2>
          <p className="text-sm text-muted-foreground">{lead?.platform || "No platform"}</p>
        </div>
      </div>
      <Badge variant="outline">{lead?.status || "Active"}</Badge>
    </div>
  );
}