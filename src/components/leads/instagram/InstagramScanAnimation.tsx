import { Image, Search, Instagram } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

interface InstagramScanAnimationProps {
  scanProgress: number;
  currentFile?: string;
}

export const InstagramScanAnimation = ({ 
  scanProgress,
  currentFile
}: InstagramScanAnimationProps) => {
  const controls = useAnimation();

  useEffect(() => {
    let isActive = true;

    const animate = async () => {
      while (isActive) {
        const angle = Math.random() * 2 * Math.PI;
        const radius = 40;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        // Adjust animation speed based on progress
        const duration = Math.max(0.5, 2 - (scanProgress / 100));
        
        await controls.start({
          x,
          y,
          transition: {
            duration,
            ease: "easeInOut"
          }
        });
      }
    };
    
    animate();
    return () => {
      isActive = false;
      controls.stop();
    };
  }, [controls, scanProgress]);

  // Ensure progress never exceeds 100%
  const normalizedProgress = Math.min(100, Math.max(0, scanProgress));

  // Helper function to get status message with emojis
  const getStatusMessage = () => {
    if (currentFile) return currentFile;
    if (normalizedProgress === 100) return "✨ Scan erfolgreich abgeschlossen!";
    if (normalizedProgress > 80) return "📸 Verarbeite Instagram Medien...";
    if (normalizedProgress > 60) return "📊 Analysiere Engagement & Statistiken...";
    if (normalizedProgress > 40) return "👥 Erfasse Follower & Following...";
    if (normalizedProgress > 20) return "🔍 Scanne Instagram Profil...";
    if (normalizedProgress > 5) return "🚀 Starte Instagram Scan...";
    return "⚡ Initialisiere Scan...";
  };

  return (
    <div className="relative w-full max-w-[300px] mx-auto py-8 space-y-6">
      <div className="relative border-2 border-gray-200 rounded-lg p-4 bg-white shadow-lg">
        <div className="relative flex justify-center mb-8 h-24">
          <Instagram className="w-12 h-12 text-pink-500" />
          
          <motion.div
            className="absolute"
            animate={controls}
            initial={{ x: 0, y: 0 }}
            style={{ left: '50%', top: '50%' }}
          >
            <Search className="w-12 h-12 text-blue-500" />
          </motion.div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Instagram Scan</span>
              <span>{normalizedProgress}%</span>
            </div>
            <Progress value={normalizedProgress} className="w-full h-2" />
          </div>

          <div className="mt-4 text-sm text-gray-600 text-center">
            <p className="font-medium">{getStatusMessage()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};