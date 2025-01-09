import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Features = () => {
  const navigate = useNavigate();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-32 pb-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-violet-500 text-transparent bg-clip-text">
              Funktionen
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Organisiere Dein Team, verwalte Kontakte und bilde weiter – mit der All-in-One-Plattform für Coaches und Leader.
            </p>
          </motion.div>
        </div>
        
        {/* Gradient line */}
        <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-gray-500/30 to-transparent" />
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Team Management */}
          <motion.div 
            className="bg-[#1A1F2C]/60 p-6 rounded-lg border border-white/10 backdrop-blur-sm"
            {...fadeIn}
          >
            <img 
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c" 
              alt="Team-Management in Creativable" 
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold mb-3">Team-Management</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Teamorganisation leicht gemacht</li>
              <li>• Kalenderintegration</li>
              <li>• 90-Tage-Pläne</li>
              <li>• Teamkommunikation</li>
            </ul>
          </motion.div>

          {/* Contact Management */}
          <motion.div 
            className="bg-[#1A1F2C]/60 p-6 rounded-lg border border-white/10 backdrop-blur-sm"
            {...fadeIn}
          >
            <img 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f" 
              alt="Kontaktverwaltung in Creativable" 
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold mb-3">Kontaktverwaltung</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Alles an einem Ort</li>
              <li>• Kontaktphasen</li>
              <li>• Notizen & Erinnerungen</li>
              <li>• Aufgabenplanung</li>
            </ul>
          </motion.div>

          {/* Elevate Learning Platform */}
          <motion.div 
            className="bg-[#1A1F2C]/60 p-6 rounded-lg border border-white/10 backdrop-blur-sm"
            {...fadeIn}
          >
            <img 
              src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b" 
              alt="Elevate-Lernplattform in Creativable" 
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold mb-3">Elevate-Lernplattform</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Kurse erstellen</li>
              <li>• Fortschritt tracken</li>
              <li>• Dokumenten-Uploads</li>
              <li>• Teamzugang</li>
            </ul>
          </motion.div>

          {/* Document Management */}
          <motion.div 
            className="bg-[#1A1F2C]/60 p-6 rounded-lg border border-white/10 backdrop-blur-sm"
            {...fadeIn}
          >
            <img 
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085" 
              alt="Dokumentenmanagement in Creativable" 
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold mb-3">Dokumentenmanagement</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Zentrale Ablage</li>
              <li>• Private und öffentliche Freigaben</li>
              <li>• Organisation</li>
            </ul>
          </motion.div>

          {/* Social Media Integration */}
          <motion.div 
            className="bg-[#1A1F2C]/60 p-6 rounded-lg border border-white/10 backdrop-blur-sm"
            {...fadeIn}
          >
            <img 
              src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7" 
              alt="Social Media Integration in Creativable" 
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold mb-3">Social Media Integration</h3>
            <p className="text-yellow-400 mb-2">(Zukünftig verfügbar)</p>
            <ul className="space-y-2 text-gray-300">
              <li>• Automatische Scans</li>
              <li>• Post-Planung</li>
              <li>• Erfolgsmessung</li>
            </ul>
          </motion.div>

          {/* Why Creativable */}
          <motion.div 
            className="bg-[#1A1F2C]/60 p-6 rounded-lg border border-white/10 backdrop-blur-sm"
            {...fadeIn}
          >
            <img 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158" 
              alt="Warum Creativable" 
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold mb-3">Warum Creativable?</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Alles in einer App</li>
              <li>• Zeit sparen</li>
              <li>• Erfolg steigern</li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div 
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-6">Starte jetzt mit der Organisation Deines Teams und Deiner Kontakte.</h2>
          <Button
            onClick={() => navigate("/register")}
            className="bg-[#1A1F2C]/60 hover:bg-[#2A2F3C]/60 text-white border border-white/10 shadow-lg backdrop-blur-sm px-8 py-6 text-lg"
          >
            Teste Creativable kostenlos!
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Features;