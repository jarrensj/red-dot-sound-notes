
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import DotCanvas from "@/components/DotCanvas";
import NoteModal from "@/components/NoteModal";
import Header from "@/components/Header";
import { Dot } from "@/types/dot";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [dots, setDots] = useState<Dot[]>([]);
  const [selectedDot, setSelectedDot] = useState<Dot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
          setDots(data);
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
            setDots(prevDots => [...prevDots, newDot]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedDot = payload.new as Dot;
            setDots(prevDots => 
              prevDots.map(dot => dot.id === updatedDot.id ? updatedDot : dot)
            );
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
    // Check if clicked on empty space - create new dot
    const { data, error } = await supabase
      .from('dots')
      .insert([{ x, y, text: '' }])
      .select()
      .single();

    if (error) {
      console.error("Error creating dot:", error);
      toast({
        title: "Error creating dot",
        description: "We couldn't create your dot. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // We don't need to update local state here as the realtime subscription will handle it
    // But we do need to select the new dot and open the modal
    setSelectedDot(data);
    setIsModalOpen(true);
  };

  const handleDotClick = (dot: Dot) => {
    setSelectedDot(dot);
    setIsModalOpen(true);
  };

  const handleSaveNote = async (text: string) => {
    if (!selectedDot) return;
    
    try {
      const { error } = await supabase
        .from('dots')
        .update({ text, updated_at: new Date().toISOString() })
        .eq('id', selectedDot.id);
      
      if (error) throw error;
      
      // Close modal - the realtime subscription will update the UI
      setIsModalOpen(false);
      
      toast({
        title: text ? "Note saved" : "Note removed",
        description: text 
          ? "Your note has been saved to this dot." 
          : "This dot is now empty.",
      });
    } catch (error) {
      console.error("Error updating dot:", error);
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
      const { error } = await supabase
        .from('dots')
        .delete()
        .eq('id', selectedDot.id);
      
      if (error) throw error;
      
      // Close modal - the realtime subscription will update the UI
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
            <DotCanvas 
              dots={dots} 
              onCanvasClick={handleCanvasClick} 
              onDotClick={handleDotClick}
            />
          )}
        </div>
      </main>

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
        onDelete={handleDeleteDot}
        initialText={selectedDot?.text || ""}
      />
    </div>
  );
};

export default Index;
