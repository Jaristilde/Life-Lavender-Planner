
import React, { useState, useEffect } from 'react';
import { YearData, MonthlyResetData } from '../types';
import { DEFAULT_MONTHLY_RESET } from '../constants';
import {
  ChevronRight,
  CalendarCheck,
  Sparkles,
  Trash2,
  Plus,
  CheckCircle2,
  Save,
  BrainCircuit,
  DollarSign,
  X
} from 'lucide-react';
import { generateMonthlyInsight } from '../services/geminiService';
import MicButton from '../components/MicButton';

interface Props {
  data: YearData;
  updateData: (d: YearData) => void;
  isPremium: boolean;
  userName: string;
}

const MonthlyReset: React.FC<Props> = ({ data, updateData, isPremium, userName }) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()].toLowerCase());
  const [loadingAI, setLoadingAI] = useState(false);

  // Initialize data for the month if it doesn't exist
  useEffect(() => {
    if (!data.monthlyResets[selectedMonth]) {
      const initialReset = DEFAULT_MONTHLY_RESET();
      // Auto-populate financial fields from FinancialHub
      initialReset.financialCheckIn.moneyIn = data.financial.income;
      const totalExpenses = data.financial.fixedExpenses.reduce((s, e) => s + e.amount, 0) + 
                            data.financial.variableExpenses.reduce((s, e) => s + e.amount, 0);
      initialReset.financialCheckIn.moneyOut = totalExpenses;
      
      updateData({
        ...data,
        monthlyResets: { ...data.monthlyResets, [selectedMonth]: initialReset }
      });
    }
  }, [selectedMonth, data, updateData]);

  const reset = data.monthlyResets[selectedMonth] || DEFAULT_MONTHLY_RESET();

  const updateReset = (updates: Partial<MonthlyResetData>) => {
    if (data.isArchived) return;
    updateData({
      ...data,
      monthlyResets: {
        ...data.monthlyResets,
        [selectedMonth]: { ...reset, ...updates }
      }
    });
  };

  const handleAIInsight = async () => {
    if (!isPremium) return;
    setLoadingAI(true);
    const insight = await generateMonthlyInsight(
      selectedMonth,
      reset.financialCheckIn.moneyIn,
      reset.financialCheckIn.moneyOut,
      reset.financialCheckIn.saved,
      reset.financialCheckIn.debtPaid,
      reset.financialCheckIn.bestDecision
    );
    updateReset({
      financialCheckIn: { ...reset.financialCheckIn, aiInsight: insight }
    });
    setLoadingAI(false);
  };

  const handleComplete = () => {
    updateReset({ completedAt: new Date().toISOString() });
  };

  const bannerAbbr = selectedMonth.slice(0, 3).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto pb-32 space-y-12">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#E6D5F0] rounded-2xl"><CalendarCheck className="text-[#7B68A6]" /></div>
          <div>
            <h1 className="text-4xl font-bold serif text-[#7B68A6]">Monthly Reset Ritual</h1>
            <p className="text-gray-500">Reflection is the fuel for intentional growth.</p>
          </div>
        </div>
        <select 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-white border border-[#E6D5F0] px-6 py-3 rounded-2xl font-bold text-[#7B68A6] outline-none shadow-sm focus:ring-2 focus:ring-[#B19CD9]"
        >
          {months.map(m => <option key={m} value={m.toLowerCase()}>{m}</option>)}
        </select>
      </header>

      {/* Month Banner */}
      <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-r from-[#7B68A6] to-[#6B5FCF] flex items-center justify-center shadow-xl" style={{ height: '200px' }}>
         <div className="absolute inset-0 flex items-center justify-center opacity-10 select-none">
            <span className="text-[180px] font-black tracking-tighter text-white">{bannerAbbr}</span>
         </div>
         <div className="relative text-center space-y-2">
            <h2 className="text-5xl font-bold text-white serif uppercase tracking-widest">{selectedMonth}</h2>
            <div className="w-24 h-1 bg-[#D4AF37] mx-auto rounded-full" />
            <p className="text-white/80 font-medium italic mt-4">"{userName}'s space for clarity"</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Section 1: Month Snapshot */}
        <section className="paper-card p-0 overflow-hidden shadow-lg border-[#E0F2FE]">
          <div className="bg-[#E0F2FE] px-8 py-3 flex items-center gap-2 border-b border-[#E0F2FE]">
            <span>📋</span>
            <h3 className="font-bold text-[#0369A1] uppercase tracking-widest text-xs">Month Snapshot</h3>
          </div>
          <div className="p-8 space-y-6">
            <p className="text-sm text-gray-400 italic font-medium">Any memorable events that happened this month?</p>
            <div className="space-y-4">
              {reset.snapshot.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#0369A1] shrink-0" />
                  <input 
                    className="flex-1 bg-transparent border-b border-[#eee] py-1 outline-none text-gray-700"
                    placeholder="Bullet point..."
                    value={item}
                    onChange={(e) => {
                      const newList = [...reset.snapshot];
                      newList[i] = e.target.value;
                      updateReset({ snapshot: newList });
                    }}
                  />
                  <button onClick={() => updateReset({ snapshot: reset.snapshot.filter((_, idx) => idx !== i) })}>
                    <X size={14} className="text-gray-300 hover:text-red-400" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => updateReset({ snapshot: [...reset.snapshot, ''] })}
                className="text-xs font-bold text-[#0369A1] hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> Add memory
              </button>
            </div>
          </div>
        </section>

        {/* Section 2: Monthly Reflection */}
        <section className="paper-card p-0 overflow-hidden shadow-lg border-[#FCE7F3] lg:row-span-2">
          <div className="bg-[#FCE7F3] px-8 py-3 flex items-center gap-2 border-b border-[#FCE7F3]">
            <span>🧠</span>
            <h3 className="font-bold text-[#BE185D] uppercase tracking-widest text-xs">Monthly Reflection</h3>
          </div>
          <div className="p-8 space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">What I am grateful for</label>
              <div className="relative">
                <textarea
                  className="w-full h-24 p-4 pr-12 bg-[#F8F7FC] border border-[#eee] rounded-2xl outline-none focus:ring-1 focus:ring-[#BE185D] text-sm italic"
                  placeholder="🌈 I'm grateful for..."
                  value={reset.reflection.grateful}
                  onChange={(e) => updateReset({ reflection: { ...reset.reflection, grateful: e.target.value } })}
                />
                <div className="absolute right-3 top-3">
                  <MicButton onTranscript={(text) => updateReset({ reflection: { ...reset.reflection, grateful: (reset.reflection.grateful ? reset.reflection.grateful + ' ' : '') + text } })} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">What felt heavy or draining</label>
              <div className="relative">
                <textarea
                  className="w-full h-24 p-4 pr-12 bg-[#F8F7FC] border border-[#eee] rounded-2xl outline-none focus:ring-1 focus:ring-[#BE185D] text-sm italic"
                  placeholder="🌑 This month, I felt weighed down by..."
                  value={reset.reflection.heavy}
                  onChange={(e) => updateReset({ reflection: { ...reset.reflection, heavy: e.target.value } })}
                />
                <div className="absolute right-3 top-3">
                  <MicButton onTranscript={(text) => updateReset({ reflection: { ...reset.reflection, heavy: (reset.reflection.heavy ? reset.reflection.heavy + ' ' : '') + text } })} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">What am I proud of</label>
              <div className="relative">
                <textarea
                  className="w-full h-24 p-4 pr-12 bg-[#F8F7FC] border border-[#eee] rounded-2xl outline-none focus:ring-1 focus:ring-[#BE185D] text-sm italic"
                  placeholder="📌 Celebrating these wins..."
                  value={reset.reflection.proud}
                  onChange={(e) => updateReset({ reflection: { ...reset.reflection, proud: e.target.value } })}
                />
                <div className="absolute right-3 top-3">
                  <MicButton onTranscript={(text) => updateReset({ reflection: { ...reset.reflection, proud: (reset.reflection.proud ? reset.reflection.proud + ' ' : '') + text } })} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">What do I want less of next month</label>
              <div className="relative">
                <textarea
                  className="w-full h-24 p-4 pr-12 bg-[#F8F7FC] border border-[#eee] rounded-2xl outline-none focus:ring-1 focus:ring-[#BE185D] text-sm italic"
                  placeholder="➖ Letting go of..."
                  value={reset.reflection.wantLess}
                  onChange={(e) => updateReset({ reflection: { ...reset.reflection, wantLess: e.target.value } })}
                />
                <div className="absolute right-3 top-3">
                  <MicButton onTranscript={(text) => updateReset({ reflection: { ...reset.reflection, wantLess: (reset.reflection.wantLess ? reset.reflection.wantLess + ' ' : '') + text } })} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Summary Card */}
        <section className="bg-[#FEE2E2] rounded-[32px] p-8 shadow-inner space-y-4">
          <label className="text-xl serif font-bold text-[#D4756B]">One sentence summary of this month:</label>
          <input 
            className="w-full bg-white/50 border-none rounded-xl p-4 text-[#D4756B] placeholder:text-[#D4756B]/40 font-bold outline-none italic"
            placeholder="✏️ How would you sum it up?"
            value={reset.summary}
            onChange={(e) => updateReset({ summary: e.target.value })}
          />
        </section>

        {/* Section 4: Intentions for next month */}
        <section className="paper-card p-0 overflow-hidden shadow-lg border-[#FEF3C7] lg:col-span-2">
           <div className="bg-[#FEF3C7] px-8 py-3 flex items-center gap-2 border-b border-[#FEF3C7]">
            <span>✨</span>
            <h3 className="font-bold text-[#B45309] uppercase tracking-widest text-xs">Intentions for the Month Ahead</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-6">
                <div>
                   <label className="text-sm font-bold text-gray-600 block mb-4">Next month, I want to feel:</label>
                   <div className="grid grid-cols-2 gap-3">
                      {["Calm", "Focused", "Curious", "Grounded", "Rested", "Abundant", "Confident", "Peaceful"].map(feeling => (
                        <button 
                          key={feeling}
                          onClick={() => {
                            const current = reset.intentions.feelings;
                            const next = current.includes(feeling) ? current.filter(f => f !== feeling) : [...current, feeling];
                            updateReset({ intentions: { ...reset.intentions, feelings: next } });
                          }}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${reset.intentions.feelings.includes(feeling) ? 'bg-[#D4AF37] border-[#D4AF37] text-white' : 'bg-white border-[#eee] text-gray-400'}`}
                        >
                          <div className={`w-3 h-3 rounded-full ${reset.intentions.feelings.includes(feeling) ? 'bg-white' : 'bg-gray-100'}`} />
                          {feeling}
                        </button>
                      ))}
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-bold text-[#D4756B]">Reminder to self for next month:</label>
                   <input 
                    className="w-full bg-[#F8F7FC] border-none rounded-2xl p-4 text-[#D4756B] font-bold outline-none shadow-inner"
                    placeholder="💌 A little love note to yourself..."
                    value={reset.intentions.reminder}
                    onChange={(e) => updateReset({ intentions: { ...reset.intentions, reminder: e.target.value } })}
                   />
                </div>
             </div>
             <div className="space-y-4">
                <label className="text-sm font-bold text-gray-600">Goals for next month</label>
                <div className="relative">
                  <textarea
                    className="w-full h-full min-h-[250px] p-6 pr-14 bg-[#F8F7FC] border border-[#eee] rounded-3xl outline-none focus:ring-1 focus:ring-[#D4AF37] text-sm italic leading-relaxed"
                    placeholder="⭐ What big shifts are we focusing on? Specific, actionable targets..."
                    value={reset.intentions.goals}
                    onChange={(e) => updateReset({ intentions: { ...reset.intentions, goals: e.target.value } })}
                  />
                  <div className="absolute right-4 top-4">
                    <MicButton onTranscript={(text) => updateReset({ intentions: { ...reset.intentions, goals: (reset.intentions.goals ? reset.intentions.goals + ' ' : '') + text } })} />
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* Section 5: Financial Check-In */}
        <section className="paper-card p-0 overflow-hidden shadow-lg border-[#E9D5FF] lg:col-span-2">
           <div className="bg-[#E9D5FF] px-8 py-3 flex items-center justify-between border-b border-[#E9D5FF]">
            <div className="flex items-center gap-2">
              <span>💰</span>
              <h3 className="font-bold text-[#7B68A6] uppercase tracking-widest text-xs">Financial Check-In</h3>
            </div>
            {isPremium && (
              <button 
                onClick={handleAIInsight}
                disabled={loadingAI}
                className="flex items-center gap-2 px-4 py-1.5 bg-[#7B68A6] text-white text-[10px] font-bold rounded-full hover:bg-[#6B5FCF] transition-all disabled:opacity-50"
              >
                <BrainCircuit size={14} />
                {loadingAI ? 'Analyzing...' : 'Generate Monthly Money Insight'}
              </button>
            )}
          </div>
          <div className="p-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div className="p-4 bg-[#F8F7FC] rounded-2xl border border-[#eee]">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Money In</span>
                  <p className="text-2xl font-bold text-[#7B68A6]">${reset.financialCheckIn.moneyIn.toLocaleString()}</p>
               </div>
               <div className="p-4 bg-[#F8F7FC] rounded-2xl border border-[#eee]">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Money Out</span>
                  <p className="text-2xl font-bold text-[#7B68A6]">${reset.financialCheckIn.moneyOut.toLocaleString()}</p>
               </div>
               <div className="p-4 bg-[#F8F7FC] rounded-2xl border border-[#eee]">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Total Saved</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-bold">$</span>
                    <input 
                      type="number"
                      className="w-full bg-transparent outline-none font-bold text-2xl text-[#7B68A6]"
                      value={reset.financialCheckIn.saved}
                      onChange={(e) => updateReset({ financialCheckIn: { ...reset.financialCheckIn, saved: Number(e.target.value) } })}
                    />
                  </div>
               </div>
               <div className="p-4 bg-[#F8F7FC] rounded-2xl border border-[#eee]">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Debt Paid</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-bold">$</span>
                    <input 
                      type="number"
                      className="w-full bg-transparent outline-none font-bold text-2xl text-[#7B68A6]"
                      value={reset.financialCheckIn.debtPaid}
                      onChange={(e) => updateReset({ financialCheckIn: { ...reset.financialCheckIn, debtPaid: Number(e.target.value) } })}
                    />
                  </div>
               </div>
            </div>

            {reset.financialCheckIn.aiInsight && (
              <div className="p-6 bg-[#B19CD9]/10 rounded-3xl border border-dashed border-[#B19CD9] animate-in slide-in-from-top-4 duration-500">
                 <h4 className="text-xs font-bold text-[#7B68A6] uppercase tracking-widest mb-3 flex items-center gap-2"><Sparkles size={14}/> Personalized Money Insight</h4>
                 <p className="text-sm italic text-[#3D2D7C] leading-relaxed">"{reset.financialCheckIn.aiInsight}"</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-500">Unexpected expense this month</label>
                     <div className="flex gap-4">
                        <input 
                          className="flex-1 p-4 bg-[#F8F7FC] border border-[#eee] rounded-2xl outline-none text-sm"
                          placeholder="What was it?"
                          value={reset.financialCheckIn.unexpectedExpense}
                          onChange={(e) => updateReset({ financialCheckIn: { ...reset.financialCheckIn, unexpectedExpense: e.target.value } })}
                        />
                        <div className="w-32 relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                           <input 
                            type="number"
                            className="w-full pl-8 pr-4 py-4 bg-[#F8F7FC] border border-[#eee] rounded-2xl outline-none text-sm"
                            value={reset.financialCheckIn.unexpectedAmount}
                            onChange={(e) => updateReset({ financialCheckIn: { ...reset.financialCheckIn, unexpectedAmount: Number(e.target.value) } })}
                           />
                        </div>
                     </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">Best financial decision I made</label>
                    <div className="relative">
                      <textarea
                        className="w-full h-32 p-4 pr-12 bg-[#F8F7FC] border border-[#eee] rounded-2xl outline-none text-sm italic"
                        placeholder="Setting a boundary? Buying quality over quantity? Canceling a service?"
                        value={reset.financialCheckIn.bestDecision}
                        onChange={(e) => updateReset({ financialCheckIn: { ...reset.financialCheckIn, bestDecision: e.target.value } })}
                      />
                      <div className="absolute right-3 top-3">
                        <MicButton onTranscript={(text) => updateReset({ financialCheckIn: { ...reset.financialCheckIn, bestDecision: (reset.financialCheckIn.bestDecision ? reset.financialCheckIn.bestDecision + ' ' : '') + text } })} />
                      </div>
                    </div>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">One thing I'd do differently</label>
                  <div className="relative">
                    <textarea
                      className="w-full h-full min-h-[150px] p-6 pr-14 bg-[#F8F7FC] border border-[#eee] rounded-[32px] outline-none text-sm italic leading-relaxed"
                      placeholder="Reflecting on missed opportunities for better flow..."
                      value={reset.financialCheckIn.doDifferently}
                      onChange={(e) => updateReset({ financialCheckIn: { ...reset.financialCheckIn, doDifferently: e.target.value } })}
                    />
                    <div className="absolute right-4 top-4">
                      <MicButton onTranscript={(text) => updateReset({ financialCheckIn: { ...reset.financialCheckIn, doDifferently: (reset.financialCheckIn.doDifferently ? reset.financialCheckIn.doDifferently + ' ' : '') + text } })} />
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

      </div>

      <div className="flex justify-center pt-10">
         <button 
           onClick={handleComplete}
           className={`px-12 py-5 rounded-full font-bold text-xl transition-all flex items-center gap-3 shadow-2xl ${reset.completedAt ? 'bg-[#10B981] text-white' : 'bg-[#7B68A6] text-white hover:bg-[#B19CD9] hover:scale-105 active:scale-95'}`}
         >
           {reset.completedAt ? (
             <><CheckCircle2 /> {months.find(m => m.toLowerCase() === selectedMonth)} Reset Complete</>
           ) : (
             <><Save /> Complete Monthly Reset</>
           )}
         </button>
      </div>

      <div className="fixed bottom-10 right-10 opacity-10 pointer-events-none select-none">
         <Sparkles size={120} className="text-[#7B68A6]"/>
      </div>
    </div>
  );
};

export default MonthlyReset;
