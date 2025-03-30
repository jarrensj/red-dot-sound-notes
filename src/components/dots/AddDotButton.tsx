
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface AddDotButtonProps {
  isAddingMode: boolean;
  toggleAddingMode: () => void;
}

const AddDotButton = ({ isAddingMode, toggleAddingMode }: AddDotButtonProps) => {
  return (
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
  );
};

export default AddDotButton;
