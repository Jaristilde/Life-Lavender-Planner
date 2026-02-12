
import React, { useState, useEffect } from 'react';
import { YearData, Priority } from '../types';
import { Sparkles, Heart, ChevronRight, CheckCircle2, Circle, Droplets, Dumbbell, Coffee, Sunrise, Trash2, Plus } from 'lucide-react';
import { generatePersonalizedAffirmations } from '../services/geminiService';

interface MorningResetProps {
  data: YearData;
  updateData: (d: YearData) => void;
  isPremium: boolean;
  userName: string;
}

const MorningReset: React.FC<MorningResetProps> = ({ data, updateData, isPremium, userName }) => {
  const today = new Date().toISOString().split('T')[0];
  const [greeting, setGreeting] = useState('');
  const [loadingAffirmation, setLoadingAffirmation] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Initialize today's morning reset if not exists
  useEffect(() => {
    if (!data.dailyMorningResets[today]) {
      const initialReset = {
        affirmationShown: data.affirmations[Math.floor(Math.random() * data.affirmations.length)],
        spending: 0,
        financialIntention: '',
        financialGratitude: '',
        priorities: data.wellness.dailyToDos.slice(0, 3).map(t => ({ id: t.id, text: t.text, completed: t.completed, priority: t.priority })),
        mood: '😊',
        waterIntake: 0,
        movement: false,
        movementMinutes: 0,
        dailyIntention: ''
      };
      updateData({
        ...data,
        dailyMorningResets: { ...data.dailyMorningResets, [today]: initialReset }
      });
    }
  }, [today, data, updateData]);

  const reset = data.dailyMorningResets[today] || {
    affirmationShown: '',
    spending: 0,
    financialIntention: '',
    financialGratitude: '',
    priorities: [],
    mood: '😊',
    waterIntake: 0,
    movement: false,
    movementMinutes: 0,
    dailyIntention: ''
  };

  const updateReset = (updates: Partial<typeof reset>) => {
    updateData({
      ...data,
      dailyMorningResets: {
        ...data.dailyMorningResets,
        [today]: { ...reset, ...updates }
      }
    });
  };

  const generateNewAffirmation = async () => {
    if (!isPremium) return;
    setLoadingAffirmation(true);
    const results = await generatePersonalizedAffirmations(userName, 'Good', 'Confidence');
    if (results.length > 0) {
      updateReset({ affirmationShown: results[0] });
    }
    setLoadingAffirmation(false);
  };

  const togglePriority = (id: string) => {
    // Update local priorities
    const newPriorities = reset.priorities.map(p => p.id === id ? { ...p, completed: !p.completed } : p);
    updateReset({ priorities: newPriorities });

    // Sync with main to-do list
    const newWellnessToDos = data.wellness.dailyToDos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    updateData({
      ...data,
      wellness: { ...data.wellness, dailyToDos: newWellnessToDos }
    });
  };

  const weeklyFinancialPriority = data.financial.weeklyPriorities.length > 0 
    ? data.financial.weeklyPriorities[0].text 
    : "Stay mindful of your spending today.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F7FC] to-[#E6D5F0]/20 pb-32 animate-in fade-in duration-700">
      <div className="max-w-3xl mx-auto pt-8 px-6 space-y-12">
        {/* Header */}
        <header className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold serif text-[#7B68A6]">{greeting}, {userName}</h1>
            <p className="text-gray-400 font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="p-3 bg-white rounded-2xl shadow-sm text-[#B19CD9]">
            <Sunrise size={28} />
          </div>
        </header>

        {/* Section 1: Affirmation Card */}
        <section className="paper-card p-10 bg-white border-[#E6D5F0] relative overflow-hidden group">
          <Sparkles size={120} className="absolute -right-10 -bottom-10 text-[#7B68A6]/5 group-hover:scale-110 transition-transform duration-1000" />
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-[#7B68A6]">Daily Affirmation</h3>
             <button className="p-2 hover:bg-[#F8F7FC] rounded-full text-[#B19CD9] transition-all">
                <Heart size={20} />
             </button>
          </div>
          <p className="text-2xl md:text-3xl serif italic text-[#3D2D7C] leading-tight mb-10 text-center">
            "{reset.affirmationShown || 'I am focused on my growth.'}"
          </p>
          <div className="flex justify-center">
            {isPremium && (
              <button 
                onClick={generateNewAffirmation}
                disabled={loadingAffirmation}
                className="flex items-center gap-2 px-6 py-2 bg-[#E6D5F0] text-[#7B68A6] font-bold rounded-full text-xs hover:bg-[#B19CD9] hover:text-white transition-all shadow-sm disabled:opacity-50"
              >
                <Sparkles size={14} /> {loadingAffirmation ? 'Generating...' : 'Generate New Affirmation'}
              </button>
            )}
          </div>
        </section>

        {/* Section 2: Morning Money Check-In */}
        <section className="space-y-6">
           <h2 className="text-xl serif font-bold text-[#7B68A6] px-2 flex items-center gap-2">
             <Coffee size={20} className="text-[#B19CD9]" /> Today's Money Minute
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="paper-card p-6 bg-white flex flex-col items-center text-center">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Yesterday I spent</span>
                 <div className="relative">
                   <span className="absolute -left-4 top-0 font-bold text-gray-400">$</span>
                   <input 
                    type="number"
                    className="bg-transparent border-none outline-none font-bold text-3xl text-[#7B68A6] w-24 text-center"
                    placeholder="0"
                    value={reset.spending || ''}
                    onChange={(e) => updateReset({ spending: Number(e.target.value) })}
                   />
                 </div>
              </div>
              <div className="paper-card p-6 bg-white flex flex-col items-center text-center md:col-span-2">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">One Financial Intention</span>
                 <input 
                  className="w-full bg-transparent border-none outline-none text-center font-bold text-[#7B68A6] placeholder:text-gray-300 italic"
                  placeholder="e.g. Bringing my lunch today"
                  value={reset.financialIntention}
                  onChange={(e) => updateReset({ financialIntention: e.target.value })}
                 />
              </div>
              <div className="paper-card p-6 bg-white flex flex-col items-center text-center md:col-span-3">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">I'm grateful for (Money/Abundance)</span>
                 <input 
                  className="w-full bg-transparent border-none outline-none text-center font-bold text-[#7B68A6] placeholder:text-gray-300 italic"
                  placeholder="e.g. My stable income"
                  value={reset.financialGratitude}
                  onChange={(e) => updateReset({ financialGratitude: e.target.value })}
                 />
              </div>
           </div>
        </section>

        {/* Section 3: Today's Priorities */}
        <section className="space-y-6">
           <h2 className="text-xl serif font-bold text-[#7B68A6] px-2">Top 3 Priorities</h2>
           <div className="space-y-3">
              {reset.priorities.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => togglePriority(task.id)}
                  className={`paper-card p-5 bg-white flex items-center gap-4 transition-all cursor-pointer hover:border-[#B19CD9] ${task.completed ? 'opacity-60' : ''}`}
                >
                  <div className={`w-3 h-3 rounded-full ${task.priority === 'high' ? 'bg-[#D4AF37]' : task.priority === 'medium' ? 'bg-[#B19CD9]' : 'bg-gray-300'}`} />
                  <span className={`flex-1 font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {task.text}
                  </span>
                  <div className={`transition-all ${task.completed ? 'text-[#10B981]' : 'text-gray-200'}`}>
                    {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </div>
                </div>
              ))}
              <div className="pt-2 text-center">
                <button className="text-xs font-bold text-[#7B68A6] hover:underline flex items-center gap-2 mx-auto">
                   <Plus size={14} /> Add new priority
                </button>
              </div>
           </div>
        </section>

        {/* Section 4: Wellness Quick-Log */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="paper-card p-8 bg-white space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#7B68A6]">How am I feeling?</h3>
              <div className="flex justify-around">
                 {['😊', '😐', '😔', '💪', '😴'].map(m => (
                   <button 
                    key={m}
                    onClick={() => updateReset({ mood: m })}
                    className={`text-3xl p-2 rounded-2xl transition-all ${reset.mood === m ? 'bg-[#E6D5F0] scale-110' : 'grayscale hover:grayscale-0'}`}
                   >
                     {m}
                   </button>
                 ))}
              </div>
           </div>

           <div className="paper-card p-8 bg-white space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#7B68A6]">Water Intake</h3>
                <span className="text-xs font-bold text-[#B19CD9]">{reset.waterIntake}/8</span>
              </div>
              <div className="flex justify-center gap-2">
                 {Array.from({ length: 8 }).map((_, i) => (
                   <button 
                    key={i}
                    onClick={() => updateReset({ waterIntake: i + 1 === reset.waterIntake ? i : i + 1 })}
                    className={`transition-all ${i < reset.waterIntake ? 'text-[#3B82F6]' : 'text-gray-100'}`}
                   >
                     <Droplets size={24} fill={i < reset.waterIntake ? 'currentColor' : 'none'} />
                   </button>
                 ))}
              </div>
           </div>

           <div className="paper-card p-8 bg-white flex items-center justify-between md:col-span-2">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                    <Dumbbell size={24} />
                 </div>
                 <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-700">Movement today?</h3>
                    <p className="text-xs text-gray-400">{reset.movement ? 'Ready to sweat!' : 'Not yet logged'}</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <button 
                  onClick={() => updateReset({ movement: !reset.movement })}
                  className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${reset.movement ? 'bg-[#10B981] text-white' : 'bg-[#F8F7FC] text-gray-400'}`}
                 >
                   {reset.movement ? 'Yes' : 'No'}
                 </button>
                 {reset.movement && (
                   <div className="flex items-center gap-2 border-l pl-4">
                      <input 
                        type="number"
                        className="w-12 bg-transparent border-none outline-none text-center font-bold text-[#7B68A6]"
                        value={reset.movementMinutes || ''}
                        onChange={(e) => updateReset({ movementMinutes: Number(e.target.value) })}
                      />
                      <span className="text-xs font-bold text-gray-400">mins</span>
                   </div>
                 )}
              </div>
           </div>
        </section>

        {/* Section 5: Daily Intention */}
        <section className="paper-card p-10 bg-[#7B68A6] text-white space-y-8">
           <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/60">My intention for today:</label>
              <textarea 
                className="w-full bg-transparent border-b border-white/20 outline-none text-2xl serif italic placeholder:text-white/20 resize-none h-20"
                placeholder="I am walking with confidence..."
                value={reset.dailyIntention}
                onChange={(e) => updateReset({ dailyIntention: e.target.value })}
              />
           </div>
           <div className="pt-4 border-t border-white/10 flex items-start gap-4">
              <Sparkles className="shrink-0 text-[#D4AF37]" size={20} />
              <div className="space-y-1">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Weekly Financial Focus</span>
                 <p className="text-sm font-medium">{weeklyFinancialPriority}</p>
              </div>
           </div>
        </section>

        {/* Footer */}
        <footer className="text-center pb-20 pt-10">
           <p className="text-2xl serif italic text-[#7B68A6]">Have a beautiful day, {userName}.</p>
           <button className="mt-8 text-xs font-bold text-[#B19CD9] uppercase tracking-widest hover:underline flex items-center gap-2 mx-auto transition-all">
             Open Full Planner <ChevronRight size={14} />
           </button>
        </footer>
      </div>
    </div>
  );
};

export default MorningReset;
