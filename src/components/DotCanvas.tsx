
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dot } from "@/types/dot";
import DotItem from "@/components/dots/DotItem";
import DotTooltip from "@/components/dots/DotTooltip";
import ViewingPopup from "@/components/dots/ViewingPopup";
import AddingModeIndicator from "@/components/dots/AddingModeIndicator";

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

  // Handle dot click without propagating to canvas
  const handleDotClick = (dot: Dot) => {
    if (isViewOnly) {
      setViewingDot(viewingDot?.id === dot.id ? null : dot);
    } else {
      onDotClick(dot);
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
      {isAddingMode && <AddingModeIndicator />}
      
      <AnimatePresence>
        {dots.map((dot) => (
          <div key={dot.id} className="relative">
            <DotItem
              dot={dot}
              isViewOnly={isViewOnly}
              isViewing={hoveredDot === dot.id || viewingDot?.id === dot.id}
              onDotClick={handleDotClick}
              onHover={setHoveredDot}
            />
            
            {/* Show tooltip only when hovering and not viewing any dot */}
            {hoveredDot === dot.id && dot.text && !viewingDot && (
              <DotTooltip text={dot.text} />
            )}
            
            {/* Show full content popup when in view mode and dot is selected */}
            {viewingDot?.id === dot.id && (
              <ViewingPopup 
                dot={dot} 
                onClose={() => setViewingDot(null)} 
              />
            )}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default DotCanvas;
