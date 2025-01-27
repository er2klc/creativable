import { Image, Search } from "lucide-react";
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
        const angle = Math.random() * 2 * Math.PI;
        const radius = 40 + Math.random() * 20;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
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

  return (
    <div className="relative w-full max-w-[300px] mx-auto py-8 space-y-6">
      {/* Frame */}
      <div className="relative border-2 border-gray-200 rounded-lg p-4 bg-white shadow-lg">
        {/* Icon */}
        <div className="relative flex justify-center">
          {isMediaPhase ? (
            <Image className="w-12 h-12 mx-auto mb-4 text-pink-500" />
          ) : (
            <Search className="w-12 h-12 mx-auto mb-4 text-pink-500" />
          )}
          
          {/* Animated Search Icon */}
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
        <div className="space-y-4 mt-8">
          {/* Scan Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Scanning Profile... (1/2)</span>
              <span>{scanProgress}%</span>
            </div>
            <Progress value={scanProgress} className="w-full h-2" />
          </div>

          {/* Media Progress */}
          {isMediaPhase && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Saving Media... (2/2)</span>
                <span>{mediaProgress}%</span>
              </div>
              <Progress value={mediaProgress} className="w-full h-2" />
            </div>
          )}

          {/* Current File Display */}
          {isMediaPhase && currentFile && (
            <div className="mt-4 text-sm text-gray-600 break-all">
              <p className="text-center">
                Saving: {currentFile}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};