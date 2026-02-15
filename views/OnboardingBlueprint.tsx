
import React, { useState } from 'react';
import { Sparkles, ChevronRight, ChevronLeft, Sun, Target, Heart, BookOpen, Clock } from 'lucide-react';
import ButterflyIcon from '../components/ButterflyIcon';
import { BlueprintData } from '../types';

interface Props {
  onComplete: (data: BlueprintData) => void;
}

const OnboardingBlueprint: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<BlueprintData>({
    completed: false,
    motivation: '',
    overarchingGoal: '',
    mindsetIssue: '',
    smallGoals: ['', '', ''],
    pastGrowthExperience: '',
    currentMorningRoutine: '',
    wakeupFeeling: '',
    desiredWakeupFeeling: '',
    morningRitual: [
      { time: '6:30am', activity: '' },
      { time: '7:00am', activity: '' },
      { time: '7:30am', activity: '' }
    ],
    topIntentions: ['', '']
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => Math.max(0, s - 1));

  const steps = [
    {
      id: 'welcome',
      title: 'Mindset & Morning Reset',
      subtitle: 'Workbook 1',
      content: (
        <div className="text-center space-y-8 py-12">
          <div className="inline-block p-4 bg-[#B19CD9]/10 rounded-full mb-4">
            <ButterflyIcon size={64} className="text-[#B19CD9]" />
          </div>
          <h2 className="text-5xl serif font-bold text-[#7B68A6]">You Are Royalty.</h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto italic">
            "You're here because you want to get to the next level. Spend time thinking through this blueprint—the biggest shifts in our lives happen when we are open to them."
          </p>
          <button 
            onClick={nextStep}
            className="mt-8 px-10 py-4 bg-[#B19CD9] text-white font-bold rounded-full shadow-xl shadow-[#B19CD9]/30 hover:bg-[#7B68A6] transition-all"
          >
            Begin Your Journey
          </button>
        </div>
      )
    },
    {
      id: 'motivation',
      title: 'Identify Your Why',
      icon: <Target className="text-[#B19CD9]" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-500 italic">What motivated you to invest in upleveling your mindset now? It's important to identify up front why you're doing this.</p>
          <textarea 
            className="w-full h-40 p-6 bg-white border border-[#E6D5F0] rounded-2xl outline-none focus:ring-2 focus:ring-[#B19CD9] transition-all resize-none shadow-sm"
            placeholder="I want to achieve financial freedom and feel more powerful in my daily choices..."
            value={formData.motivation}
            onChange={e => setFormData({...formData, motivation: e.target.value})}
          />
        </div>
      )
    },
    {
      id: 'goals',
      title: 'The Overarching Goal',
      icon: <ButterflyIcon className="text-[#D4AF37]" />,
      content: (
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Most Important Goal & #1 Mindset Issue</label>
            <textarea 
              className="w-full h-32 p-4 bg-white border border-[#E6D5F0] rounded-xl outline-none focus:ring-2 focus:ring-[#B19CD9] shadow-sm"
              placeholder="Overarching Goal: Buying a house. Mindset Issue: Scarcity thinking..."
              value={formData.overarchingGoal}
              onChange={e => setFormData({...formData, overarchingGoal: e.target.value})}
            />
          </div>
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">3-5 Smaller Priorities</label>
            {formData.smallGoals.map((g, i) => (
              <input 
                key={i}
                className="w-full p-4 bg-white border border-[#E6D5F0] rounded-xl outline-none focus:ring-2 focus:ring-[#B19CD9] shadow-sm"
                placeholder={`Goal ${i+1}`}
                value={g}
                onChange={e => {
                  const newGoals = [...formData.smallGoals];
                  newGoals[i] = e.target.value;
                  setFormData({...formData, smallGoals: newGoals});
                }}
              />
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'history',
      title: 'Reflection & Current State',
      icon: <BookOpen className="text-[#7B68A6]" />,
      content: (
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Past Development Work</label>
            <textarea 
              className="w-full h-32 p-4 bg-white border border-[#E6D5F0] rounded-xl outline-none focus:ring-2 focus:ring-[#B19CD9] shadow-sm"
              placeholder="What worked or didn't work for you before?"
              value={formData.pastGrowthExperience}
              onChange={e => setFormData({...formData, pastGrowthExperience: e.target.value})}
            />
          </div>
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Current Morning Routine</label>
            <textarea 
              className="w-full h-32 p-4 bg-white border border-[#E6D5F0] rounded-xl outline-none focus:ring-2 focus:ring-[#B19CD9] shadow-sm"
              placeholder="Do you meditate? Journal? Work out? Describe your mornings."
              value={formData.currentMorningRoutine}
              onChange={e => setFormData({...formData, currentMorningRoutine: e.target.value})}
            />
          </div>
        </div>
      )
    },
    {
      id: 'feelings',
      title: 'How You Wake Up',
      icon: <Sun className="text-[#D4AF37]" />,
      content: (
        <div className="space-y-8">
          <div className="space-y-4 text-center">
            <p className="text-gray-500 italic">"How do you feel when you wake up? Do you feel pumped? Or could it improve?"</p>
            <textarea 
              className="w-full h-24 p-4 bg-white border border-[#E6D5F0] rounded-xl outline-none focus:ring-2 focus:ring-[#B19CD9] shadow-sm"
              placeholder="I usually feel tired and rushed..."
              value={formData.wakeupFeeling}
              onChange={e => setFormData({...formData, wakeupFeeling: e.target.value})}
            />
          </div>
          <div className="space-y-4 text-center">
            <p className="text-gray-500 font-bold">How DO you want to feel?</p>
            <input 
              className="w-full p-4 bg-white border border-[#E6D5F0] rounded-xl outline-none focus:ring-2 focus:ring-[#B19CD9] shadow-sm text-center font-bold text-[#7B68A6]"
              placeholder="ELEVATED, CALM, READY"
              value={formData.desiredWakeupFeeling}
              onChange={e => setFormData({...formData, desiredWakeupFeeling: e.target.value})}
            />
          </div>
        </div>
      )
    },
    {
      id: 'ritual',
      title: 'Plan Your Morning Ritual',
      icon: <Clock className="text-[#B19CD9]" />,
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-400 italic mb-4">Let's map out your ideal morning flow to test and tweak as you go.</p>
          <div className="space-y-4">
            {formData.morningRitual.map((item, i) => (
              <div key={i} className="flex gap-4">
                <input 
                  className="w-24 p-4 bg-[#F8F7FC] border border-[#E6D5F0] rounded-xl outline-none focus:ring-2 focus:ring-[#B19CD9] text-xs font-bold"
                  value={item.time}
                  onChange={e => {
                    const newRitual = [...formData.morningRitual];
                    newRitual[i].time = e.target.value;
                    setFormData({...formData, morningRitual: newRitual});
                  }}
                />
                <input 
                  className="flex-1 p-4 bg-white border border-[#E6D5F0] rounded-xl outline-none focus:ring-2 focus:ring-[#B19CD9] shadow-sm"
                  placeholder="Activity (e.g., Meditate, Walk Dog...)"
                  value={item.activity}
                  onChange={e => {
                    const newRitual = [...formData.morningRitual];
                    newRitual[i].activity = e.target.value;
                    setFormData({...formData, morningRitual: newRitual});
                  }}
                />
              </div>
            ))}
            <button 
              onClick={() => setFormData({...formData, morningRitual: [...formData.morningRitual, {time: '8:00am', activity: ''}]})}
              className="text-[#7B68A6] text-xs font-bold hover:underline"
            >
              + Add Another Activity
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'intentions',
      title: 'Final Intentions',
      icon: <Heart className="text-red-400" />,
      content: (
        <div className="space-y-8 text-center">
          <p className="text-gray-500 italic">"Set your TOP 2 intentions for the program (e.g., Joy, Clarity, Better Habits)."</p>
          {formData.topIntentions.map((intent, i) => (
            <input 
              key={i}
              className="w-full p-6 bg-white border border-[#E6D5F0] rounded-2xl outline-none focus:ring-2 focus:ring-[#B19CD9] shadow-sm text-center text-2xl serif italic text-[#7B68A6]"
              placeholder={`Intention ${i+1}`}
              value={intent}
              onChange={e => {
                const newIntents = [...formData.topIntentions];
                newIntents[i] = e.target.value;
                setFormData({...formData, topIntentions: newIntents});
              }}
            />
          ))}
          <div className="pt-10">
            <button 
              onClick={() => onComplete({...formData, completed: true})}
              className="w-full py-5 bg-[#7B68A6] text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
            >
              <ButterflyIcon /> Activate My Blueprint
            </button>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="flex-1 flex items-center justify-center bg-[#F8F7FC] p-4">
      <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl border border-[#eee] overflow-hidden animate-in fade-in duration-1000">
        <div className="relative p-10">
          {step > 0 && (
            <div className="flex items-center justify-between mb-8">
              <button onClick={prevStep} className="p-2 hover:bg-[#F8F7FC] rounded-full transition-colors text-gray-400">
                <ChevronLeft size={24} />
              </button>
              <div className="flex gap-1.5">
                {steps.slice(1).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all ${step === i + 1 ? 'w-8 bg-[#B19CD9]' : 'w-2 bg-[#E6D5F0]'}`} 
                  />
                ))}
              </div>
              <div className="w-10 h-10" />
            </div>
          )}

          <div className="text-center mb-10">
            {currentStep.icon && <div className="inline-block p-3 bg-[#F8F7FC] rounded-2xl mb-4">{currentStep.icon}</div>}
            <h1 className="text-3xl serif font-bold text-[#7B68A6]">{currentStep.title}</h1>
            {currentStep.subtitle && <p className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mt-1">{currentStep.subtitle}</p>}
          </div>

          <div className="min-h-[400px]">
            {currentStep.content}
          </div>

          {step > 0 && step < steps.length - 1 && (
            <div className="mt-12 flex justify-end">
              <button 
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-4 bg-[#B19CD9] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                Next <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-[#B19CD9] h-2 w-full" style={{ width: `${(step / (steps.length - 1)) * 100}%` }} />
      </div>

      <div className="fixed bottom-6 right-6 opacity-40 pointer-events-none text-xs font-bold text-[#7B68A6] uppercase tracking-[0.5em]">
        Become A Powerful Creator
      </div>
    </div>
  );
};

export default OnboardingBlueprint;
