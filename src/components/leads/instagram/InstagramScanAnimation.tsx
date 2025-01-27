import { Instagram, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

interface InstagramScanAnimationProps {
  progress: number;
}

export const InstagramScanAnimation = ({ progress }: InstagramScanAnimationProps) => {
  const controls = useAnimation();

  useEffect(() => {
    const animate = async () => {
      while (true) {
        // Generate random positions within bounds
        const x = Math.random() * 260 - 20; // -20 to 240
        const y = Math.random() * 80; // 0 to 80
        
        await controls.start({
          x,
          y,
          transition: {
            duration: 2,
            ease: "easeInOut"
          }
        });
      }
    };
    
    animate();
  }, [controls]);

  return (
    <div className="relative w-full max-w-[300px] mx-auto py-8">
      {/* Instagram Frame */}
      <div className="relative border-2 border-gray-200 rounded-lg p-4 bg-white shadow-lg">
        <Instagram className="w-12 h-12 mx-auto mb-4 text-pink-500" />
        
        {/* Animated Search Icon */}
        <motion.div
          className="absolute"
          animate={controls}
          initial={{ x: -20, y: 0 }}
        >
          <Search className="w-8 h-8 text-blue-500" /> {/* Increased size */}
        </motion.div>

        {/* Progress Bar */}
        <div className="mt-8">
          <Progress value={progress || 0} className="w-full h-2" />
          <p className="text-sm text-center mt-2 text-gray-600">
            {progress || 0}% Scanning Profile...
          </p>
        </div>
      </div>
    </div>
  );
};