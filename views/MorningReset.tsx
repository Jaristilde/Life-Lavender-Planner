import React, { useState, useEffect } from 'react';
import { YearData, UserDailyMetrics, Priority } from '../types';
import { DEFAULT_DAILY_METRICS } from '../constants';
import {
  Sparkles, Heart, CheckCircle2, Circle, Droplets, Dumbbell,
  Sunrise, Trash2, Plus, Coffee, DollarSign
} from 'lucide-react';
import { generatePersonalizedAffirmations } from '../services/geminiService';
import MicButton from '../components/MicButton';

interface MorningResetProps {
  data: YearData;
  updateData: (d: YearData) => void;
  isPremium: boolean;
  userName: string;
}

const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  setTimeout(() => {
    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
};

const MorningReset: React.FC<MorningResetProps> = ({ data, updateData, isPremium, userName }) => {
  const today = new Date().toISOString().split('T')[0];
  const [greeting, setGreeting] = useState('');
  const [loadingAffirmation, setLoadingAffirmation] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Initialize today's metrics if not exists
  useEffect(() => {
    if (data && !data?.dailyMetrics?.[today]) {
      const affirmations = data?.affirmations || [];
      const defaults = DEFAULT_DAILY_METRICS(today);
      const initialMetrics: UserDailyMetrics = {
        ...defaults,
        affirmation_shown: affirmations.length > 0
          ? affirmations[Math.floor(Math.random() * affirmations.length)]
          : 'I am focused on my growth.',
      };
      updateData({
        ...data,
        dailyMetrics: { ...(data?.dailyMetrics || {}), [today]: initialMetrics }
      });
    }
  }, [today]);

  const metrics: UserDailyMetrics = { ...DEFAULT_DAILY_METRICS(today), ...(data?.dailyMetrics?.[today] || {}) };

  const updateMetrics = (updates: Partial<UserDailyMetrics>) => {
    updateData({
      ...data,
      dailyMetrics: {
        ...(data?.dailyMetrics || {}),
        [today]: { ...metrics, ...updates }
      }
    });
  };

  const generateNewAffirmation = async () => {
    if (!isPremium) return;
    setLoadingAffirmation(true);
    const results = await generatePersonalizedAffirmations(userName, 'Good', 'Confidence');
    if (results && results.length > 0) {
      updateMetrics({ affirmation_shown: results[0] });
    }
    setLoadingAffirmation(false);
  };

  const togglePriority = (id: string) => {
    const priorities = metrics.top_priorities || [];
    const newPriorities = priorities.map(p => p.id === id ? { ...p, completed: !p.completed } : p);
    updateMetrics({ top_priorities: newPriorities });
  };

  const updatePriorityText = (id: string, text: string) => {
    const priorities = metrics.top_priorities || [];
    const newPriorities = priorities.map(p => p.id === id ? { ...p, text } : p);
    updateMetrics({ top_priorities: newPriorities });
  };

  const updatePriorityLevel = (id: string, priority: Priority) => {
    const priorities = metrics.top_priorities || [];
    const newPriorities = priorities.map(p => p.id === id ? { ...p, priority } : p);
    updateMetrics({ top_priorities: newPriorities });
  };

  const addPriority = () => {
    const priorities = metrics.top_priorities || [];
    if (priorities.length >= 5) return;
    const newPriority = { id: Math.random().toString(36).substr(2, 9), text: '', completed: false, priority: 'medium' as Priority };
    updateMetrics({ top_priorities: [...priorities, newPriority] });
  };

  const removePriority = (id: string) => {
    const priorities = metrics.top_priorities || [];
    if (priorities.length <= 1) return;
    updateMetrics({ top_priorities: priorities.filter(p => p.id !== id) });
  };

  const getMoodColor = (score: number) => {
    if (score <= 2) return '#EF4444';
    if (score <= 4) return '#F59E0B';
    if (score <= 6) return '#EAB308';
    if (score <= 8) return '#84CC16';
    return '#22C55E';
  };

  const getMoodLabel = (score: number) => {
    if (score <= 2) return 'Struggling';
    if (score <= 4) return 'Low';
    if (score <= 6) return 'Okay';
    if (score <= 8) return 'Good';
    return 'Great';
  };

  const weeklyFinancialPriority = (data?.financial?.weeklyPriorities?.length ?? 0) > 0
    ? data?.financial?.weeklyPriorities?.[0]?.text || "Stay mindful of your spending today."
    : "Stay mindful of your spending today.";

  const sectionTitles = ['Intention', 'Mood', 'Money', 'Priorities', 'Complete'];

  return (
    <div className="flex-1 bg-gradient-to-b from-[#F8F7FC] to-[#E6D5F0]/20 pb-32">
      <div className="max-w-3xl mx-auto pt-8 px-6 space-y-10">
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

        {/* Section Progress */}
        <div className="flex items-center gap-2">
          {sectionTitles.map((title, i) => (
            <button
              key={i}
              onClick={() => setActiveSection(i)}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeSection === i ? 'bg-[#7B68A6] text-white shadow-md' : 'bg-white text-gray-400 hover:text-[#7B68A6]'}`}
            >
              {title}
            </button>
          ))}
        </div>

        {/* Section 1: Core Intention */}
        {activeSection === 0 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <section className="paper-card p-10 bg-white border-[#E6D5F0] relative overflow-hidden group">
              <Sparkles size={120} className="absolute -right-10 -bottom-10 text-[#7B68A6]/5 group-hover:scale-110 transition-transform duration-1000" />
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-[#7B68A6]">Daily Affirmation</h3>
                <button className="p-2 hover:bg-[#F8F7FC] rounded-full text-[#B19CD9] transition-all">
                  <Heart size={20} />
                </button>
              </div>
              <p className="text-2xl md:text-3xl serif italic text-[#3D2D7C] leading-tight mb-10 text-center">
                "{metrics.affirmation_shown || 'I am focused on my growth.'}"
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

            <section className="paper-card p-10 bg-[#7B68A6] text-white space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/60">My intention for today:</label>
                <div className="relative">
                  <textarea
                    className="w-full bg-transparent border-b border-white/20 outline-none text-2xl serif italic placeholder:text-white/20 resize-none h-20 pr-12"
                    placeholder="I am walking with confidence..."
                    value={metrics.daily_intention || ''}
                    onFocus={handleInputFocus}
                    onChange={(e) => updateMetrics({ daily_intention: e.target.value })}
                  />
                  <div className="absolute right-0 top-0">
                    <MicButton onTranscript={(text) => updateMetrics({ daily_intention: (metrics.daily_intention ? metrics.daily_intention + ' ' : '') + text })} className="text-white/40 hover:text-white hover:bg-white/20" />
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-start gap-4">
                <Sparkles className="shrink-0 text-[#D4AF37]" size={20} />
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Weekly Financial Focus</span>
                  <p className="text-sm font-medium">{weeklyFinancialPriority}</p>
                </div>
              </div>
            </section>

            <div className="flex justify-end">
              <button onClick={() => setActiveSection(1)} className="px-8 py-3 bg-[#7B68A6] text-white font-bold rounded-2xl hover:bg-[#B19CD9] transition-all shadow-md">
                Next: Mood Check →
              </button>
            </div>
          </div>
        )}

        {/* Section 2: Emotional Check */}
        {activeSection === 1 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <section className="paper-card p-10 bg-white space-y-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#7B68A6]">How am I feeling today?</h3>
              <div className="text-center space-y-6">
                <div className="text-6xl font-bold" style={{ color: getMoodColor(metrics.mood_score ?? 5) }}>
                  {metrics.mood_score ?? 5}
                </div>
                <p className="text-lg font-bold" style={{ color: getMoodColor(metrics.mood_score ?? 5) }}>
                  {getMoodLabel(metrics.mood_score ?? 5)}
                </p>
                <div className="relative px-2">
                  <div
                    className="w-full h-3 rounded-full"
                    style={{ background: 'linear-gradient(to right, #EF4444, #F59E0B, #EAB308, #84CC16, #22C55E)' }}
                  />
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={metrics.mood_score ?? 5}
                    onChange={(e) => updateMetrics({ mood_score: Number(e.target.value) })}
                    className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
                    style={{ top: '0px' }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-4 shadow-lg pointer-events-none transition-all"
                    style={{
                      borderColor: getMoodColor(metrics.mood_score ?? 5),
                      left: `calc(${((metrics.mood_score ?? 5) - 1) / 9 * 100}% - 12px)`
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                  <span>Struggling</span>
                  <span>Okay</span>
                  <span>Great</span>
                </div>
              </div>
            </section>

            <div className="flex justify-between">
              <button onClick={() => setActiveSection(0)} className="px-8 py-3 bg-white text-[#7B68A6] font-bold rounded-2xl hover:bg-gray-50 transition-all border border-[#E6D5F0]">
                ← Intention
              </button>
              <button onClick={() => setActiveSection(2)} className="px-8 py-3 bg-[#7B68A6] text-white font-bold rounded-2xl hover:bg-[#B19CD9] transition-all shadow-md">
                Next: Money →
              </button>
            </div>
          </div>
        )}

        {/* Section 3: Financial Micro Action */}
        {activeSection === 2 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-xl serif font-bold text-[#7B68A6] px-2 flex items-center gap-2">
              <Coffee size={20} className="text-[#B19CD9]" /> Today's Money Minute
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="paper-card p-6 bg-white flex flex-col items-center text-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Yesterday I spent</span>
                <div className="relative">
                  <span className="absolute -left-4 top-0 font-bold text-gray-400">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="bg-transparent border-none outline-none font-bold text-3xl text-[#7B68A6] w-24 text-center"
                    placeholder="0"
                    value={metrics.financial_spending || ''}
                    onFocus={handleInputFocus}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9.]/g, '').replace(/^0+(?=\d)/, '');
                      updateMetrics({ financial_spending: parseFloat(cleaned) || 0 });
                    }}
                  />
                </div>
              </div>
              <div className="paper-card p-6 bg-white flex flex-col items-center text-center md:col-span-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">One Financial Intention</span>
                <div className="relative w-full">
                  <input
                    className="w-full bg-transparent border-none outline-none text-center font-bold text-[#7B68A6] placeholder:text-gray-300 italic pr-10"
                    placeholder="e.g. Bringing my lunch today"
                    value={metrics.financial_intention || ''}
                    onFocus={handleInputFocus}
                    onChange={(e) => updateMetrics({ financial_intention: e.target.value })}
                  />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <MicButton onTranscript={(text) => updateMetrics({ financial_intention: (metrics.financial_intention ? metrics.financial_intention + ' ' : '') + text })} />
                  </div>
                </div>
              </div>
              <div className="paper-card p-6 bg-white flex flex-col items-center text-center md:col-span-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">I'm grateful for (Money/Abundance)</span>
                <div className="relative w-full">
                  <input
                    className="w-full bg-transparent border-none outline-none text-center font-bold text-[#7B68A6] placeholder:text-gray-300 italic pr-10"
                    placeholder="e.g. My stable income"
                    value={metrics.financial_gratitude || ''}
                    onFocus={handleInputFocus}
                    onChange={(e) => updateMetrics({ financial_gratitude: e.target.value })}
                  />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <MicButton onTranscript={(text) => updateMetrics({ financial_gratitude: (metrics.financial_gratitude ? metrics.financial_gratitude + ' ' : '') + text })} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setActiveSection(1)} className="px-8 py-3 bg-white text-[#7B68A6] font-bold rounded-2xl hover:bg-gray-50 transition-all border border-[#E6D5F0]">
                ← Mood
              </button>
              <button onClick={() => setActiveSection(3)} className="px-8 py-3 bg-[#7B68A6] text-white font-bold rounded-2xl hover:bg-[#B19CD9] transition-all shadow-md">
                Next: Priorities →
              </button>
            </div>
          </div>
        )}

        {/* Section 4: Top 3 Priorities */}
        {activeSection === 3 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-xl serif font-bold text-[#7B68A6] px-2">Top Priorities</h2>
              {(metrics.top_priorities || []).length < 5 && (
                <button
                  onClick={addPriority}
                  className="flex items-center gap-1 px-4 py-2 bg-[#E6D5F0] text-[#7B68A6] font-bold rounded-xl text-xs hover:bg-[#B19CD9] hover:text-white transition-all"
                >
                  <Plus size={14} /> Add
                </button>
              )}
            </div>
            <div className="space-y-3">
              {(metrics.top_priorities || []).map((task) => (
                <div
                  key={task.id}
                  className={`paper-card p-5 bg-white flex items-center gap-4 transition-all hover:border-[#B19CD9] ${task.completed ? 'opacity-60' : ''}`}
                >
                  <button onClick={() => togglePriority(task.id)}>
                    <div className={`transition-all ${task.completed ? 'text-[#10B981]' : 'text-gray-200'}`}>
                      {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </div>
                  </button>
                  <input
                    type="text"
                    className={`flex-1 bg-transparent outline-none font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}
                    placeholder="What's important today?"
                    value={task.text}
                    onFocus={handleInputFocus}
                    onChange={(e) => updatePriorityText(task.id, e.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    {(['high', 'medium', 'low'] as Priority[]).map(level => (
                      <button
                        key={level}
                        onClick={() => updatePriorityLevel(task.id, level)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${task.priority === level
                          ? level === 'high' ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                            : level === 'medium' ? 'bg-[#B19CD9]/20 text-[#B19CD9]'
                              : 'bg-gray-100 text-gray-400'
                          : 'text-gray-200 hover:text-gray-400'}`}
                      >
                        {level[0]}
                      </button>
                    ))}
                    <button
                      onClick={() => removePriority(task.id)}
                      className="text-gray-200 hover:text-red-400 transition-all ml-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {(metrics.top_priorities || []).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400 italic mb-4">No priorities set for today.</p>
                  <button
                    onClick={addPriority}
                    className="px-6 py-3 bg-[#E6D5F0] text-[#7B68A6] font-bold rounded-xl hover:bg-[#B19CD9] hover:text-white transition-all"
                  >
                    <Plus size={14} className="inline mr-2" /> Add Your First Priority
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button onClick={() => setActiveSection(2)} className="px-8 py-3 bg-white text-[#7B68A6] font-bold rounded-2xl hover:bg-gray-50 transition-all border border-[#E6D5F0]">
                ← Money
              </button>
              <button onClick={() => setActiveSection(4)} className="px-8 py-3 bg-[#7B68A6] text-white font-bold rounded-2xl hover:bg-[#B19CD9] transition-all shadow-md">
                Next: Complete →
              </button>
            </div>
          </div>
        )}

        {/* Section 5: Ritual Completion */}
        {activeSection === 4 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Mark Complete Toggle */}
            <section className="paper-card p-8 bg-white space-y-6">
              <button
                onClick={() => updateMetrics({ morning_ritual_completed: !metrics.morning_ritual_completed })}
                className={`w-full p-6 rounded-2xl flex items-center justify-between transition-all ${metrics.morning_ritual_completed
                  ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-lg shadow-[#10B981]/20'
                  : 'bg-[#F8F7FC] text-gray-400 hover:bg-[#E6D5F0] hover:text-[#7B68A6]'}`}
              >
                <div className="flex items-center gap-4">
                  {metrics.morning_ritual_completed ? <CheckCircle2 size={32} /> : <Circle size={32} />}
                  <div className="text-left">
                    <p className="text-lg font-bold">{metrics.morning_ritual_completed ? 'Morning Ritual Complete!' : 'Mark Ritual Complete'}</p>
                    <p className="text-xs opacity-70">{metrics.morning_ritual_completed ? 'Great start to your day' : 'Tap when you\'re done with your morning flow'}</p>
                  </div>
                </div>
                <Sunrise size={28} />
              </button>
            </section>

            {/* Water Intake */}
            <section className="paper-card p-8 bg-white space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#7B68A6]">Water Intake</h3>
                <span className="text-xs font-bold text-[#B19CD9]">{metrics.water_intake ?? 0}/8 cups</span>
              </div>
              <div className="flex justify-center gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => updateMetrics({ water_intake: i + 1 === metrics.water_intake ? i : i + 1 })}
                    className={`transition-all ${i < (metrics.water_intake ?? 0) ? 'text-[#3B82F6]' : 'text-gray-100'}`}
                  >
                    <Droplets size={28} fill={i < (metrics.water_intake ?? 0) ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </section>

            {/* Movement Toggle + Minutes */}
            <section className="paper-card p-8 bg-white space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#7B68A6]">Movement</h3>
                <button
                  onClick={() => updateMetrics({ movement_active: !metrics.movement_active })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${metrics.movement_active ? 'bg-[#B19CD9] text-white' : 'bg-[#F8F7FC] text-gray-400'}`}
                >
                  <Dumbbell size={16} /> {metrics.movement_active ? 'Active' : 'Inactive'}
                </button>
              </div>
              {metrics.movement_active && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Minutes Today</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[15, 30, 45, 60].map(mins => (
                      <button
                        key={mins}
                        onClick={() => updateMetrics({ movement_minutes: mins })}
                        className={`py-3 rounded-xl border font-bold text-xs transition-all ${metrics.movement_minutes === mins ? 'bg-[#B19CD9] border-[#B19CD9] text-white' : 'bg-white border-[#eee] text-gray-400 hover:border-[#B19CD9]'}`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <div className="flex justify-between">
              <button onClick={() => setActiveSection(3)} className="px-8 py-3 bg-white text-[#7B68A6] font-bold rounded-2xl hover:bg-gray-50 transition-all border border-[#E6D5F0]">
                ← Priorities
              </button>
              <button onClick={() => setActiveSection(0)} className="px-8 py-3 bg-[#E6D5F0] text-[#7B68A6] font-bold rounded-2xl hover:bg-[#B19CD9] hover:text-white transition-all">
                Back to Start
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MorningReset;
