
import { useDots } from "@/hooks/useDots";
import Header from "@/components/Header";
import DotManager from "@/components/dots/DotManager";

const Index = () => {
  const { dots, setDots, isLoading } = useDots();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-purple-50">
      <Header dotsCount={dots.length} />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <DotManager 
          dots={dots} 
          setDots={setDots} 
          isLoading={isLoading} 
        />
      </main>
    </div>
  );
};

export default Index;
