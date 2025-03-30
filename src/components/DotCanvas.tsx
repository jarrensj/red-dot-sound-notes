
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
  const [viewingDot, setViewingDot] = useState<Dot | null>(null);

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
      if (isViewOnly) {
        // In view mode, just toggle the visibility of the note
        setViewingDot(viewingDot?.id === clickedDot.id ? null : clickedDot);
      } else {
        // In edit mode, open the modal
        onDotClick(clickedDot);
      }
    } else if (isAddingMode) {
      // Only add a new dot if in adding mode
      onCanvasClick(x, y);
    }
  };

  // Close the viewing popup when clicking elsewhere on the canvas
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (viewingDot && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        const clickedOnDot = dots.some(dot => {
          const dx = Math.abs(dot.x - x);
          const dy = Math.abs(dot.y - y);
          return Math.sqrt(dx * dx + dy * dy) < 3;
        });
        
        if (!clickedOnDot) {
          setViewingDot(null);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [viewingDot, dots]);

  return (
    <div 
      ref={canvasRef}
      className={`w-full h-full ${isAddingMode ? 'cursor-crosshair' : isViewOnly ? 'cursor-pointer' : 'cursor-pointer'}`}
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
                       ${isViewOnly ? "cursor-pointer" : "cursor-pointer"}
                       ${(hoveredDot === dot.id || viewingDot?.id === dot.id) ? "ring-2 ring-purple-300 ring-opacity-70" : ""}`}
            onMouseEnter={() => setHoveredDot(dot.id)}
            onMouseLeave={() => setHoveredDot(null)}
          >
            {/* Display tooltip when hovering over a dot with text */}
            {hoveredDot === dot.id && dot.text && !viewingDot && (
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
            
            {/* Display full note content when clicked in view mode */}
            {viewingDot?.id === dot.id && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-full mt-4 left-1/2 -translate-x-1/2 px-4 py-3 bg-white 
                           rounded-lg shadow-lg border border-purple-100 
                           max-w-[300px] z-20"
              >
                <div className="text-sm font-medium text-gray-800 mb-1">Note</div>
                <div className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                  {dot.text || "No content"}
                </div>
                <button 
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewingDot(null);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default DotCanvas;
