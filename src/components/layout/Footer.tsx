import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Instagram, Linkedin, Youtube } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full bg-[#111111] py-16 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-4">
              <img src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" alt="Creativable Logo" className="h-8 w-8" />
              <span className="text-lg font-bold">creativable</span>
            </div>
            <p className="text-gray-400 mb-6">Revolutioniere dein Social Media Marketing</p>
            <Button 
              onClick={() => window.location.href = '/register'}
              className="bg-[#1A1F2C]/60 hover:bg-[#2A2F3C]/60 text-white border border-white/10 shadow-lg backdrop-blur-sm"
            >
              Jetzt Anmelden
            </Button>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Creativable</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/about" className="hover:text-white transition-colors">Über uns</Link></li>
              <li><Link to="/imprint" className="hover:text-white transition-colors">Impressum</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Datenschutz</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">AGB</Link></li>
              <li><Link to="/affiliate" className="hover:text-white transition-colors">Partnerprogramm</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Social Media</h3>
            <div className="flex space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <div className="space-y-4">
              <p className="text-gray-400">Bleibe auf dem Laufenden mit unseren Updates</p>
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Deine Email" 
                  className="bg-white/5 border-white/10"
                />
                <Button variant="secondary">Anmelden</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Creativable. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
};