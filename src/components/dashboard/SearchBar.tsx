import { Search } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PlatformIndicator } from "@/components/leads/detail/card/PlatformIndicator";

export const SearchBar = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (value: string) => {
    if (value.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("leads")
        .select("id, name, platform, social_media_profile_image_url")
        .ilike("name", `%${value}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
      setShowResults(true);
    } catch (error) {
      console.error("Error searching leads:", error);
      setSearchResults([]);
    }
  };

  const handleResultClick = (leadId: string) => {
    navigate(`/contacts/${leadId}`);
    setShowResults(false);
  };

  return (
    <div className="relative mb-8">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Lead suchen..."
        className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => searchResults.length > 0 && setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
      />
      
      {showResults && searchResults.length > 0 && (
        <Card className="absolute w-full mt-1 p-2 bg-background shadow-lg z-50">
          <div className="space-y-1">
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