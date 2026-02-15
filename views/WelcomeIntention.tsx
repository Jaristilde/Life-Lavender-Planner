import React, { useState, useEffect } from 'react';
import ButterflyIcon from '../components/ButterflyIcon';

interface WelcomeIntentionProps {
  userName: string;
  onSave: (intention: string) => void;
}

const WelcomeIntention: React.FC<WelcomeIntentionProps> = ({ userName, onSave }) => {
  const [phase, setPhase] = useState<'welcome' | 'intention'>('welcome');
  const [visible, setVisible] = useState(false);
  const [intention, setIntention] = useState('');

  // Fade in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Auto-advance from welcome to intention after 2 seconds
  useEffect(() => {
    if (phase === 'welcome') {
      const timer = setTimeout(() => setPhase('intention'), 2000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleSave = () => {
    if (intention.trim()) {
      onSave(intention.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-gradient-to-b from-[#7B68A6] via-[#9B8EC4] to-[#B19CD9] flex flex-col items-center justify-center p-6"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease-in-out',
      }}
    >
      {phase === 'welcome' && (
        <div className="text-center space-y-6">
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'scale(1)' : 'scale(0.8)',
              transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
            }}
          >
            <ButterflyIcon size={72} className="text-white/90 mx-auto" />
          </div>
          <h1 className="text-3xl serif font-bold text-white leading-tight">
            Welcome{userName ? `, ${userName}` : ''}
          </h1>
          <p className="text-white/70 text-lg italic max-w-sm mx-auto">
            Your life is your biggest project. Plan it beautifully.
          </p>
        </div>
      )}

      {phase === 'intention' && (
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <ButterflyIcon size={40} className="text-white/60 mx-auto mb-4" />
            <h2 className="text-2xl serif font-bold text-white mb-2">
              Welcome to Lavender Life Planner
            </h2>
            <p className="text-white/70 text-base italic">
              What is your intention for this season?
            </p>
          </div>

          <input
            autoFocus
            type="text"
            className="w-full p-4 bg-white/15 border border-white/30 rounded-2xl text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/50 text-center text-lg"
            placeholder="e.g. Abundance and clarity..."
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />

          <button
            onClick={handleSave}
            disabled={!intention.trim()}
            className="w-full py-4 bg-white text-[#7B68A6] font-bold text-lg rounded-2xl shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save & Begin
          </button>

          <button
            onClick={() => onSave('')}
            className="text-white/50 text-sm underline"
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
};

export default WelcomeIntention;
