
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import DotCanvas from "@/components/DotCanvas";
import NoteModal from "@/components/NoteModal";
import Header from "@/components/Header";
import { Dot } from "@/types/dot";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

const Index = () => {
  const [dots, setDots] = useState<Dot[]>([]);
  const [selectedDot, setSelectedDot] = useState<Dot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [isNewDot, setIsNewDot] = useState(false);
  const { toast } = useToast();

  // Load dots from Supabase on component mount
  useEffect(() => {
    const fetchDots = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('dots')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          throw error;
        }

        if (data) {
          // Only show dots that have text
          setDots(data.filter(dot => dot.text && dot.text.trim() !== ''));
        }
      } catch (error) {
        console.error("Error fetching dots:", error);
        toast({
          title: "Error loading dots",
          description: "We couldn't load your dots. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDots();

    // Set up realtime subscription for updates
    const channel = supabase
      .channel('public:dots')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'dots' },
        (payload) => {
          console.log('Change received!', payload);
          if (payload.eventType === 'INSERT') {
            const newDot = payload.new as Dot;
            // Only add dots with text
            if (newDot.text && newDot.text.trim() !== '') {
              setDots(prevDots => [...prevDots, newDot]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedDot = payload.new as Dot;
            setDots(prevDots => {
              // If the dot has text, update it; otherwise, remove it
              if (updatedDot.text && updatedDot.text.trim() !== '') {
                return prevDots.map(dot => dot.id === updatedDot.id ? updatedDot : dot);
              } else {
                return prevDots.filter(dot => dot.id !== updatedDot.id);
              }
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedDot = payload.old as Dot;
            setDots(prevDots => prevDots.filter(dot => dot.id !== deletedDot.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

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
      } else {
        // For existing dots, delete from the database
        const { error } = await supabase
          .from('dots')
          .delete()
          .eq('id', selectedDot.id);
        
        if (error) throw error;
      }
      
      // Close modal
      setIsModalOpen(false);
      
      toast({
        title: "Dot deleted",
        description: "The dot and its note have been removed.",
      });
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-purple-50">
      <Header dotsCount={dots.length} />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="relative w-full max-w-5xl h-[80vh] rounded-xl border border-purple-200 bg-white/90 backdrop-blur-sm shadow-md overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-indigo-600">Loading dots...</span>
            </div>
          ) : (
            <>
              <DotCanvas 
                dots={dots} 
                onCanvasClick={handleCanvasClick} 
                onDotClick={handleDotClick}
                isAddingMode={isAddingMode}
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                {isAddingMode ? (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="rounded-full" 
                    onClick={toggleAddingMode}
                  >
                    <X size={18} className="mr-1" />
                    Cancel
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="rounded-full bg-indigo-600 hover:bg-indigo-700" 
                    onClick={toggleAddingMode}
                  >
                    <Plus size={18} className="mr-1" />
                    Add Dot
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </main>

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

export default Index;
