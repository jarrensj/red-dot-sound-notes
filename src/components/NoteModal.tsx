
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  onDelete: () => void;
  initialText: string;
  isNewDot?: boolean;
}

const NoteModal = ({ isOpen, onClose, onSave, onDelete, initialText, isNewDot = false }: NoteModalProps) => {
  const [text, setText] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previousOpenState = useRef(isOpen);

  // Update text when initialText changes or when modal opens with a new instance
  useEffect(() => {
    // Only update the text state if the modal is opening (not was open before)
    // or if initialText has changed
    if (!previousOpenState.current && isOpen) {
      setText(initialText);
    } else if (previousOpenState.current && isOpen) {
      // Modal was already open, only update if initialText changed
      if (initialText !== text) {
        setText(initialText);
      }
    }
    
    // Update previous open state
    previousOpenState.current = isOpen;
  }, [isOpen, initialText]);

  // Focus the textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSave = () => {
    const trimmedText = text.trim();
    onSave(trimmedText);
    // Clear the text after saving
    setText("");
  };

  const handleCancel = () => {
    // For new dots with no text, delete them when canceling
    if (isNewDot && !text.trim()) {
      onDelete();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isNewDot ? "Add New Note" : "Your Note"}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
            className="resize-none h-32"
          />
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onDelete}
            className="gap-1"
          >
            <Trash2 size={16} />
            {isNewDot ? "Discard Dot" : "Delete Dot"}
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!text.trim()}
            >
              Save Note
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteModal;
