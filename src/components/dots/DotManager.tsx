
import DotCanvas from "@/components/DotCanvas";
import NoteModal from "@/components/NoteModal";
import LoadingState from "@/components/dots/LoadingState";
import ModeToggle from "@/components/dots/ModeToggle";
import CanvasActions from "@/components/dots/CanvasActions";
import { useDotActions } from "@/hooks/useDotActions";
import { Dot } from "@/types/dot";

interface DotManagerProps {
  dots: Dot[];
  setDots: React.Dispatch<React.SetStateAction<Dot[]>>;
  isLoading: boolean;
  elevenlabsApiKey?: string;
}

const DotManager = ({ dots, setDots, isLoading, elevenlabsApiKey }: DotManagerProps) => {
  const {
    selectedDot,
    isModalOpen,
    isAddingMode,
    isNewDot,
    isEditMode,
    isViewOnly,
    setIsViewOnly,
    setIsModalOpen,
    handleCanvasClick,
    handleDotClick,
    toggleEditMode,
    toggleViewOnly,
    toggleAddingMode,
    handleSaveNote,
    handleDeleteDot
  } = useDotActions(dots, setDots);

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
            isViewOnly={isViewOnly}
            elevenlabsApiKey={elevenlabsApiKey}
          />
          
          {/* Mode toggle button */}
          <div className="absolute bottom-4 left-4">
            <ModeToggle 
              isViewOnly={isViewOnly} 
              toggleViewOnly={toggleViewOnly} 
            />
          </div>
          
          {/* Add/Cancel buttons */}
          <div className="absolute bottom-4 right-4">
            <CanvasActions 
              isAddingMode={isAddingMode} 
              toggleAddingMode={toggleAddingMode}
              setIsViewOnly={setIsViewOnly}
            />
          </div>
        </>
      )}

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
        onDelete={handleDeleteDot}
        initialText={selectedDot?.text || ""}
        isNewDot={isNewDot}
        isEditMode={isEditMode}
        onEditToggle={toggleEditMode}
      />
    </div>
  );
};

export default DotManager;
