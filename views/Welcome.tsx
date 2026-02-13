
import React, { useRef, useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface WelcomeProps {
  onContinue: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onContinue }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {});
      const handleEnded = () => setVideoEnded(true);
      video.addEventListener('ended', handleEnded);
      return () => video.removeEventListener('ended', handleEnded);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[400] bg-gradient-to-b from-[#7B68A6] via-[#9B8EC4] to-[#B19CD9] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-10 flex flex-col items-center">
        {/* Video */}
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border-2 border-white/15">
          <video
            ref={videoRef}
            src="/ButterFlyvid1.mp4"
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Text */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl serif font-bold text-white leading-tight">
            Welcome to Your<br />Lavender Journey
          </h1>
          <p className="text-white/70 text-lg md:text-xl italic max-w-lg mx-auto">
            Your life is your biggest project. Plan it beautifully.
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={onContinue}
          className="flex items-center gap-3 px-10 py-4 bg-white text-[#7B68A6] font-bold text-lg rounded-full shadow-xl shadow-black/10 hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          Begin My Journey <ChevronRight size={22} />
        </button>
      </div>

      {/* Bottom decorative text */}
      <div className="absolute bottom-6 opacity-30 text-[10px] font-bold text-white uppercase tracking-[0.5em]">
        Lavender Life Planner
      </div>
    </div>
  );
};

export default Welcome;
