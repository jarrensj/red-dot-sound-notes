
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dot } from "@/types/dot";

interface DotCanvasProps {
  dots: Dot[];
  onCanvasClick: (x: number, y: number) => void;
  onDotClick: (dot: Dot) => void;
  isAddingMode: boolean;
  isViewOnly?: boolean;
}

const DotCanvas = ({ 
  dots, 
  onCanvasClick, 
  onDotClick, 
  isAddingMode,
  isViewOnly = true
}: DotCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [hoveredDot, setHoveredDot] = useState<string | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    // Get canvas bounds
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Calculate click position relative to canvas
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Check if click is on an existing dot
    const clickedDot = dots.find(dot => {
      const dx = Math.abs(dot.x - x);
      const dy = Math.abs(dot.y - y);
      return Math.sqrt(dx * dx + dy * dy) < 3; // 3% of canvas width/height as click radius
    });
    
    if (clickedDot) {
      onDotClick(clickedDot);
    } else if (isAddingMode) {
      // Only add a new dot if in adding mode
      onCanvasClick(x, y);
    }
  };

  return (
    <div 
      ref={canvasRef}
      className={`w-full h-full ${isAddingMode ? 'cursor-crosshair' : isViewOnly ? 'cursor-default' : 'cursor-pointer'}`}
      onClick={handleClick}
    >
      {isAddingMode && (
        <div className="absolute top-4 right-4 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
          Click anywhere to add a new dot
        </div>
      )}
      
      {/* Remove the view mode indicator since we now have a button */}
      
      <AnimatePresence>
        {dots.map((dot) => (
          <motion.div
            key={dot.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.2 }}
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
            }}
            className={`absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full
                       ${dot.text ? "bg-indigo-600" : "bg-purple-200"} 
                       ${isViewOnly ? "cursor-help" : "cursor-pointer"}
                       ${hoveredDot === dot.id ? "ring-2 ring-purple-300 ring-opacity-70" : ""}`}
            onMouseEnter={() => setHoveredDot(dot.id)}
            onMouseLeave={() => setHoveredDot(null)}
          >
            {hoveredDot === dot.id && dot.text && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-white/90 
                           backdrop-blur-sm text-xs rounded shadow-md border border-purple-100 
                           max-w-[150px] truncate z-10"
              >
                {dot.text}
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default DotCanvas;
