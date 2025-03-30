
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const { toast } = useToast();

  const speak = async (text: string) => {
    if (!text || text.trim() === '') {
      toast({
        title: "Nothing to speak",
        description: "This note doesn't contain any text to speak.",
        variant: "destructive",
      });
      return;
    }

    try {
      // If already speaking, stop the current audio
      if (isSpeaking) {
        stopSpeaking();
      }

      setIsSpeaking(true);
      
      // Create API request to ElevenLabs
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY || '',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      // Convert the response to an audio buffer
      const audioData = await response.arrayBuffer();
      
      // Create audio context if it doesn't exist
      const ctx = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);
      
      // Decode audio data
      const audioBuffer = await ctx.decodeAudioData(audioData);
      
      // Create a source node
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      // Save reference to stop later if needed
      setAudioSource(source);
      
      // Play the audio
      source.start(0);
      
      // Set up event for when audio finishes playing
      source.onended = () => {
        setIsSpeaking(false);
        setAudioSource(null);
      };
      
      toast({
        title: "Speaking note",
        description: "The text-to-speech is now playing.",
      });
    } catch (error) {
      console.error("Error with text-to-speech:", error);
      setIsSpeaking(false);
      
      toast({
        title: "Speech error",
        description: "There was an error generating the speech. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const stopSpeaking = () => {
    if (audioSource) {
      audioSource.stop();
      setAudioSource(null);
    }
    setIsSpeaking(false);
  };

  return {
    speak,
    stopSpeaking,
    isSpeaking,
  };
};
