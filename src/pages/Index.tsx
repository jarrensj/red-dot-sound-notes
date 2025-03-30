
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import DotCanvas from "@/components/DotCanvas";
import NoteModal from "@/components/NoteModal";
import Header from "@/components/Header";
import { Dot } from "@/types/dot";

const Index = () => {
  const [dots, setDots] = useState<Dot[]>([]);
  const [selectedDot, setSelectedDot] = useState<Dot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  // Load dots from localStorage on component mount
  useEffect(() => {
    const savedDots = localStorage.getItem("dots");
    if (savedDots) {
      try {
        setDots(JSON.parse(savedDots));
      } catch (error) {
        console.error("Failed to parse saved dots:", error);
        toast({
          title: "Error loading saved dots",
          description: "We couldn't load your previously saved dots.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  // Save dots to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("dots", JSON.stringify(dots));
  }, [dots]);

  const handleCanvasClick = (x: number, y: number) => {
    // Check if clicked on empty space - create new dot
    const newDot: Dot = {
      id: Date.now().toString(),
      x,
      y,
      text: "",
    };
    setDots([...dots, newDot]);
    setSelectedDot(newDot);
    setIsModalOpen(true);
  };

  const handleDotClick = (dot: Dot) => {
    setSelectedDot(dot);
    setIsModalOpen(true);
  };

  const handleSaveNote = (text: string) => {
    if (!selectedDot) return;
    
    const updatedDots = dots.map((dot) => 
      dot.id === selectedDot.id ? { ...dot, text } : dot
    );
    
    setDots(updatedDots);
    setIsModalOpen(false);
    
    toast({
      title: text ? "Note saved" : "Note removed",
      description: text 
        ? "Your note has been saved to this dot." 
        : "This dot is now empty.",
    });
  };

  const handleDeleteDot = () => {
    if (!selectedDot) return;
    
    const updatedDots = dots.filter((dot) => dot.id !== selectedDot.id);
    setDots(updatedDots);
    setIsModalOpen(false);
    
    toast({
      title: "Dot deleted",
      description: "The dot and its note have been removed.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-purple-50">
      <Header dotsCount={dots.length} />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="relative w-full max-w-5xl h-[80vh] rounded-xl border border-purple-200 bg-white/90 backdrop-blur-sm shadow-md overflow-hidden">
          <DotCanvas 
            dots={dots} 
            onCanvasClick={handleCanvasClick} 
            onDotClick={handleDotClick}
          />
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
