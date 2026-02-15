
import React, { useState } from 'react';
import { Sparkles, Sun, DollarSign, Heart, ChevronRight } from 'lucide-react';
import { UserDailyMetrics } from '../types';
import ButterflyIcon from './ButterflyIcon';

interface MorningAlignmentModalProps {
  onComplete: (metrics: Partial<UserDailyMetrics>) => void;
  userName?: string;
}

const MorningAlignmentModal: React.FC<MorningAlignmentModalProps> = ({ onComplete, userName }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    intention_text: '',
    focus_commitment: '',
    financial_action_text: '',
    self_trust_statement: '',
    energy_level: 5
  });

  const handleComplete = () => {
    onComplete({
      ...formData,
      morning_alignment_completed: true
    });
  };

  const steps = [
    {
      title: "Set Your Intention",
      subtitle: "How do you want to feel today?",
      icon: <Sun size={24} className="text-[#B19CD9]" />,
      field: (
        <input
          autoFocus
          className="w-full p-4 bg-[#F8F7FC] border border-[#E6D5F0] rounded-2xl outline-none focus:ring-2 focus:ring-[#B19CD9] text-sm"
          placeholder="e.g. Peaceful and productive..."
          value={formData.intention_text}
          onChange={(e) => setFormData({ ...formData, intention_text: e.target.value })}
        />
      )
    },
    {
      title: "Daily Commitment",
      subtitle: "What is your non-negotiable focus today?",
      icon: <Sparkles size={24} className="text-[#B19CD9]" />,
      field: (
        <input
          autoFocus
          className="w-full p-4 bg-[#F8F7FC] border border-[#E6D5F0] rounded-2xl outline-none focus:ring-2 focus:ring-[#B19CD9] text-sm"
          placeholder="e.g. Completing the project plan..."
          value={formData.focus_commitment}
          onChange={(e) => setFormData({ ...formData, focus_commitment: e.target.value })}
        />
      )
    },
    {
      title: "Financial Move",
      subtitle: "One tiny step toward financial freedom.",
      icon: <DollarSign size={24} className="text-[#B19CD9]" />,
      field: (
        <input
          autoFocus
          className="w-full p-4 bg-[#F8F7FC] border border-[#E6D5F0] rounded-2xl outline-none focus:ring-2 focus:ring-[#B19CD9] text-sm"
          placeholder="e.g. Transfer $10 to savings..."
          value={formData.financial_action_text}
          onChange={(e) => setFormData({ ...formData, financial_action_text: e.target.value })}
        />
      )
    },
    {
      title: "Self-Trust & Energy",
      subtitle: "Ground yourself before the day begins.",
      icon: <Heart size={24} className="text-[#B19CD9]" />,
      field: (
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Self-Trust Statement</p>
            <input
              className="w-full p-4 bg-[#F8F7FC] border border-[#E6D5F0] rounded-2xl outline-none focus:ring-2 focus:ring-[#B19CD9] text-sm"
              placeholder="e.g. I trust my ability to handle challenges..."
              value={formData.self_trust_statement}
              onChange={(e) => setFormData({ ...formData, self_trust_statement: e.target.value })}
            />
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Energy Level ({formData.energy_level}/10)</p>
            <input
              type="range"
              min="1"
              max="10"
              className="w-full h-2 bg-[#E6D5F0] rounded-lg appearance-none cursor-pointer accent-[#B19CD9]"
              value={formData.energy_level}
              onChange={(e) => setFormData({ ...formData, energy_level: Number(e.target.value) })}
            />
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
              <span>Low</span>
              <span>Elevated</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="flex-1 flex flex-col bg-[#F8F7FC]" style={{ minHeight: '100%' }}>
      {/* Header */}
      <div className="bg-gradient-to-b from-[#7B68A6] to-[#9B8EC4] pt-12 pb-8 px-6 text-center">
        <ButterflyIcon size={36} className="text-white/80 mx-auto mb-3" />
        <h1 className="text-2xl serif font-bold text-white">
          {step === 0 ? `Welcome${userName ? `, ${userName}` : ''}` : currentStep.title}
        </h1>
        <p className="text-white/70 text-sm italic mt-1">{currentStep.subtitle}</p>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 py-4">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${i === step ? 'w-8 bg-[#B19CD9]' : 'w-2 bg-[#E6D5F0]'}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#eee]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#E6D5F0] rounded-xl">{currentStep.icon}</div>
            <h2 className="serif text-lg font-bold text-[#7B68A6]">{currentStep.title}</h2>
          </div>
          {currentStep.field}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-8 flex items-center justify-between">
        {step > 0 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="px-5 py-3 font-bold text-gray-400 text-sm"
          >
            Back
          </button>
        ) : (
          <div />
        )}
        {isLast ? (
          <button
            onClick={handleComplete}
            className="px-8 py-3 bg-[#7B68A6] text-white font-bold rounded-2xl shadow-md text-sm"
          >
            Start My Day
          </button>
        ) : (
          <button
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-2 px-8 py-3 bg-[#B19CD9] text-white font-bold rounded-2xl shadow-md text-sm"
          >
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MorningAlignmentModal;
