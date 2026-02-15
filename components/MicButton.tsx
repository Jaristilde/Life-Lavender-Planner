import React, { useState, useRef, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

interface MicButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

const isNative = Capacitor.isNativePlatform();

const MicButton: React.FC<MicButtonProps> = ({ onTranscript, className = '' }) => {
  const [listening, setListening] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const recognitionRef = useRef<any>(null);

  // Check availability on mount
  useEffect(() => {
    if (isNative) {
      SpeechRecognition.available().then(({ available: a }) => setAvailable(a)).catch(() => setAvailable(false));
    } else {
      const hasBrowser = !!(window as any).webkitSpeechRecognition || !!(window as any).SpeechRecognition;
      setAvailable(hasBrowser);
    }
  }, []);

  const toggleNative = async () => {
    if (listening) {
      await SpeechRecognition.stop();
      setListening(false);
      return;
    }

    // Request permissions
    const perms = await SpeechRecognition.requestPermissions();
    if (perms.speechRecognition !== 'granted') return;

    setListening(true);

    try {
      const result = await SpeechRecognition.start({
        language: 'en-US',
        maxResults: 3,
        partialResults: false,
      });

      if (result.matches && result.matches.length > 0) {
        onTranscript(result.matches[0]);
      }
    } catch (err) {
      console.warn('[MicButton] Native speech error:', err);
    } finally {
      setListening(false);
    }
  };

  const toggleWeb = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const WebSpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!WebSpeechRecognition) return;

    const recognition = new WebSpeechRecognition();
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

  // Hide button if speech not available
  if (available === false) return null;
  // Still checking — show button but it won't do anything harmful
  if (available === null) return null;

  return (
    <button
      type="button"
      onClick={isNative ? toggleNative : toggleWeb}
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
