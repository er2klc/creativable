
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PlatformIndicator } from "./detail/card/PlatformIndicator";

interface LeadSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const LeadSearch = ({ value, onChange }: LeadSearchProps) => {
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  
  const { data: searchResults = [] } = useQuery({
    queryKey: ["lead-search", value],
    queryFn: async () => {
      if (value.length < 2) return [];

      console.log("Searching for:", value);
      
      const { data, error } = await supabase
        .from("leads")
        .select("id, name, platform, social_media_profile_image_url")
        .ilike("name", `%${value}%`)
        .limit(5);

      if (error) {
        console.error("Search error:", error);
        return [];
      }

      return data as Tables<"leads">[];
    },
    enabled: value.length >= 2,
  });

  useEffect(() => {
    setShowResults(value.length >= 2);
  }, [value]);

  const handleResultClick = (leadId: string) => {
    navigate(`/contacts/${leadId}`);
    setShowResults(false);
    onChange("");
  };

  return (
    <div className="relative flex-1">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Suchen..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8"
        onFocus={() => value.length >= 2 && setShowResults(true)}
        onBlur={() => {
          setTimeout(() => setShowResults(false), 200);
        }}
      />
      
      {showResults && searchResults.length > 0 && (
        <Card className="absolute z-[999999] w-full mt-1 max-h-60 overflow-y-auto bg-white shadow-lg rounded-md">
          <div className="p-2 space-y-1">
            {searchResults.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => handleResultClick(lead.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {lead.social_media_profile_image_url ? (
                      <AvatarImage 
                        src={lead.social_media_profile_image_url} 
                        alt={lead.name}
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback>
                        {lead.name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span>{lead.name}</span>
                </div>
                <div className="relative w-8 h-8">
                  <PlatformIndicator platform={lead.platform} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

