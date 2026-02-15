import React, { useState, useRef } from 'react';
import { Mic } from 'lucide-react';

interface MicButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

const MicButton: React.FC<MicButtonProps> = ({ onTranscript, className = '' }) => {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggle = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      if (event.results[event.results.length - 1].isFinal) {
        onTranscript(transcript);
      }
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  if (!(window as any).webkitSpeechRecognition && !(window as any).SpeechRecognition) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex-none p-2 rounded-full transition-all ${
        listening
          ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40'
          : 'text-[#B19CD9] hover:text-[#7B68A6] hover:bg-[#E6D5F0]'
      } ${className}`}
      title={listening ? 'Stop listening' : 'Voice input'}
    >
      <Mic size={18} />
    </button>
  );
};

export default MicButton;
