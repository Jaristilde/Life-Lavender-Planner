
import React from 'react';

const ButterflyIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22V8"/><path d="M5 12c-1.5-1.5-2.5-3.5-2-6 2.5-.5 4.5.5 6 2 1.5-1.5 3.5-2.5 6-2 .5 2.5-.5 4.5-2 6"/><path d="M5 20c-1.5-1.5-2.5-3.5-2-6 2.5-.5 4.5.5 6 2 1.5-1.5 3.5-2.5 6-2 .5 2.5-.5 4.5-2 6"/>
  </svg>
);

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[500] bg-gradient-to-b from-[#7B68A6] via-[#9B8EC4] to-[#B19CD9] flex flex-col items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 animate-ping opacity-20 bg-white rounded-full" />
        <ButterflyIcon size={80} className="text-white relative animate-pulse" />
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
