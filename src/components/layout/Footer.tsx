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
          <div>
            <h3 className="text-lg font-semibold mb-4">Creativable</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/about" className="hover:text-white transition-colors">Über uns</Link></li>
              <li><Link to="/imprint" className="hover:text-white transition-colors">Impressum</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Datenschutz</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">AGB</Link></li>
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

          {/* Affiliate Program */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Partnerprogramm</h3>
            <p className="text-gray-400 mb-4">Werde Affiliate und verdiene mit!</p>
            <Button variant="outline" className="border-white/10 hover:bg-white/5">
              Jetzt Partner werden
            </Button>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Creativable. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
};