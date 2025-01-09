import { useState } from "react";
import { Header } from "@/components/landing/Header";
import { VisitorSupportForm } from "@/components/support/VisitorSupportForm";
import { AuthenticatedSupportView } from "@/components/support/AuthenticatedSupportView";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Support = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
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
          <h1 className="text-4xl font-bold mb-4">Kontakt</h1>
          <p className="text-gray-400 mb-8">
            Wir sind hier, um Dir zu helfen. Unser Support-Team steht Dir zur Verfügung.
          </p>
          <VisitorSupportForm />
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative w-full bg-[#111111] py-16">
        {/* Footer Separator Line */}
        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-gray-500/30 to-transparent" />
        
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <img src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" alt="Creativable Logo" className="h-8 w-8" />
                <span className="text-base font-bold">creativable</span>
              </div>
              <p className="text-gray-400 mb-4">Revolutioniere dein Social Media Marketing</p>
              <Button 
                onClick={() => navigate("/auth")} 
                variant="outline" 
                className="bg-[#1A1F2C]/60 hover:bg-[#2A2F3C]/60 text-white border border-white/10"
              >
                Jetzt Anmelden
              </Button>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Creativable</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#mission" className="hover:text-white transition-colors">Unsere Mission</a></li>
                <li><a href="/imprint" className="hover:text-white transition-colors">Impressum</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Datenschutz</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">AGB</a></li>
                <li><a href="/partner" className="hover:text-white transition-colors">Partnerprogramm</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Social Media</h3>
              <div className="flex gap-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-gray-400 mb-4">Bleibe auf dem Laufenden mit unseren Updates</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Deine Email" 
                  className="bg-[#1A1F2C]/60 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 flex-1"
                />
                <Button className="bg-white text-black hover:bg-white/90">
                  Anmelden
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2025 Creativable. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Support;