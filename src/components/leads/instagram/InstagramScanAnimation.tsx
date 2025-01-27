import { Image, Search, Instagram } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

interface InstagramScanAnimationProps {
  scanProgress: number;
  mediaProgress: number;
  currentFile?: string;
}

export const InstagramScanAnimation = ({ 
  scanProgress, 
  mediaProgress,
  currentFile 
}: InstagramScanAnimationProps) => {
  const controls = useAnimation();
  const isMediaPhase = scanProgress >= 100;

  useEffect(() => {
    let isActive = true;

    const animate = async () => {
      while (isActive) {
        // Generate random circular movement
        const angle = Math.random() * 2 * Math.PI;
        const radius = 40; // Fixed radius for circular movement
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        // Slower animation when progress is higher
        const duration = Math.max(0.5, 2 - (isMediaPhase ? mediaProgress : scanProgress) / 100);
        
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
  }, [controls, scanProgress, mediaProgress, isMediaPhase]);

  const getStatusText = () => {
    if (!isMediaPhase) {
      return "Scanning Profile...";
    }
    if (mediaProgress < 100) {
      return currentFile ? `Saving: ${currentFile}` : "Saving Media...";
    }
    return "Media successfully saved!";
  };

  return (
    <div className="relative w-full max-w-[300px] mx-auto py-8 space-y-6">
      {/* Frame */}
      <div className="relative border-2 border-gray-200 rounded-lg p-4 bg-white shadow-lg">
        {/* Icons Container */}
        <div className="relative flex justify-center mb-8 h-24">
          {/* Fixed Instagram Icon */}
          <Instagram className="w-12 h-12 text-pink-500" />
          
          {/* Animated Search/Image Icon */}
          <motion.div
            className="absolute"
            animate={controls}
            initial={{ x: 0, y: 0 }}
            style={{ left: '50%', top: '50%' }}
          >
            {isMediaPhase ? (
              <Image className="w-12 h-12 text-blue-500" />
            ) : (
              <Search className="w-12 h-12 text-blue-500" />
            )}
          </motion.div>
        </div>

        {/* Progress Section */}
        <div className="space-y-4">
          {/* Scan Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Profile Scan (1/2)</span>
              <span>{scanProgress}%</span>
            </div>
            <Progress value={scanProgress} className="w-full h-2" />
          </div>

          {/* Media Progress */}
          {isMediaPhase && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Media Save (2/2)</span>
                <span>{mediaProgress}%</span>
              </div>
              <Progress value={mediaProgress} className="w-full h-2" />
            </div>
          )}

          {/* Status Text */}
          <div className="mt-4 text-sm text-gray-600 text-center">
            <p className="font-medium">{getStatusText()}</p>
            {currentFile && mediaProgress < 100 && (
              <p className="text-xs mt-1 break-all text-gray-500">
                {currentFile}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};