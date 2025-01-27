import { Instagram, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface InstagramScanAnimationProps {
  progress: number;
}

export const InstagramScanAnimation = ({ progress }: InstagramScanAnimationProps) => {
  return (
    <div className="relative w-full max-w-[300px] mx-auto py-8">
      {/* Instagram Frame */}
      <div className="relative border-2 border-gray-200 rounded-lg p-4 bg-white shadow-lg">
        <Instagram className="w-12 h-12 mx-auto mb-4 text-pink-500" />
        
        {/* Animated Search Icon */}
        <motion.div
          className="absolute"
          animate={{
            x: [-20, 260, -20],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Search className="w-6 h-6 text-blue-500" />
        </motion.div>

        {/* Progress Bar */}
        <div className="mt-8">
          <Progress value={progress} className="w-full h-2" />
          <p className="text-sm text-center mt-2 text-gray-600">
            {progress}% Scanning Profile...
          </p>
        </div>
      </div>
    </div>
  );
};