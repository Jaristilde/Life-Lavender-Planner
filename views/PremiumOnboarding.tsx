
import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, Check, X } from 'lucide-react';
import { generatePersonalizedAbundanceMessage, generatePersonalizedAffirmations } from '../services/geminiService';

interface Props {
  onComplete: (data: { 
    userName: string; 
    userMood: string; 
    userFeeling: string; 
    isPremium: boolean;
    trialStartDate: string | null;
  }) => void;
}

const ButterflyIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22V8"/>
    <path d="M5 12c-1.5-1.5-2.5-3.5-2-6 2.5-.5 4.5.5 6 2 1.5-1.5 3.5-2.5 6-2 .5 2.5-.5 4.5-2 6"/>
    <path d="M5 20c-1.5-1.5-2.5-3.5-2-6 2.5-.5 4.5.5 6 2 1.5-1.5 3.5-2.5 6-2 .5 2.5-.5 4.5-2 6"/>
  </svg>
);

const PremiumOnboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState('');
  const [userMood, setUserMood] = useState('');
  const [userFeeling, setUserFeeling] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [aiAffirmations, setAiAffirmations] = useState<string[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const feelings = ["Abundance", "Peace", "Joy", "Gratitude", "Purpose", "Optimism", "Freedom", "Confidence"];

  const handleMoodSelect = (mood: string) => {
    setUserMood(mood);
    setStep(3);
  };

  const handleFeelingSelect = (feeling: string) => {
    setUserFeeling(feeling);
    setStep(4);
  };

  useEffect(() => {
    if (step === 5 && !aiMessage) {
      const fetchMessage = async () => {
        setIsLoadingAi(true);
        const msg = await generatePersonalizedAbundanceMessage(userName, userMood, userFeeling);
        setAiMessage(msg);
        setIsLoadingAi(false);
      };
      fetchMessage();
    }
  }, [step, userName, userMood, userFeeling, aiMessage]);

  useEffect(() => {
    if (step === 6 && aiAffirmations.length === 0) {
      const fetchAffirmations = async () => {
        setIsLoadingAi(true);
        const affs = await generatePersonalizedAffirmations(userName, userMood, userFeeling);
        setAiAffirmations(affs);
        setIsLoadingAi(false);
      };
      fetchAffirmations();
    }
  }, [step, userName, userMood, userFeeling, aiAffirmations]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8 w-full max-w-md mx-auto text-center px-6 animate-in fade-in duration-500">
            <h1 className="text-4xl serif font-bold text-white">First, let's personalize your experience.</h1>
            <p className="text-white/80">What name do you prefer to use?</p>
            <input 
              autoFocus
              className="w-full p-5 bg-white/10 rounded-2xl outline-none text-white text-xl text-center placeholder:text-white/30 border border-white/5 focus:border-white/20 transition-all"
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && userName && setStep(2)}
            />
            <div className="fixed bottom-10 left-6 right-6">
              <button 
                disabled={!userName}
                onClick={() => setStep(2)}
                className="w-full py-5 bg-white/90 text-[#7B68A6] font-bold rounded-full shadow-2xl disabled:opacity-50 transition-all active:scale-95"
              >
                Continue
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 w-full max-w-md mx-auto text-center px-6 animate-in fade-in duration-500">
            <h1 className="text-5xl serif font-bold text-white">Hi {userName},</h1>
            <p className="text-white/80">How are you feeling in this moment?</p>
            <div className="space-y-4">
              {["Good", "Okay", "Not So Good"].map(mood => (
                <button 
                  key={mood}
                  onClick={() => handleMoodSelect(mood)}
                  className="w-full py-6 bg-white/80 text-[#7B68A6] text-xl font-bold rounded-3xl shadow-xl transition-all hover:bg-white hover:scale-[1.02] active:scale-95"
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 w-full max-w-lg mx-auto text-center px-6 animate-in fade-in duration-500">
            <h1 className="text-5xl serif font-bold text-white">Tell me more.</h1>
            <p className="text-white/80">What feeling resonates with you most right now?</p>
            <div className="grid grid-cols-2 gap-4">
              {feelings.map(feeling => (
                <button 
                  key={feeling}
                  onClick={() => handleFeelingSelect(feeling)}
                  className="py-5 bg-white/80 text-[#7B68A6] font-bold rounded-3xl shadow-xl transition-all hover:bg-white hover:scale-[1.02] active:scale-95"
                >
                  {feeling}
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-12 w-full max-w-md mx-auto text-center px-6 animate-in fade-in duration-500">
            <h1 className="text-4xl serif font-bold text-white">Thank you for being honest.</h1>
            <div className="space-y-8 py-10">
              <p className="text-2xl text-white italic serif leading-relaxed">
                "Awareness is the first step to transformation."
              </p>
              <div className="h-px bg-white/20 w-12 mx-auto" />
              <p className="text-2xl text-white italic serif leading-relaxed">
                "When you change how you see money, money changes how it shows up for you."
              </p>
            </div>
            <div className="fixed bottom-10 left-6 right-6">
              <button 
                onClick={() => setStep(5)}
                className="w-full py-5 bg-white/90 text-[#7B68A6] font-bold rounded-full shadow-2xl transition-all active:scale-95"
              >
                Continue
              </button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-12 w-full max-w-md mx-auto text-center px-6 animate-in fade-in duration-500">
            <h1 className="text-5xl serif font-bold text-white">{userName},</h1>
            <div className="min-h-[150px] flex items-center justify-center">
              {isLoadingAi ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  <p className="text-white/60 text-sm">Aligning your focus...</p>
                </div>
              ) : (
                <p className="text-2xl text-white serif leading-relaxed italic">
                  {aiMessage}
                </p>
              )}
            </div>
            <div className="fixed bottom-10 left-6 right-6">
              <button 
                onClick={() => setStep(6)}
                className="w-full py-5 bg-white/90 text-[#7B68A6] font-bold rounded-full shadow-2xl transition-all active:scale-95"
              >
                Continue
              </button>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-10 w-full max-w-md mx-auto text-center px-6 animate-in fade-in duration-500">
            <div className="flex justify-center">
              <ButterflyIcon size={80} className="text-white/60" />
            </div>
            <div className="space-y-8 py-4">
              {isLoadingAi ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  <p className="text-white/60 text-sm">Personalizing your path...</p>
                </div>
              ) : (
                aiAffirmations.map((aff, i) => (
                  <p key={i} className="text-xl text-white serif italic leading-relaxed">
                    "{aff}"
                  </p>
                ))
              )}
            </div>
            <div className="fixed bottom-10 left-6 right-6">
              <button 
                onClick={() => setStep(7)}
                className="w-full py-5 bg-white/90 text-[#7B68A6] font-bold rounded-full shadow-2xl transition-all active:scale-95"
              >
                Let's Begin
              </button>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center px-6 text-center animate-in fade-in duration-1000">
            <button 
              onClick={() => onComplete({ userName, userMood, userFeeling, isPremium: false, trialStartDate: null })}
              className="absolute top-10 left-6 p-2 text-white/60 hover:text-white transition-colors"
            >
              <X size={28} />
            </button>
            
            <div className="mb-10">
              <ButterflyIcon size={64} className="text-white/80" />
            </div>

            <h1 className="text-4xl serif font-bold text-white mb-6">Unlock Your Full Financial Potential</h1>
            <p className="text-white/80 mb-12">Premium AI features designed to accelerate your financial wellness journey.</p>

            <div className="space-y-6 text-left w-full max-w-sm mx-auto mb-16">
              {[
                "AI-powered weekly financial priorities based on YOUR numbers",
                "Personalized affirmations that evolve with your goals",
                "5-day free trial — explore everything risk-free",
                "Cancel anytime, no questions asked"
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-4 text-white">
                  <div className="p-1 bg-white/20 rounded-full mt-1">
                    <Check size={16} className="text-white" />
                  </div>
                  <span className="text-lg">{feat}</span>
                </div>
              ))}
            </div>

            <div className="w-full max-w-sm space-y-6">
              <div className="text-white font-bold">5-day free trial, then just $5.99/month</div>
              <button 
                onClick={() => onComplete({ 
                  userName, 
                  userMood, 
                  userFeeling, 
                  isPremium: true, 
                  trialStartDate: new Date().toISOString() 
                })}
                className="w-full py-5 bg-white/90 text-[#7B68A6] font-bold rounded-full shadow-2xl transition-all active:scale-95"
              >
                Start My Free Trial
              </button>
              <div className="text-[10px] text-white/40 uppercase tracking-widest flex justify-center gap-4">
                <button className="hover:text-white">Terms of Service</button>
                <button className="hover:text-white">Restore</button>
                <button className="hover:text-white">Privacy Policy</button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-gradient-to-b from-[#7B68A6] via-[#9B8EC4] to-[#B19CD9] flex items-center justify-center overflow-hidden">
      {renderStep()}
    </div>
  );
};

export default PremiumOnboarding;
