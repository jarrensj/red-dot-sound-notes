
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Accessibility } from "lucide-react";

interface AccessibilityToggleProps {
  isAccessibilityMode: boolean;
  toggleAccessibilityMode: () => void;
}

const AccessibilityToggle = ({ 
  isAccessibilityMode, 
  toggleAccessibilityMode 
}: AccessibilityToggleProps) => {
  return (
    <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-md px-3 py-1.5 shadow-sm border border-gray-200">
      <Accessibility size={16} className="text-purple-500" />
      <Label htmlFor="accessibility-mode" className="text-xs font-medium cursor-pointer">
        Show captions
      </Label>
      <Switch
        id="accessibility-mode"
        checked={isAccessibilityMode}
        onCheckedChange={toggleAccessibilityMode}
        className="data-[state=checked]:bg-purple-500"
      />
    </div>
  );
};

export default AccessibilityToggle;
