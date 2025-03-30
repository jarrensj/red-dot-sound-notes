
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit } from "lucide-react";

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  onDelete: () => void;
  initialText: string;
  isNewDot?: boolean;
  isEditMode?: boolean;
  onEditToggle?: () => void;
}

const NoteModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  initialText, 
  isNewDot = false, 
  isEditMode = false,
  onEditToggle
}: NoteModalProps) => {
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

  // Focus the textarea when modal opens in edit mode
  useEffect(() => {
    if (isOpen && isEditMode && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isEditMode]);

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
          <DialogTitle>
            {isNewDot ? "Add New Note" : isEditMode ? "Edit Note" : "View Note"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {isEditMode ? (
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
              className="resize-none h-32"
            />
          ) : (
            <div className="border border-input rounded-md bg-background px-3 py-2 text-sm min-h-[80px] max-h-[200px] overflow-y-auto">
              {initialText || "No content"}
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-between">
          {isEditMode ? (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={onDelete}
              className="gap-1"
            >
              <Trash2 size={16} />
              {isNewDot ? "Discard Dot" : "Delete Dot"}
            </Button>
          ) : (
            !isNewDot && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={onDelete}
                className="gap-1"
              >
                <Trash2 size={16} />
                Delete Dot
              </Button>
            )
          )}
          
          <div className="flex gap-2">
            {isEditMode ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={!text.trim()}
                >
                  Save Note
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                {!isNewDot && onEditToggle && (
                  <Button 
                    onClick={onEditToggle}
                    className="gap-1"
                  >
                    <Edit size={16} />
                    Edit
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteModal;
