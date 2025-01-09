import { useState } from "react";
import { Header } from "@/components/landing/Header";
import { VisitorSupportForm } from "@/components/support/VisitorSupportForm";
import { AuthenticatedSupportView } from "@/components/support/AuthenticatedSupportView";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

const Support = () => {
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] text-white">
      <Header isScrolled={true} />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-4">Support</h1>
          <p className="text-gray-400 mb-8">
            Wir sind hier, um Dir zu helfen. Unser Support-Team steht Dir zur Verfügung.
          </p>
          {isAuthenticated ? <AuthenticatedSupportView /> : <VisitorSupportForm />}
        </motion.div>
      </div>
    </div>
  );
};

export default Support;