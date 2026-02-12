
import React, { useState, useEffect, useRef } from 'react';
import { YearData, WorkbookData, Task, WorkbookSnapshot, WorkbookFinancialGoal } from '../types';
import { 
  ChevronRight, 
  ChevronLeft, 
  Crown, 
  Target, 
  BookOpen, 
  Sun, 
  Clock, 
  Save, 
  Sparkles, 
  Download,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { generateWorkbookAffirmation, generateRitualSuggestion, generateGoalOptimization } from '../services/geminiService';

interface Props {
  data: YearData;
  updateData: (d: YearData) => void;
  isPremium: boolean;
  setView: (v: string) => void;
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

const FinancialWorkbook: React.FC<Props> = ({ data, updateData, isPremium, setView }) => {
  const [page, setPage] = useState(data.workbook.current_page || 0);
  const [showWelcomeContent, setShowWelcomeContent] = useState(data.workbook.started_at !== null);
  const [loadingAI, setLoadingAI] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const w = data.workbook;

  const updateWorkbook = (updates: Partial<WorkbookData>) => {
    if (data.isArchived) return;
    
    const started_at = w.started_at || new Date().toISOString();
    const newWorkbook = { ...w, ...updates, started_at };
    
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      updateData({ ...data, workbook: newWorkbook });
    }, 300);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateWorkbook({ current_page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAIRequest = async (type: 'affirmation' | 'ritual' | 'goals') => {
    if (!isPremium) return;
    setLoadingAI(true);
    try {
      if (type === 'affirmation') {
        const results = await generateWorkbookAffirmation(w.limitingBelief, w.idealFinancialLife);
        if (results.length > 0) {
          updateWorkbook({ empoweringRewrite: results[0] });
          if (!data.affirmations.includes(results[0])) {
            updateData({ ...data, affirmations: [...data.affirmations, results[0]] });
          }
        }
      } else if (type === 'ritual') {
        const results = await generateRitualSuggestion(w.currentMorning, w.morningFeelings, w.primaryGoal.text || "Financial Freedom");
        if (results.length > 0) {
          updateWorkbook({ ritualEntries: results });
        }
      } else if (type === 'goals') {
        const results = await generateGoalOptimization(
          w.primaryGoal.text,
          w.supportingGoals.map(g => g.text),
          data.financial.income,
          data.financial.debts.reduce((s, d) => s + d.balance, 0),
          data.financial.savingsGoals.reduce((s, d) => s + d.current, 0)
        );
        console.log("Goal Optimization:", results);
        alert("AI Goal Strategy Generated. Check console for detailed analysis.");
      }
    } finally {
      setLoadingAI(false);
    }
  };

  const syncGoalsToHub = (primary: typeof w.primaryGoal, supporting: WorkbookFinancialGoal[]) => {
    const hubGoals = [...data.financial.savingsGoals];
    const upsertGoal = (text: string, amount: number, date: string) => {
      if (!text.trim()) return;
      const idx = hubGoals.findIndex(g => g.name === text);
      if (idx > -1) {
        hubGoals[idx] = { ...hubGoals[idx], target: amount, date };
      } else {
        hubGoals.push({ id: Math.random().toString(), name: text, target: amount, current: 0, date });
      }
    };
    upsertGoal(primary.text, primary.amount, primary.targetDate);
    supporting.forEach(g => upsertGoal(g.text, g.amount, g.targetDate));
    updateData({ ...data, financial: { ...data.financial, savingsGoals: hubGoals } });
  };

  const renderPage = () => {
    switch (page) {
      case 0: 
        if (!showWelcomeContent && !w.started_at) {
          return (
            <div className="min-h-[500px] flex items-center justify-center p-4">
              <div className="w-full max-w-2xl bg-[#F8F7FC] rounded-[40px] shadow-2xl border border-[#eee] overflow-hidden animate-in fade-in duration-1000">
                <div className="text-center space-y-8 py-16 px-10">
                  <div className="flex justify-center">
                    <div className="p-6 bg-[#B19CD9]/10 rounded-full flex items-center justify-center">
                      <ButterflyIcon size={64} className="text-[#B19CD9]" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h1 className="text-3xl font-bold uppercase tracking-widest text-[#7B68A6] serif">Financial Wellness & Morning Money Reset</h1>
                    <h2 className="text-5xl font-bold text-[#7B68A6] serif leading-tight">You Deserve Financial Peace.</h2>
                  </div>

                  <p className="text-lg text-[#6B6B6B] max-w-xl mx-auto italic leading-relaxed">
                    "Your wealth begins with intention. The biggest shifts happen when you're honest about where you are and intentional about where you're going."
                  </p>
                  
                  <button 
                    onClick={() => {
                      setShowWelcomeContent(true);
                      updateWorkbook({ started_at: new Date().toISOString() });
                    }}
                    className="mt-8 px-12 py-5 bg-[#B19CD9] text-white font-bold rounded-full shadow-lg shadow-[#B19CD9]/30 hover:bg-[#7B68A6] transition-all transform hover:scale-105 active:scale-95"
                  >
                    Begin Your Reset
                  </button>

                  <div className="pt-12">
                    <p className="text-xs font-bold text-[#7B68A6] uppercase tracking-[0.5em]">BUILD YOUR WEALTH FROM WITHIN</p>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-8 animate-in fade-in duration-1000">
            <div className="text-center space-y-4">
              <p className="italic text-[#D4AF37] serif text-xl">"your wealth begins with intention."</p>
              <h1 className="text-5xl font-bold text-[#7B68A6] serif leading-tight uppercase">You Deserve Financial Peace.</h1>
            </div>
            <div className="space-y-6 text-gray-600 leading-relaxed max-w-2xl mx-auto">
              <p>Welcome to your Financial Wellness & Morning Money Reset. If you're reading this, you've already made a powerful decision: you're choosing to take ownership of your financial life. That alone deserves a moment of recognition.</p>
              <p>I created the Lavender Life Planner because I got tired of buying a new financial journal every January, taping vision board cutouts to my wall, and scattering affirmations across three different notebooks. I'm a project manager by trade — I know the power of having everything in one place. So I built an all-in-one digital hub where your finances, wellness goals, daily planning, vision board, and affirmations all live together, beautifully organized.</p>
              <p>The Lavender Life Planner is a standalone app — a one-time purchase of $30 gives you lifetime access to every feature: the Financial Hub, Wellness Tracker, Planner, Vision Board, 30-Day Reset challenges, Reflections, and more. If you want AI-powered insights like personalized weekly financial priorities, smart budget suggestions, and custom affirmations, that's available as an optional add-on for $5.99/month.</p>
              <p>This Money Reset is your companion for the first 30 days. It's designed to help you build a morning money practice — a short, intentional ritual where you check in with your finances, set your intentions, and start each day feeling grounded and in control. The more honestly you engage with these pages, the deeper the transformation.</p>
            </div>
            <div className="space-y-4 pt-10 border-t border-[#eee]">
              <label className="text-xs font-bold uppercase tracking-widest text-[#7B68A6]">What brought you to this moment?</label>
              <textarea 
                className="w-full h-40 p-6 bg-white border border-[#E6D5F0] rounded-2xl outline-none focus:ring-2 focus:ring-[#B19CD9] shadow-sm italic"
                placeholder="What's driving you to take control of your financial wellness right now? Be completely honest — this is your private space to get real with yourself."
                value={w.motivation}
                onChange={e => updateWorkbook({ motivation: e.target.value })}
              />
            </div>
          </div>
        );
      case 1: return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <h2 className="text-3xl font-bold text-[#7B68A6] serif">FINANCIAL SELF-ASSESSMENT</h2>
          <p className="text-gray-500 italic">"Before we build forward, we need to understand where you stand today. This isn't about judgment — it's about awareness. Rate yourself honestly on each area. You'll revisit this at Day 30 to measure your growth."</p>
          <div className="space-y-4">
            {[
              { id: 'incomeKnowledge', label: 'I know my exact monthly income after taxes' },
              { id: 'subscriptionAwareness', label: 'I can name every recurring subscription I pay for' },
              { id: 'writtenBudget', label: 'I have a written budget that I review weekly' },
              { id: 'emergencySavings', label: 'I have at least one month of expenses saved' },
              { id: 'debtPayoff', label: 'I am actively working on paying down debt' },
              { id: 'consistentSaving', label: 'I set aside money for savings each paycheck' },
              { id: 'moneyCalmness', label: 'I feel calm (not anxious) when I think about money' },
              { id: 'openConversations', label: 'I can talk about money openly without shame' },
              { id: 'goalSpecificity', label: 'I have specific financial goals with target dates' },
              { id: 'spendingAlignment', label: 'My daily spending reflects my actual priorities' },
            ].map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 hover:bg-[#F8F7FC] rounded-2xl transition-all">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button 
                      key={val}
                      onClick={() => {
                        const newRatings = { ...w.selfAssessment.ratings, [item.id]: val };
                        updateWorkbook({ selfAssessment: { ...w.selfAssessment, ratings: newRatings as any } });
                      }}
                      className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center font-bold text-sm ${
                        w.selfAssessment.ratings[item.id as keyof typeof w.selfAssessment.ratings] === val 
                        ? 'bg-[#7B68A6] border-[#7B68A6] text-white' 
                        : 'border-[#E6D5F0] text-gray-300 hover:border-[#B19CD9]'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-10 space-y-4 border-t border-[#eee]">
            <label className="text-xs font-bold uppercase tracking-widest text-[#7B68A6]">Reflection</label>
            <textarea 
              className="w-full h-32 p-4 bg-white border border-[#E6D5F0] rounded-xl outline-none focus:ring-2 focus:ring-[#B19CD9] shadow-sm italic"
              placeholder="Look at your lowest-rated areas. Pick the ONE that, if improved, would create the biggest ripple effect across all the others. Why that one?"
              value={w.selfAssessment.reflection}
              onChange={e => updateWorkbook({ selfAssessment: { ...w.selfAssessment, reflection: e.target.value } })}
            />
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
          <h2 className="text-3xl font-bold text-[#7B68A6] serif">YOUR MONEY STORY</h2>
          <p className="text-gray-500 italic">"Every person carries beliefs about money that were formed long before they earned their first dollar. This exercise brings those hidden scripts into the light."</p>
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Childhood Money Messages</label>
              <textarea 
                className="w-full h-32 p-4 bg-white border border-[#E6D5F0] rounded-xl outline-none focus:ring-2 focus:ring-[#B19CD9]"
                placeholder="What phrases did you hear about money growing up? Write down at least three."
                value={w.childhoodMessages}
                onChange={e => updateWorkbook({ childhoodMessages: e.target.value })}
              />
            </div>
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Current Impact</label>
              <textarea 
                className="w-full h-32 p-4 bg-white border border-[#E6D5F0] rounded-xl outline-none focus:ring-2 focus:ring-[#B19CD9]"
                placeholder="Which of those messages still lives in your head today? How does it show up in your behavior?"
                value={w.currentImpact}
                onChange={e => updateWorkbook({ currentImpact: e.target.value })}
              />
            </div>
            <div className="p-8 bg-[#E6D5F0]/20 rounded-3xl space-y-6 relative border border-[#B19CD9]/30">
              <h3 className="font-bold text-[#7B68A6] uppercase tracking-widest text-xs">Rewrite Your Money Narrative</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Limiting Belief</label>
                  <textarea 
                    className="w-full h-24 p-3 bg-white/50 border border-[#E6D5F0] rounded-xl outline-none italic text-sm"
                    value={w.limitingBelief}
                    onChange={e => updateWorkbook({ limitingBelief: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-[#D4AF37] uppercase">Empowering Rewrite</label>
                    {isPremium && (
                      <button 
                        onClick={() => handleAIRequest('affirmation')}
                        disabled={loadingAI}
                        className="text-[10px] font-bold text-[#7B68A6] hover:underline flex items-center gap-1"
                      >
                        <Sparkles size={10} /> {loadingAI ? 'Generating...' : '✨ Generate Affirmation'}
                      </button>
                    )}
                  </div>
                  <textarea 
                    className="w-full h-24 p-3 bg-white/50 border border-[#B19CD9] rounded-xl outline-none font-bold text-[#7B68A6] text-sm"
                    value={w.empoweringRewrite}
                    onChange={e => {
                      updateWorkbook({ empoweringRewrite: e.target.value });
                      if (e.target.value && !data.affirmations.includes(e.target.value)) {
                        updateData({ ...data, affirmations: [...data.affirmations, e.target.value] });
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Ideal Financial Life (3 Years)</label>
              <textarea 
                className="w-full h-32 p-4 bg-white border border-[#E6D5F0] rounded-xl outline-none focus:ring-2 focus:ring-[#B19CD9]"
                placeholder="Paint the picture: what does your ideal financial life look like in 3 years?"
                value={w.idealFinancialLife}
                onChange={e => updateWorkbook({ idealFinancialLife: e.target.value })}
              />
            </div>
          </div>
        </div>
      );
      case 3: return (
        <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-[#7B68A6] serif">SET YOUR FINANCIAL GOALS</h2>
            {isPremium && (
              <button 
                onClick={() => handleAIRequest('goals')}
                className="flex items-center gap-2 px-4 py-2 bg-[#E6D5F0] text-[#7B68A6] font-bold rounded-xl text-xs hover:bg-[#B19CD9] hover:text-white transition-all"
              >
                <Sparkles size={14} /> Optimize Goals
              </button>
            )}
          </div>
          <p className="text-gray-500 italic">"Strong goals have three ingredients: a specific number, a deadline, and a reason that matters deeply."</p>
          <div className="space-y-8">
            <div className="paper-card p-8 border-l-8 border-[#D4AF37]">
              <label className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-4 block">Primary Goal (Next 90 Days)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <input 
                  className="md:col-span-2 workbook-input font-bold text-xl text-[#7B68A6]" 
                  placeholder="The Goal (e.g. Save $5,000)"
                  value={w.primaryGoal.text}
                  onBlur={() => syncGoalsToHub(w.primaryGoal, w.supportingGoals)}
                  onChange={e => updateWorkbook({ primaryGoal: { ...w.primaryGoal, text: e.target.value } })}
                />
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                  <input 
                    type="number"
                    className="workbook-input pl-4 font-bold" 
                    placeholder="Amount"
                    value={w.primaryGoal.amount}
                    onBlur={() => syncGoalsToHub(w.primaryGoal, w.supportingGoals)}
                    onChange={e => updateWorkbook({ primaryGoal: { ...w.primaryGoal, amount: Number(e.target.value) } })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                  type="date"
                  className="workbook-input"
                  value={w.primaryGoal.targetDate}
                  onBlur={() => syncGoalsToHub(w.primaryGoal, w.supportingGoals)}
                  onChange={e => updateWorkbook({ primaryGoal: { ...w.primaryGoal, targetDate: e.target.value } })}
                />
                <textarea 
                  className="w-full h-20 bg-transparent border-b border-[#E6D5F0] outline-none text-sm italic"
                  placeholder="Why does this matter deeper than the number?"
                  value={w.primaryGoal.why}
                  onChange={e => updateWorkbook({ primaryGoal: { ...w.primaryGoal, why: e.target.value } })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Supporting Goals</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {w.supportingGoals.map((g, i) => (
                  <div key={i} className="paper-card p-6 bg-white shadow-sm space-y-4">
                    <input 
                      className="w-full bg-transparent border-b border-[#eee] pb-2 outline-none font-bold text-[#7B68A6]"
                      placeholder={`Goal ${i+1}`}
                      value={g.text}
                      onBlur={() => syncGoalsToHub(w.primaryGoal, w.supportingGoals)}
                      onChange={e => {
                        const newGoals = [...w.supportingGoals];
                        newGoals[i].text = e.target.value;
                        updateWorkbook({ supportingGoals: newGoals });
                      }}
                    />
                    <div className="flex gap-4">
                      <input 
                        type="number"
                        className="flex-1 bg-transparent border-b border-[#eee] pb-2 outline-none text-xs"
                        placeholder="Amount"
                        value={g.amount}
                        onBlur={() => syncGoalsToHub(w.primaryGoal, w.supportingGoals)}
                        onChange={e => {
                          const newGoals = [...w.supportingGoals];
                          newGoals[i].amount = Number(e.target.value);
                          updateWorkbook({ supportingGoals: newGoals });
                        }}
                      />
                      <input 
                        type="date"
                        className="flex-1 bg-transparent border-b border-[#eee] pb-2 outline-none text-[10px]"
                        value={g.targetDate}
                        onBlur={() => syncGoalsToHub(w.primaryGoal, w.supportingGoals)}
                        onChange={e => {
                          const newGoals = [...w.supportingGoals];
                          newGoals[i].targetDate = e.target.value;
                          updateWorkbook({ supportingGoals: newGoals });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 bg-[#D4AF37]/10 rounded-2xl border border-[#D4AF37]/20 flex items-start gap-4">
              <Crown className="text-[#D4AF37] shrink-0" />
              <p className="text-xs text-[#7B68A6] leading-relaxed italic">
                <strong>Pro Tip:</strong> Enter these goals in your Financial Hub. The Debt Payoff Tracker will calculate your timeline, and the AI module can suggest avalanche or snowball strategies.
              </p>
            </div>
          </div>
        </div>
      );
      case 4: return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <h2 className="text-3xl font-bold text-[#7B68A6] serif">YOUR CURRENT MONEY HABITS</h2>
          <p className="text-gray-500 italic">"Transformation starts with truth. Let's take an honest snapshot of your current habits."</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { id: 'financeRelationship', label: 'Describe your current relationship with checking your finances.' },
              { id: 'pastTools', label: 'Have you tried budgeting tools, financial journals, or money trackers before? What worked? What didn\'t?' },
              { id: 'currentMorning', label: 'Describe your current morning routine.' },
              { id: 'morningFeelings', label: 'How do you feel when you start your day? How would you LIKE to feel instead?' },
            ].map(item => (
              <div key={item.id} className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-[#7B68A6]">{item.label}</label>
                <textarea 
                  className="w-full h-40 p-4 bg-white border border-[#E6D5F0] rounded-2xl outline-none focus:ring-2 focus:ring-[#B19CD9] text-sm"
                  placeholder="Type your response here..."
                  value={w[item.id as keyof WorkbookData] as string}
                  onChange={e => updateWorkbook({ [item.id]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      );
      case 5: return (
        <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-[#7B68A6] serif">DESIGN YOUR MORNING MONEY RITUAL</h2>
            {isPremium && (
              <button 
                onClick={() => handleAIRequest('ritual')}
                className="flex items-center gap-2 px-4 py-2 bg-[#E6D5F0] text-[#7B68A6] font-bold rounded-xl text-xs hover:bg-[#B19CD9] hover:text-white transition-all"
              >
                <Sparkles size={14} /> Suggest a Ritual
              </button>
            )}
          </div>
          <p className="text-gray-500 italic">"A morning money ritual is 10–20 minutes of intentional financial check-in before the world pulls your attention elsewhere."</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 space-y-6">
              <div className="paper-card p-6 bg-[#F8F7FC] border-[#E6D5F0]">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Sample Ritual</h4>
                <div className="space-y-4 border-l-2 border-[#E6D5F0] ml-2 pl-6">
                  {[
                    { t: '6:30 AM', a: 'Wake up, hydrate, stretch' },
                    { t: '6:40 AM', a: 'Read daily affirmation' },
                    { t: '6:45 AM', a: 'Review financial priorities' },
                    { t: '6:50 AM', a: 'Log yesterday\'s spending' },
                    { t: '6:55 AM', a: 'Vision board visualization' }
                  ].map((s, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[31px] top-1 w-2 h-2 rounded-full bg-[#B19CD9]" />
                      <p className="text-[10px] font-bold text-[#B19CD9]">{s.t}</p>
                      <p className="text-[11px] text-gray-600">{s.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                {w.ritualEntries.map((entry, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <input 
                      className="w-24 p-3 bg-white border border-[#E6D5F0] rounded-xl outline-none text-xs font-bold"
                      value={entry.time}
                      onChange={e => {
                        const newRitual = [...w.ritualEntries];
                        newRitual[i].time = e.target.value;
                        updateWorkbook({ ritualEntries: newRitual });
                      }}
                    />
                    <input 
                      className="flex-1 p-3 bg-white border border-[#E6D5F0] rounded-xl outline-none text-sm"
                      placeholder="Activity"
                      value={entry.activity}
                      onChange={e => {
                        const newRitual = [...w.ritualEntries];
                        newRitual[i].activity = e.target.value;
                        updateWorkbook({ ritualEntries: newRitual });
                      }}
                    />
                    <button onClick={() => updateWorkbook({ ritualEntries: w.ritualEntries.filter((_, idx) => idx !== i) })} className="text-gray-300 hover:text-red-400">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button onClick={() => updateWorkbook({ ritualEntries: [...w.ritualEntries, { time: '8:00 AM', activity: '' }] })} className="text-xs font-bold text-[#7B68A6] hover:underline">+ Add Step</button>
              </div>
              <button 
                onClick={() => {
                  const tasks: Task[] = w.ritualEntries.map(r => ({ id: Math.random().toString(), text: `Money Ritual: ${r.activity}`, completed: false, priority: 'high', timeEstimate: r.time }));
                  updateData({ ...data, wellness: { ...data.wellness, dailyToDos: [...tasks, ...data.wellness.dailyToDos] } });
                  alert("Ritual synced to Planner!");
                }}
                className="flex items-center gap-2 px-6 py-3 bg-[#B19CD9] text-white font-bold rounded-xl text-xs hover:bg-[#7B68A6] shadow-lg"
              >
                <Save size={16} /> Sync Ritual to Planner
              </button>
            </div>
          </div>
        </div>
      );
      case 6: return (
        <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
          <h2 className="text-3xl font-bold text-[#7B68A6] serif uppercase">MAKE IT REAL</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-2"><label className="text-[10px] font-bold text-gray-400 uppercase">Duration (Mins)</label><input type="number" className="w-full p-4 bg-white border border-[#E6D5F0] rounded-2xl outline-none" value={w.durationMinutes} onChange={e => updateWorkbook({ durationMinutes: Number(e.target.value) })} /></div>
             <div className="space-y-2"><label className="text-[10px] font-bold text-gray-400 uppercase">Wake Time</label><input className="w-full p-4 bg-white border border-[#E6D5F0] rounded-2xl outline-none" placeholder="6:30 AM" value={w.wakeTime} onChange={e => updateWorkbook({ wakeTime: e.target.value })} /></div>
             <div className="space-y-2"><label className="text-[10px] font-bold text-gray-400 uppercase">Bed Time</label><input className="w-full p-4 bg-white border border-[#E6D5F0] rounded-2xl outline-none" placeholder="10:00 PM" value={w.bedTime} onChange={e => updateWorkbook({ bedTime: e.target.value })} /></div>
          </div>
          <div className="space-y-4"><label className="text-xs font-bold uppercase tracking-widest text-[#7B68A6]">Obstacles & Solutions</label><textarea className="w-full h-32 p-4 bg-white border border-[#E6D5F0] rounded-2xl outline-none text-sm italic" placeholder="What could derail you? Plan for your top obstacles..." value={w.obstacles} onChange={e => updateWorkbook({ obstacles: e.target.value })} /></div>
          <div className="paper-card p-10 space-y-8 bg-[#F8F7FC]">
            <h3 className="text-2xl font-bold text-[#7B68A6] serif">App Setup Checklist</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                 { id: 'accountCreated', label: 'Download app & create account', view: null },
                 { id: 'yearSet', label: `Set year to ${data.year}`, view: null },
                 { id: 'incomeEntered', label: 'Enter monthly income', view: 'financial' },
                 { id: 'fixedExpensesAdded', label: 'Add fixed expenses', view: 'financial' },
                 { id: 'variableBudgetSet', label: 'Set variable budgets', view: 'financial' },
                 { id: 'debtsAdded', label: 'Add debts to Tracker', view: 'financial' },
                 { id: 'savingsGoalSet', label: 'Set a savings goal', view: 'financial' },
                 { id: 'affirmationAdded', label: 'Add first affirmation', view: 'vision' },
                 { id: 'visionBoardImage', label: 'Pin inspiration image', view: 'vision' },
                 { id: 'resetStarted', label: 'Start Day 1 of Reset', view: 'simplify' },
               ].map(item => (
                 <div key={item.id} className="flex items-center gap-3">
                   <button onClick={() => updateWorkbook({ setupChecklist: { ...w.setupChecklist, [item.id]: !w.setupChecklist[item.id as keyof typeof w.setupChecklist] } })} className={`transition-all ${w.setupChecklist[item.id as keyof typeof w.setupChecklist] ? 'text-[#10B981]' : 'text-gray-200'}`}>{w.setupChecklist[item.id as keyof typeof w.setupChecklist] ? <CheckCircle2 size={24} /> : <div className="w-6 h-6 rounded-full border-2 border-current" />}</button>
                   <button onClick={() => item.view && setView(item.view)} className={`text-sm font-medium ${item.view ? 'hover:text-[#B19CD9] underline' : 'text-gray-600'}`}>{item.label}</button>
                 </div>
               ))}
            </div>
          </div>
        </div>
      );
      case 7: return (
        <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
          <h2 className="text-3xl font-bold text-[#7B68A6] serif">SET YOUR INTENTIONS</h2>
          <p className="text-center italic text-gray-400 text-sm">"Intentions are the compass that keeps you oriented when life gets noisy."</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-6 text-center">
               <div className="p-4 bg-[#7B68A6] text-white rounded-full inline-block font-bold text-xs uppercase px-8">Intention 1</div>
               <input className="workbook-input text-2xl serif italic text-center text-[#7B68A6]" placeholder="e.g. Release money shame" value={w.intention1.text} onChange={e => updateWorkbook({ intention1: { ...w.intention1, text: e.target.value } })} />
               <textarea className="w-full h-24 bg-[#F8F7FC] rounded-2xl p-4 outline-none border border-[#eee] text-sm italic" placeholder="Why this intention?" value={w.intention1.why} onChange={e => updateWorkbook({ intention1: { ...w.intention1, why: e.target.value } })} />
             </div>
             <div className="space-y-6 text-center">
               <div className="p-4 bg-[#B19CD9] text-white rounded-full inline-block font-bold text-xs uppercase px-8">Intention 2</div>
               <input className="workbook-input text-2xl serif italic text-center text-[#7B68A6]" placeholder="e.g. Build consistency" value={w.intention2.text} onChange={e => updateWorkbook({ intention2: { ...w.intention2, text: e.target.value } })} />
               <textarea className="w-full h-24 bg-[#F8F7FC] rounded-2xl p-4 outline-none border border-[#eee] text-sm italic" placeholder="Why this intention?" value={w.intention2.why} onChange={e => updateWorkbook({ intention2: { ...w.intention2, why: e.target.value } })} />
             </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4"><label className="text-xs font-bold uppercase text-gray-400">Work Context</label><textarea className="w-full h-32 p-4 bg-white border border-[#E6D5F0] rounded-2xl outline-none" placeholder="What do you do for work? Is your schedule flexible?" value={w.workContext} onChange={e => updateWorkbook({ workContext: e.target.value })} /></div>
            <div className="space-y-4"><label className="text-xs font-bold uppercase text-gray-400">Spending Habits</label><textarea className="w-full h-32 p-4 bg-white border border-[#E6D5F0] rounded-2xl outline-none" placeholder="How does your work schedule affect your spending?" value={w.spendingHabits} onChange={e => updateWorkbook({ spendingHabits: e.target.value })} /></div>
          </div>
        </div>
      );
      case 8: return (
        <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
          <h2 className="text-3xl font-bold text-[#7B68A6] serif">YOUR 30-DAY FINANCIAL SNAPSHOT</h2>
          <p className="text-gray-500 italic">"Seeing the numbers side by side is one of the most motivating things you'll experience."</p>
          <div className="paper-card overflow-hidden border-[#E6D5F0]">
            <table className="w-full text-left">
              <thead><tr className="bg-[#B19CD9] text-white text-[10px] font-bold uppercase tracking-widest"><th className="p-6">Metric</th><th className="p-6">Day 1</th><th className="p-6">Day 30</th></tr></thead>
              <tbody className="divide-y divide-[#eee]">
                {[
                  { id: 'income', label: 'Monthly Income' }, { id: 'expenses', label: 'Total Expenses' }, { id: 'debt', label: 'Total Debt' },
                  { id: 'savings', label: 'Total Savings' }, { id: 'emergencyFund', label: 'Emergency Fund' }, { id: 'subscriptionCount', label: 'Subscription Count' },
                  { id: 'creditScore', label: 'Credit Score' }, { id: 'confidence', label: 'Confidence (1-10)' }, { id: 'consistency', label: 'Consistency' },
                ].map(m => (
                  <tr key={m.id}>
                    <td className="p-6 font-bold text-gray-500 text-xs">{m.label}</td>
                    <td className="p-6"><input className="bg-transparent border-b border-[#eee] outline-none text-sm font-bold w-full" value={w.day1Snapshot[m.id as keyof WorkbookSnapshot] || ''} onChange={e => updateWorkbook({ day1Snapshot: { ...w.day1Snapshot, [m.id]: m.id === 'consistency' ? e.target.value : Number(e.target.value) } as any })} /></td>
                    <td className="p-6"><input className="bg-transparent border-b border-[#eee] outline-none text-sm font-bold w-full" placeholder="Pending..." value={w.day30Snapshot?.[m.id as keyof WorkbookSnapshot] || ''} disabled={!w.started_at || (new Date().getTime() - new Date(w.started_at).getTime() < 25 * 24 * 60 * 60 * 1000)} onChange={e => updateWorkbook({ day30Snapshot: { ...(w.day30Snapshot || w.day1Snapshot), [m.id]: m.id === 'consistency' ? e.target.value : Number(e.target.value) } as any })} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl text-amber-600"><AlertCircle size={20} /><p className="text-xs font-medium">Day 30 inputs unlock 25 days after your start date ({new Date(w.started_at || Date.now()).toLocaleDateString()}).</p></div>
        </div>
      );
      case 9: return (
        <div className="space-y-12 animate-in fade-in duration-1000 text-center py-10">
          <div className="space-y-4"><p className="italic text-gray-400 serif text-xl">"remember this always:"</p><h2 className="text-5xl font-bold text-[#7B68A6] serif leading-tight uppercase">Your Net Worth does not define your Self-Worth.</h2></div>
          <div className="max-w-2xl mx-auto space-y-6 text-gray-600">
            <p>This Money Reset is your starting line, not your finish line. Every morning you show up for your finances is a deposit into your future self. Use the Lavender Life Planner daily. Trust the process. Celebrate the small wins.</p>
            <p className="font-bold italic text-lg text-[#7B68A6]">"You don't need to be perfect. You just need to be intentional."</p>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-6 pt-10">
            <button onClick={() => window.print()} className="flex items-center gap-3 px-8 py-4 bg-[#7B68A6] text-white font-bold rounded-2xl hover:bg-[#B19CD9] transition-all shadow-lg"><Download size={20} /> Download Completed Reset</button>
            <button onClick={() => window.print()} className="flex items-center gap-3 px-8 py-4 bg-white border border-[#eee] text-gray-500 font-bold rounded-2xl hover:bg-[#F8F7FC] transition-all"><Download size={20} /> Download Blank Reset</button>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-10">Lavender Life Planner — One-time purchase: $30 • AI Features: $5.99/mo (optional)</p>
          <div className="pt-12">
            <p className="text-xs font-bold text-[#7B68A6] uppercase tracking-[0.5em]">BUILD YOUR WEALTH FROM WITHIN</p>
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-32">
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#E6D5F0] rounded-2xl"><BookOpen className="text-[#7B68A6]" /></div>
          <div>
            <h1 className="text-2xl font-bold serif text-[#7B68A6]">Financial Wellness & Morning Money Reset</h1>
            <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">Level Up • Plan • Thrive • Repeat</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Progress</span>
            <div className="w-48 h-1.5 bg-[#E6D5F0] rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-[#B19CD9] transition-all duration-700" style={{ width: `${((page + 1) / 10) * 100}%` }} />
            </div>
          </div>
          <span className="text-sm font-bold text-[#7B68A6]">{page + 1} / 10</span>
        </div>
      </header>
      <div className="paper-card min-h-[600px] p-8 md:p-12 lg:p-16 relative overflow-hidden print:shadow-none print:border-none">
        {renderPage()}
        {page < 9 && showWelcomeContent && (
          <div className="mt-20 flex justify-between items-center print:hidden">
            <button onClick={() => handlePageChange(Math.max(0, page - 1))} disabled={page === 0} className={`flex items-center gap-2 px-6 py-3 font-bold transition-all ${page === 0 ? 'opacity-0 cursor-default' : 'text-gray-400 hover:text-[#7B68A6]'}`}><ChevronLeft size={20} /> Previous</button>
            {page === 8 ? <button onClick={() => { updateWorkbook({ completed_at: new Date().toISOString() }); handlePageChange(9); }} className="flex items-center gap-3 px-10 py-4 bg-[#7B68A6] text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all">Complete Money Reset <Crown size={20} /></button> : <button onClick={() => handlePageChange(page + 1)} className="flex items-center gap-2 px-10 py-4 bg-[#B19CD9] text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all">Next Step <ChevronRight size={20} /></button>}
          </div>
        )}
      </div>
      <div className="fixed bottom-6 right-6 opacity-20 pointer-events-none text-[10px] font-bold text-[#7B68A6] uppercase tracking-[0.5em] print:hidden">BUILD YOUR WEALTH FROM WITHIN</div>
    </div>
  );
};

export default FinancialWorkbook;
