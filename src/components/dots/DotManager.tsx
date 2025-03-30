
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import DotCanvas from "@/components/DotCanvas";
import NoteModal from "@/components/NoteModal";
import AddDotButton from "@/components/dots/AddDotButton";
import LoadingState from "@/components/dots/LoadingState";
import { Dot } from "@/types/dot";
import { supabase } from "@/integrations/supabase/client";

interface DotManagerProps {
  dots: Dot[];
  setDots: React.Dispatch<React.SetStateAction<Dot[]>>;
  isLoading: boolean;
}

const DotManager = ({ dots, setDots, isLoading }: DotManagerProps) => {
  const [selectedDot, setSelectedDot] = useState<Dot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [isNewDot, setIsNewDot] = useState(false);
  const { toast } = useToast();

  const handleCanvasClick = async (x: number, y: number) => {
    try {
      // Create a temporary dot without saving to database yet
      const tempDot: Dot = {
        id: 'temp-' + Date.now(),
        x,
        y,
        text: ''
      };
      
      // Add the temporary dot to the local state
      setDots(prevDots => [...prevDots, tempDot]);
      
      // Select the temporary dot and open the modal
      setSelectedDot(tempDot);
      setIsNewDot(true);
      setIsModalOpen(true);
      
      // Exit adding mode after placing a dot
      setIsAddingMode(false);
    } catch (error) {
      console.error("Error preparing new dot:", error);
      toast({
        title: "Error creating dot",
        description: "We couldn't create your dot. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDotClick = (dot: Dot) => {
    setSelectedDot(dot);
    setIsNewDot(false);
    setIsModalOpen(true);
  };

  const handleSaveNote = async (text: string) => {
    if (!selectedDot) return;
    
    // If it's a new dot and has no text, don't save it
    if (isNewDot && !text) {
      // Remove the temporary dot from the UI
      setDots(prevDots => prevDots.filter(dot => dot.id !== selectedDot.id));
      setIsModalOpen(false);
      return;
    }
    
    try {
      // For new dots, we need to create them in the database
      if (isNewDot) {
        const { error } = await supabase
          .from('dots')
          .insert([{ 
            x: selectedDot.x, 
            y: selectedDot.y, 
            text,
            updated_at: new Date().toISOString()
          }]);
        
        if (error) throw error;
        
        // Remove the temporary dot from UI (realtime will add the real one)
        setDots(prevDots => prevDots.filter(dot => dot.id !== selectedDot.id));
      } else {
        // For existing dots, update them
        const { error } = await supabase
          .from('dots')
          .update({ 
            text, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', selectedDot.id);
        
        if (error) throw error;
      }
      
      // Close modal
      setIsModalOpen(false);
      
      toast({
        title: text ? "Note saved" : "Note removed",
        description: text 
          ? "Your note has been saved to this dot." 
          : "This dot has been removed.",
      });
    } catch (error) {
      console.error("Error saving dot:", error);
      toast({
        title: "Error saving note",
        description: "We couldn't save your note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDot = async () => {
    if (!selectedDot) return;
    
    try {
      // If it's a new dot (temporary), just remove it from the UI
      if (isNewDot || selectedDot.id.toString().startsWith('temp-')) {
        setDots(prevDots => prevDots.filter(dot => dot.id !== selectedDot.id));
        setIsModalOpen(false);
        
        toast({
          title: "Dot discarded",
          description: "The new dot was discarded.",
        });
      } else {
        // For existing dots, delete from the database
        const { error } = await supabase
          .from('dots')
          .delete()
          .eq('id', selectedDot.id);
        
        if (error) throw error;
        
        // Close modal
        setIsModalOpen(false);
        
        toast({
          title: "Dot deleted",
          description: "The dot and its note have been removed.",
        });
      }
    } catch (error) {
      console.error("Error deleting dot:", error);
      toast({
        title: "Error deleting dot",
        description: "We couldn't delete your dot. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleAddingMode = () => {
    setIsAddingMode(!isAddingMode);
  };

  return (
    <div className="relative w-full max-w-5xl h-[80vh] rounded-xl border border-purple-200 bg-white/90 backdrop-blur-sm shadow-md overflow-hidden">
      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          <DotCanvas 
            dots={dots} 
            onCanvasClick={handleCanvasClick} 
            onDotClick={handleDotClick}
            isAddingMode={isAddingMode}
          />
          <AddDotButton 
            isAddingMode={isAddingMode} 
            toggleAddingMode={toggleAddingMode} 
          />
        </>
      )}

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
        onDelete={handleDeleteDot}
        initialText={selectedDot?.text || ""}
        isNewDot={isNewDot}
      />
    </div>
  );
};

export default DotManager;
