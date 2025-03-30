
import { motion } from "framer-motion";

interface DotTooltipProps {
  text: string;
}

const DotTooltip = ({ text }: DotTooltipProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-white/90 
                backdrop-blur-sm text-xs rounded shadow-md border border-purple-100 
                max-w-[150px] truncate z-10"
    >
      {text}
    </motion.div>
  );
};

export default DotTooltip;
