
import React, { useState } from 'react';
import { X, Sparkles, Sun, DollarSign, Heart, ChevronRight } from 'lucide-react';
import { UserDailyMetrics } from '../types';

interface MorningAlignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (metrics: Partial<UserDailyMetrics>) => void;
  initialData?: UserDailyMetrics;
}

const MorningAlignmentModal: React.FC<MorningAlignmentModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    intention_text: initialData?.intention_text || '',
    focus_commitment: initialData?.focus_commitment || '',
    financial_action_text: initialData?.financial_action_text || '',
    self_trust_statement: initialData?.self_trust_statement || '',
    energy_level: initialData?.energy_level || 5
  });

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...formData,
      morning_alignment_completed: true
    });
    onClose();
  };

  const steps = [
    {
      title: "Set Your Intention",
      icon: <Sun className="text-[#B19CD9]" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 italic">"How do you want to feel today?"</p>
          <input
            autoFocus
            className="w-full p-4 bg-[#F8F7FC] border border-[#E6D5F0] rounded-2xl outline-none focus:ring-2 focus:ring-[#B19CD9] transition-all"
            placeholder="e.g. Peaceful and productive..."
            value={formData.intention_text}
            onChange={(e) => setFormData({ ...formData, intention_text: e.target.value })}
          />
        </div>
      )
    },
    {
      title: "Daily Commitment",
      icon: <Sparkles className="text-[#B19CD9]" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 italic">"What is your non-negotiable focus today?"</p>
          <input
            autoFocus
            className="w-full p-4 bg-[#F8F7FC] border border-[#E6D5F0] rounded-2xl outline-none focus:ring-2 focus:ring-[#B19CD9] transition-all"
            placeholder="e.g. Completing the project plan..."
            value={formData.focus_commitment}
            onChange={(e) => setFormData({ ...formData, focus_commitment: e.target.value })}
          />
        </div>
      )
    },
    {
      title: "Financial Move",
      icon: <DollarSign className="text-[#B19CD9]" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 italic">"One tiny step toward financial freedom."</p>
          <input
            autoFocus
            className="w-full p-4 bg-[#F8F7FC] border border-[#E6D5F0] rounded-2xl outline-none focus:ring-2 focus:ring-[#B19CD9] transition-all"
            placeholder="e.g. Transfer $10 to savings..."
            value={formData.financial_action_text}
            onChange={(e) => setFormData({ ...formData, financial_action_text: e.target.value })}
          />
        </div>
      )
    },
    {
      title: "Self-Trust & Energy",
      icon: <Heart className="text-[#B19CD9]" />,
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase text-gray-400 tracking-widest">Self-Trust Statement</p>
            <input
              className="w-full p-4 bg-[#F8F7FC] border border-[#E6D5F0] rounded-2xl outline-none focus:ring-2 focus:ring-[#B19CD9]"
              placeholder="e.g. I trust my ability to handle challenges..."
              value={formData.self_trust_statement}
              onChange={(e) => setFormData({ ...formData, self_trust_statement: e.target.value })}
            />
          </div>
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase text-gray-400 tracking-widest">Energy Level ({formData.energy_level}/10)</p>
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

  const currentStep = steps[step - 1];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#E6D5F0] rounded-xl">{currentStep.icon}</div>
              <h2 className="serif text-2xl font-bold text-[#7B68A6]">{currentStep.title}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="min-h-[200px]">
            {currentStep.content}
          </div>

          <div className="mt-12 flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all ${step === i + 1 ? 'w-8 bg-[#B19CD9]' : 'w-2 bg-[#E6D5F0]'}`} 
                />
              ))}
            </div>
            <div className="flex gap-3">
              {step > 1 && (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 font-bold text-gray-400 hover:text-[#7B68A6] transition-colors"
                >
                  Back
                </button>
              )}
              {step < steps.length ? (
                <button 
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-2 px-8 py-3 bg-[#B19CD9] text-white font-bold rounded-2xl hover:bg-[#7B68A6] transition-all shadow-lg shadow-[#B19CD9]/20"
                >
                  Next <ChevronRight size={18} />
                </button>
              ) : (
                <button 
                  onClick={handleSave}
                  className="px-8 py-3 bg-[#7B68A6] text-white font-bold rounded-2xl hover:shadow-xl transition-all shadow-lg shadow-[#7B68A6]/20"
                >
                  Save & Start Day
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MorningAlignmentModal;
