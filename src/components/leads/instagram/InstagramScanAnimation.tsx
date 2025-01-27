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
    let isActive = true;

    const animate = async () => {
      while (isActive) {
        // Generate random angle and radius for circular motion around Instagram logo
        const angle = Math.random() * 2 * Math.PI;
        const radius = 40 + Math.random() * 20; // Random radius between 40-60px
        
        // Calculate x and y based on polar coordinates
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        // Animation speed increases with progress
        const duration = Math.max(0.5, 2 - (progress / 100)); // Speeds up as progress increases
        
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
    
    // Start animation after component is mounted
    animate();

    // Cleanup animation on unmount
    return () => {
      isActive = false;
      controls.stop();
    };
  }, [controls, progress]);

  // Ensure progress is a valid number between 0-100
  const safeProgress = typeof progress === 'number' && !isNaN(progress) ? 
    Math.max(0, Math.min(100, progress)) : 0;

  return (
    <div className="relative w-full max-w-[300px] mx-auto py-8">
      {/* Instagram Frame */}
      <div className="relative border-2 border-gray-200 rounded-lg p-4 bg-white shadow-lg">
        <Instagram className="w-12 h-12 mx-auto mb-4 text-pink-500" />
        
        {/* Animated Search Icon */}
        <motion.div
          className="absolute"
          animate={controls}
          initial={{ x: 0, y: 0 }}
          style={{ left: '50%', top: '50%' }}
        >
          <Search className="w-12 h-12 text-blue-500" />
        </motion.div>

        {/* Progress Bar */}
        <div className="mt-8">
          <Progress value={safeProgress} className="w-full h-2" />
          <p className="text-sm text-center mt-2 text-gray-600">
            {safeProgress}% Scanning Profile...
          </p>
        </div>
      </div>
    </div>
  );
};