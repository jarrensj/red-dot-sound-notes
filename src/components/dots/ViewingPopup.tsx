
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Dot } from "@/types/dot";

interface ViewingPopupProps {
  dot: Dot;
  onClose: () => void;
}

const ViewingPopup = ({ dot, onClose }: ViewingPopupProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute top-full mt-4 left-1/2 -translate-x-1/2 px-4 py-3 bg-white 
                rounded-lg shadow-lg border border-purple-100 
                max-w-[300px] z-20"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-sm font-medium text-gray-800 mb-1">Note</div>
      <div className="text-sm text-gray-600 whitespace-pre-wrap break-words">
        {dot.text || "No content"}
      </div>
      <button 
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" 
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export default ViewingPopup;
