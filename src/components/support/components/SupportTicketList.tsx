import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export const SupportTicketList = () => {
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (!tickets || tickets.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-[#1A1F2C]/60 backdrop-blur-lg border border-white/10 rounded-lg p-6 shadow-xl"
    >
      <h2 className="text-xl font-semibold mb-6">Deine Support-Tickets</h2>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="p-4 rounded-lg bg-[#0A0A0A]/60 border border-white/10"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{ticket.subject}</h3>
                <p className="text-sm text-gray-400 mt-1">{ticket.message}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                ticket.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
                ticket.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {ticket.status === 'open' ? 'Offen' :
                 ticket.status === 'in_progress' ? 'In Bearbeitung' :
                 'Geschlossen'}
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {new Date(ticket.created_at).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};