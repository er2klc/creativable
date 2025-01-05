import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface SuccessAnimationProps {
  show: boolean;
}

export const SuccessAnimation = ({ show }: SuccessAnimationProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 360, 360]
              }}
              transition={{ duration: 0.5 }}
              className="rounded-full bg-green-500 p-4"
            >
              <Check className="h-8 w-8 text-white" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-semibold text-green-500"
            >
              Aufgabe erledigt! 🎉
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};