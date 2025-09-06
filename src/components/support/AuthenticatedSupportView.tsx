import { motion } from "framer-motion";
import { SupportTicketForm } from "./components/SupportTicketForm";
import { SupportTicketList } from "./components/SupportTicketList";

export const AuthenticatedSupportView = () => {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-[#1A1F2C]/60 backdrop-blur-lg border border-white/10 rounded-lg p-6 shadow-xl"
      >
        <h2 className="text-xl font-semibold mb-6">Neues Support-Ticket erstellen</h2>
        <SupportTicketForm />
      </motion.div>
      <SupportTicketList />
    </div>
  );
};