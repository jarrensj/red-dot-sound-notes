
import { PenLine } from "lucide-react";

interface HeaderProps {
  dotsCount: number;
}

const Header = ({ dotsCount }: HeaderProps) => {
  return (
    <header className="w-full bg-white/80 backdrop-blur-sm border-b border-purple-100 p-4 shadow-sm">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <PenLine className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Red Dot Sound Notes
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {dotsCount} {dotsCount === 1 ? 'dot' : 'dots'} placed
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
