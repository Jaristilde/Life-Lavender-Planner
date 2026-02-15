
import React from 'react';

interface SplashScreenProps {
  fadingOut?: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ fadingOut = false }) => {
  if (fadingOut) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-gradient-to-b from-[#7B68A6] via-[#9B8EC4] to-[#B19CD9] flex flex-col items-center justify-center">
      <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white/20 flex items-center justify-center">
        <img
          src="/butterflymainimage.png"
          alt="Lavender Butterfly"
          className="w-full h-full object-cover scale-125"
        />
      </div>
      <div className="mt-8 space-y-2 text-center">
        <h1 className="text-3xl serif font-bold text-white tracking-widest uppercase">
          Lavender
        </h1>
        <p className="text-white/60 text-[10px] font-bold tracking-[0.4em] uppercase">Life Planner</p>
      </div>
    </div>
  );
};

export default SplashScreen;
