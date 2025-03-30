
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ModeToggleProps {
  isViewOnly: boolean;
  toggleViewOnly: () => void;
}

const ModeToggle = ({ isViewOnly, toggleViewOnly }: ModeToggleProps) => {
  const { toast } = useToast();

  const handleToggle = () => {
    toggleViewOnly();
    
    // Show a toast when the mode changes
    if (isViewOnly) {
      toast({
        title: "Edit mode activated",
        description: "You can now edit dots by clicking on them.",
      });
    } else {
      toast({
        title: "View mode activated",
        description: "Click dots to view their content without editing.",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`rounded-full ${isViewOnly ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-purple-100 text-purple-700 border-purple-200'}`}
      onClick={handleToggle}
    >
      {isViewOnly ? (
        <>
          <Eye size={16} className="mr-1" />
          View Mode
        </>
      ) : (
        <>
          <Edit size={16} className="mr-1" />
          Edit Mode
        </>
      )}
    </Button>
  );
};

export default ModeToggle;
