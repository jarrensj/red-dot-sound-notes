
import { useState } from "react";
import { motion } from "framer-motion";
import { Dot } from "@/types/dot";

interface DotItemProps {
  dot: Dot;
  isViewOnly: boolean;
  isViewing: boolean;
  onDotClick: (dot: Dot) => void;
  onHover: (id: string | null) => void;
}

const DotItem = ({ 
  dot, 
  isViewOnly, 
  isViewing, 
  onDotClick, 
  onHover 
}: DotItemProps) => {
  return (
    <motion.div
      key={dot.id}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.2 }}
      style={{
        position: 'absolute',
        left: `${dot.x}%`,
        top: `${dot.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      className={`w-5 h-5 rounded-full
                 ${dot.text ? "bg-indigo-600" : "bg-purple-200"} 
                 ${isViewOnly ? "cursor-pointer" : "cursor-pointer"}
                 ${isViewing ? "ring-2 ring-purple-300 ring-opacity-70" : ""}`}
      onMouseEnter={() => onHover(dot.id)}
      onMouseLeave={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        onDotClick(dot);
      }}
    />
  );
};

export default DotItem;
