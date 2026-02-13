
import React from 'react';

interface SplashScreenProps {
  fadingOut?: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ fadingOut = false }) => {
  return (
    <div
      className="fixed inset-0 z-[500] bg-gradient-to-b from-[#7B68A6] via-[#9B8EC4] to-[#B19CD9] flex flex-col items-center justify-center"
      style={{
        transition: 'opacity 500ms ease-out',
        opacity: fadingOut ? 0 : 1,
        pointerEvents: fadingOut ? 'none' : 'auto'
      }}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute w-44 h-44 animate-ping opacity-10 bg-white rounded-full" />
        <div className="w-44 h-44 rounded-full flex items-center justify-center relative"
          style={{ filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.3))' }}>
          <img
            src="/butterflymainimage.png"
            alt="Lavender Butterfly"
            className="w-44 h-44 object-contain"
            style={{ mixBlendMode: 'screen' }}
          />
        </div>
      </div>
      <div className="mt-8 space-y-2 text-center">
        <h1 className="text-3xl serif font-bold text-white tracking-widest uppercase">
          Lavender
        </h1>
        <p className="text-white/60 text-[10px] font-bold tracking-[0.4em] uppercase">Life Planner</p>
      </div>
      <div className="mt-12 flex gap-2">
        <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-0" />
        <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-150" />
        <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-300" />
      </div>
    </div>
  );
};

export default SplashScreen;
