
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface AddDotButtonProps {
  isAddingMode: boolean;
  toggleAddingMode: () => void;
}

const AddDotButton = ({ isAddingMode, toggleAddingMode }: AddDotButtonProps) => {
  return (
    <Button 
      variant="default" 
      size="sm" 
      className="rounded-full bg-indigo-600 hover:bg-indigo-700" 
      onClick={toggleAddingMode}
    >
      <Plus size={18} className="mr-1" />
      Add Dot
    </Button>
  );
};

export default AddDotButton;
