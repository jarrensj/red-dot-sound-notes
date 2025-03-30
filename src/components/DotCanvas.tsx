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
  isAccessibilityMode?: boolean;
}

const DotCanvas = ({ 
  dots, 
  onCanvasClick, 
  onDotClick, 
  isAddingMode,
  isViewOnly = true,
  elevenlabsApiKey,
  isAccessibilityMode = false
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

  // Find the active dot object
  const activeDot = activeDotId ? dots.find(dot => dot.id === activeDotId) : null;

  return (
    <div 
      ref={canvasRef}
      className={`w-full h-full relative ${isAddingMode ? 'cursor-crosshair' : isViewOnly ? 'cursor-pointer' : 'cursor-pointer'}`}
      onClick={handleClick}
    >
      {/* Background sample text */}
      <div className="absolute inset-0 p-8 overflow-auto pointer-events-none">
        <p className="text-lg leading-relaxed">
          I made Red Dot Sound Notes. It lets you leave red dots (audio notes) all around a blog post or landing page wherever you want on the page. It's interactive and can provide an outlet for users to provide commentary on blog / landing page on certain parts or just leave funny comments. You never know what's going to happen when you click a red dot! </p>
        <p className="text-lg leading-relaxed mt-4">
          We really don't know what kind of insight you might hear when you click a red dot or really what's going to happen until you click it. It's also like a message board where you can leave notes for other users to hear. 
        </p>
        <p className="text-lg leading-relaxed mt-4">
          Future things to implement include user authentication to record who left the note or even adding a timer to the dot so it expires after a certain amount of time or adding Stripe to having readers have to pay to leave a note to help support the site or blogger. This helps out bloggers.
        </p>
        <p className="text-lg leading-relaxed mt-4">
          I used Supabase to store the notes and the coordinates of the dots. I also used ElevenLabs to generate the audio for the dots with its API for text-to-speech.
        </p>
        <p className="text-lg leading-relaxed mt-4">
        The purpose of this is to create an interactive and engaging experience to the visitor. They not only just read the blog or landing page but they can now also write to it with their insights on certain areas or leave affirmations or appreciation. This also would extend their stay on the website because they can also just click around and see what other user's have left as notes around the blog or landing page. This can increase user visits and how long they stay on the website. 
        </p>
      </div>
      
      {isAddingMode && (
        <div className="absolute top-4 right-4 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium animate-pulse z-10">
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
            className={`absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full
                       ${dot.text ? "bg-red-400" : "bg-purple-200"} 
                       ${isViewOnly ? "cursor-pointer" : "cursor-pointer"}
                       ${(hoveredDot === dot.id || (isSpeaking && activeDotId === dot.id)) ? "ring-2 ring-purple-300 ring-opacity-70" : ""}
                       z-20`}
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
                           z-30 whitespace-nowrap"
              >
                Click to play audio
              </motion.div>
            )}
            
            {/* Visual indicator when audio is playing */}
            {isSpeaking && activeDotId === dot.id && (
              <>
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -right-2 -top-2 bg-red-100 rounded-full p-1 z-30"
                >
                  <Volume2 size={10} className="text-red-500" />
                </motion.div>
                
                {/* Text message tooltip when audio is playing - only show when accessibility mode is on */}
                {isAccessibilityMode && activeDot?.text && (
                  <motion.div 
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-4 right-4 px-4 py-3 bg-white/95 
                              backdrop-blur-sm text-sm rounded-md shadow-lg border border-red-200 
                              z-50 w-80 max-h-52 overflow-y-auto"
                  >
                    <div className="font-semibold text-red-500 mb-2 flex items-center gap-1">
                      <Volume2 size={14} className="inline" /> Now playing:
                    </div>
                    <div className="text-gray-700">{activeDot.text}</div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default DotCanvas;
