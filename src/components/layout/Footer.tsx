import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Instagram, Linkedin, Youtube } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-[#111111] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <img
              src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png"
              alt="Creativable Logo"
              className="h-8 w-8"
            />
            <p className="text-sm text-gray-400">
              Transformiere deine kreative Vision in die Realität mit unserer
              intuitiven Plattform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/features" className="hover:text-white">
                  Funktionen
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white">
                  Preise
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white">
                  Über uns
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-white">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Rechtliches</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/imprint" className="hover:text-white">
                  Impressum
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white">
                  AGB
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-gray-400 mb-4">
              Bleibe auf dem Laufenden mit unseren neuesten Updates.
            </p>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Deine E-Mail"
                className="bg-white/5 border-white/10"
              />
              <Button className="w-full bg-[#1A1F2C]/60 hover:bg-[#2A2F3C]/60 text-white border border-white/10">
                Abonnieren
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2024 Creativable. Alle Rechte vorbehalten.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white"
            >
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};