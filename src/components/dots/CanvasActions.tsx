
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AddDotButton from "@/components/dots/AddDotButton";

interface CanvasActionsProps {
  isAddingMode: boolean;
  toggleAddingMode: () => void;
  setIsViewOnly: (isViewOnly: boolean) => void;
}

const CanvasActions = ({ 
  isAddingMode, 
  toggleAddingMode,
  setIsViewOnly 
}: CanvasActionsProps) => {
  const { toast } = useToast();

  const handleToggleAddingMode = () => {
    // When enabling adding mode, also disable view-only mode
    if (!isAddingMode) {
      setIsViewOnly(false);
      
      toast({
        title: "Adding mode activated",
        description: "Click anywhere on the canvas to add a new dot.",
      });
    }
    toggleAddingMode();
  };

  return (
    <div className="flex gap-2">
      {!isAddingMode && (
        <AddDotButton 
          isAddingMode={isAddingMode} 
          toggleAddingMode={handleToggleAddingMode} 
        />
      )}
      {isAddingMode && (
        <Button 
          variant="destructive"
          size="sm"
          className="rounded-full"
          onClick={toggleAddingMode}
        >
          Cancel
        </Button>
      )}
    </div>
  );
};

export default CanvasActions;
