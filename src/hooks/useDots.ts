
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dot } from "@/types/dot";

export const useDots = () => {
  const [dots, setDots] = useState<Dot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDots = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('dots')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          throw error;
        }

        if (data) {
          // Only show dots that have text
          setDots(data.filter(dot => dot.text && dot.text.trim() !== ''));
        }
      } catch (error) {
        console.error("Error fetching dots:", error);
        toast({
          title: "Error loading dots",
          description: "We couldn't load your dots. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDots();

    // Set up realtime subscription for updates
    const channel = supabase
      .channel('public:dots')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'dots' },
        (payload) => {
          console.log('Change received!', payload);
          if (payload.eventType === 'INSERT') {
            const newDot = payload.new as Dot;
            // Only add dots with text
            if (newDot.text && newDot.text.trim() !== '') {
              setDots(prevDots => [...prevDots, newDot]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedDot = payload.new as Dot;
            setDots(prevDots => {
              // If the dot has text, update it; otherwise, remove it
              if (updatedDot.text && updatedDot.text.trim() !== '') {
                return prevDots.map(dot => dot.id === updatedDot.id ? updatedDot : dot);
              } else {
                return prevDots.filter(dot => dot.id !== updatedDot.id);
              }
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedDot = payload.old as Dot;
            setDots(prevDots => prevDots.filter(dot => dot.id !== deletedDot.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return {
    dots,
    setDots,
    isLoading
  };
};
