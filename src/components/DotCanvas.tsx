
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dot } from "@/types/dot";
import { Volume2, XCircle } from "lucide-react";
import { useTextToSpeech } from "@/utils/useTextToSpeech";

interface DotCanvasProps {
  dots: Dot[];
  onCanvasClick: (x: number, y: number) => void;
  onDotClick: (dot: Dot) => void;
  isAddingMode: boolean;
  isViewOnly?: boolean;
  elevenlabsApiKey?: string;
}

const DotCanvas = ({ 
  dots, 
  onCanvasClick, 
  onDotClick, 
  isAddingMode,
  isViewOnly = true,
  elevenlabsApiKey
}: DotCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [hoveredDot, setHoveredDot] = useState<string | null>(null);
  const [activeDotId, setActiveDotId] = useState<string | null>(null);
  const { speak, stopSpeaking, isSpeaking } = useTextToSpeech();

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
        // Stop any currently playing audio
        if (isSpeaking) {
          stopSpeaking();
        }
        
        // Set the active dot ID
        setActiveDotId(clickedDot.id);
        
        // If the dot has text, play it directly
        if (clickedDot.text && clickedDot.text.trim() !== '') {
          speak(clickedDot.text, elevenlabsApiKey);
        } else {
          // If no text, show a toast or something
          console.log("No text to play for this dot");
          setActiveDotId(null);
        }
      } else {
        // In edit mode, open the modal
        onDotClick(clickedDot);
      }
    } else if (isAddingMode) {
      // Only add a new dot if in adding mode
      onCanvasClick(x, y);
    }
  };

  // Reset active dot when audio stops
  useEffect(() => {
    if (!isSpeaking) {
      setActiveDotId(null);
    }
  }, [isSpeaking]);

  // Close any audio when clicking elsewhere on the canvas
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isSpeaking && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        const clickedOnDot = dots.some(dot => {
          const dx = Math.abs(dot.x - x);
          const dy = Math.abs(dot.y - y);
          return Math.sqrt(dx * dx + dy * dy) < 3;
        });
        
        if (!clickedOnDot) {
          stopSpeaking();
          setActiveDotId(null);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dots, isSpeaking, stopSpeaking]);

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
                       ${(hoveredDot === dot.id || (isSpeaking && activeDotId === dot.id)) ? "ring-2 ring-purple-300 ring-opacity-70" : ""}`}
            onMouseEnter={() => setHoveredDot(dot.id)}
            onMouseLeave={() => setHoveredDot(null)}
          >
            {/* Display tooltip when hovering over a dot with text */}
            {hoveredDot === dot.id && dot.text && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-white/90 
                           backdrop-blur-sm text-xs rounded shadow-md border border-purple-100 
                           z-10 whitespace-nowrap"
              >
                Click to play audio
              </motion.div>
            )}
            
            {/* Visual indicator when audio is playing */}
            {isSpeaking && activeDotId === dot.id && (
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute -right-3 -top-3 bg-indigo-100 rounded-full p-1"
              >
                <Volume2 size={14} className="text-indigo-600" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default DotCanvas;
