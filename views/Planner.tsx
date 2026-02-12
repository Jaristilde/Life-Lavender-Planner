
import React, { useState, useEffect } from 'react';
import { YearData, GoogleSyncSettings, PlannerFocus } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  LayoutGrid, 
  Columns, 
  CheckSquare, 
  RefreshCcw, 
  Cloud,
  Lock,
  LogOut,
  Settings2,
  CalendarCheck2
} from 'lucide-react';

interface PlannerProps {
  data: YearData;
  updateData: (d: YearData) => void;
  googleSync: GoogleSyncSettings;
  updateGoogleSync: (s: Partial<GoogleSyncSettings>) => void;
}

const Planner: React.FC<PlannerProps> = ({ data, updateData, googleSync, updateGoogleSync }) => {
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSyncing, setIsSyncing] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const updatePlanner = (updates: Partial<PlannerFocus>) => {
    if (data.isArchived) return;
    updateData({
      ...data,
      plannerFocus: { ...data.plannerFocus, ...updates }
    });
  };

  const getMonthData = (idx: number) => data.plannerFocus.monthlyThemes[idx] || {
    theme: '', financialTarget: '', wellnessTarget: '', wordOfMonth: '', reflectionPreview: ''
  };

  const getDayData = (date: string) => data.plannerFocus.dailyExecution[date] || {
    morning: { priorities: ['', '', ''], financialAction: '', wellnessAction: '' },
    midday: { focusBlock1: '', focusBlock2: '' },
    evening: { wins: '', reflection: '', adjustments: '' }
  };

  const getWeekKey = (month: number, week: number) => `${month}-${week}`;
  const getWeekData = (month: number, week: number) => data.plannerFocus.weeklyFocus[getWeekKey(month, week)] || {
    outcomes: ['', '', ''], financialMove: '', energyFocus: '', eliminate: '', affirmation: ''
  };

  const handleGoogleAuth = () => {
    setIsSyncing(true);
    // Simulate OAuth Login
    setTimeout(() => {
      updateGoogleSync({ isConnected: !googleSync.isConnected, enabled: !googleSync.isConnected });
      setIsSyncing(false);
    }, 1500);
  };

  const syncNow = () => {
    if (!googleSync.isConnected) return;
    setIsSyncing(true);
    setTimeout(() => {
      updateGoogleSync({ lastSynced: new Date().toLocaleTimeString() });
      setIsSyncing(false);
    }, 1000);
  };

  const renderMonthlyView = () => {
    const monthData = getMonthData(selectedMonth);
    return (
      <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-left-4 duration-500">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-6">
          <div className="paper-card p-8 bg-white border-l-8 border-[#B19CD9]">
            <h3 className="serif text-2xl font-bold text-[#7B68A6] mb-8">Monthly Strategy</h3>
            <div className="space-y-6">
              <div className="group">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block group-focus-within:text-[#B19CD9] transition-colors">Monthly Theme</label>
                <input 
                  className="w-full bg-transparent border-b border-[#E6D5F0] py-2 outline-none italic text-lg"
                  placeholder="The focus of this month..."
                  value={monthData.theme}
                  readOnly={data.isArchived}
                  onChange={(e) => {
                    const themes = { ...data.plannerFocus.monthlyThemes };
                    themes[selectedMonth] = { ...monthData, theme: e.target.value };
                    updatePlanner({ monthlyThemes: themes });
                  }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Financial Target</label>
                  <input 
                    className="w-full bg-[#F8F7FC] rounded-lg px-4 py-3 border border-[#E6D5F0] outline-none focus:ring-2 focus:ring-[#B19CD9]"
                    placeholder="$ Goal"
                    value={monthData.financialTarget}
                    readOnly={data.isArchived}
                    onChange={(e) => {
                      const themes = { ...data.plannerFocus.monthlyThemes };
                      themes[selectedMonth] = { ...monthData, financialTarget: e.target.value };
                      updatePlanner({ monthlyThemes: themes });
                    }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Wellness Target</label>
                  <input 
                    className="w-full bg-[#F8F7FC] rounded-lg px-4 py-3 border border-[#E6D5F0] outline-none focus:ring-2 focus:ring-[#B19CD9]"
                    placeholder="Health Goal"
                    value={monthData.wellnessTarget}
                    readOnly={data.isArchived}
                    onChange={(e) => {
                      const themes = { ...data.plannerFocus.monthlyThemes };
                      themes[selectedMonth] = { ...monthData, wellnessTarget: e.target.value };
                      updatePlanner({ monthlyThemes: themes });
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Word of the Month</label>
                <input 
                  className="w-full bg-transparent border-b-2 border-[#D4AF37] py-2 outline-none font-bold text-[#7B68A6] text-xl text-center"
                  placeholder="WORD"
                  value={monthData.wordOfMonth}
                  readOnly={data.isArchived}
                  onChange={(e) => {
                    const themes = { ...data.plannerFocus.monthlyThemes };
                    themes[selectedMonth] = { ...monthData, wordOfMonth: e.target.value };
                    updatePlanner({ monthlyThemes: themes });
                  }}
                />
              </div>
            </div>
          </div>

          <div className="paper-card p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#7B68A6] mb-4">Monthly Reflection Preview</h3>
            <textarea 
              className="w-full min-h-[100px] bg-transparent outline-none italic text-sm text-gray-600 resize-none"
              placeholder="Jot down seeds for reflection..."
              value={monthData.reflectionPreview}
              readOnly={data.isArchived}
              onChange={(e) => {
                const themes = { ...data.plannerFocus.monthlyThemes };
                themes[selectedMonth] = { ...monthData, reflectionPreview: e.target.value };
                updatePlanner({ monthlyThemes: themes });
              }}
            />
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="lg:w-2/3 paper-card overflow-hidden flex flex-col">
          <div className="bg-[#B19CD9] p-4 text-white flex justify-between items-center">
            <h4 className="serif text-xl font-bold">{months[selectedMonth]} {data.year}</h4>
            <div className="flex gap-2">
               <button onClick={() => setSelectedMonth(m => Math.max(0, m - 1))} className="p-1 hover:bg-white/20 rounded"><ChevronLeft size={20}/></button>
               <button onClick={() => setSelectedMonth(m => Math.min(11, m + 1))} className="p-1 hover:bg-white/20 rounded"><ChevronRight size={20}/></button>
            </div>
          </div>
          <div className="grid grid-cols-7 border-b border-[#eee] bg-gray-50/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400 border-r border-[#eee] last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 grid-rows-5 flex-1">
            {Array.from({ length: 35 }).map((_, i) => {
              const dayNum = i - 1; // Basic logic for demo
              const isGoogleEvent = googleSync.isConnected && googleSync.showEvents && (i % 7 === 2);
              return (
                <div 
                  key={i} 
                  className={`min-h-[120px] p-2 border-r border-b border-[#eee] last:border-r-0 transition-colors group relative ${
                    dayNum > 0 && dayNum <= 31 ? 'hover:bg-[#F8F7FC] cursor-pointer' : 'bg-gray-50/20'
                  }`}
                  onClick={() => { if (dayNum > 0 && dayNum <= 31) { setViewMode('daily'); setSelectedDate(`${data.year}-${selectedMonth+1}-${dayNum}`); } }}
                >
                  {dayNum > 0 && dayNum <= 31 && (
                    <>
                      <span className="text-xs font-bold text-gray-300 group-hover:text-[#B19CD9]">{dayNum}</span>
                      <div className="space-y-1 mt-1">
                        {isGoogleEvent && (
                          <div className="text-[9px] bg-blue-50 text-blue-600 p-1 rounded border border-blue-100 font-bold flex items-center gap-1">
                            <Cloud size={8} /> G-Calendar Event
                          </div>
                        )}
                        {dayNum === 15 && (
                          <div className="text-[9px] bg-[#E6D5F0] text-[#7B68A6] p-1 rounded font-bold">Lavender Meetup</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderWeeklyView = () => {
    const weekData = getWeekData(selectedMonth, 0); 
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="space-y-6">
          <div className="paper-card p-10 bg-[#F8F7FC] border-t-8 border-[#B19CD9]">
            <h3 className="serif text-3xl font-bold text-[#7B68A6] mb-8">Weekly Intent</h3>
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 block">Top 3 Weekly Outcomes</label>
                <div className="space-y-3">
                  {weekData.outcomes.map((o, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-[#E6D5F0] shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-[#E6D5F0] flex items-center justify-center text-[#7B68A6] font-bold text-sm">{i+1}</div>
                      <input 
                        className="flex-1 bg-transparent outline-none text-sm" 
                        placeholder="Define your win..." 
                        value={o}
                        readOnly={data.isArchived}
                        onChange={(e) => {
                          const w = { ...data.plannerFocus.weeklyFocus };
                          const key = getWeekKey(selectedMonth, 0);
                          const outcomes = [...weekData.outcomes];
                          outcomes[i] = e.target.value;
                          w[key] = { ...weekData, outcomes };
                          updatePlanner({ weeklyFocus: w });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Financial Move</label>
                   <textarea 
                    className="w-full bg-white p-4 rounded-xl border border-[#E6D5F0] outline-none text-sm italic resize-none"
                    placeholder="Move $200 to savings..."
                    value={weekData.financialMove}
                    readOnly={data.isArchived}
                    onChange={(e) => {
                      const w = { ...data.plannerFocus.weeklyFocus };
                      const key = getWeekKey(selectedMonth, 0);
                      w[key] = { ...weekData, financialMove: e.target.value };
                      updatePlanner({ weeklyFocus: w });
                    }}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Energy Focus</label>
                   <textarea 
                    className="w-full bg-white p-4 rounded-xl border border-[#E6D5F0] outline-none text-sm italic resize-none"
                    placeholder="High-vibe nourishment..."
                    value={weekData.energyFocus}
                    readOnly={data.isArchived}
                    onChange={(e) => {
                      const w = { ...data.plannerFocus.weeklyFocus };
                      const key = getWeekKey(selectedMonth, 0);
                      w[key] = { ...weekData, energyFocus: e.target.value };
                      updatePlanner({ weeklyFocus: w });
                    }}
                   />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-bold uppercase text-red-400 block">One Thing to Eliminate</label>
                  <input 
                    className="w-full bg-white px-4 py-3 rounded-xl border border-red-100 outline-none text-sm"
                    placeholder="e.g. Excessive scrolling"
                    value={weekData.eliminate}
                    readOnly={data.isArchived}
                    onChange={(e) => {
                      const w = { ...data.plannerFocus.weeklyFocus };
                      const key = getWeekKey(selectedMonth, 0);
                      w[key] = { ...weekData, eliminate: e.target.value };
                      updatePlanner({ weeklyFocus: w });
                    }}
                  />
                </div>
              </div>

              <div className="bg-[#B19CD9]/10 p-6 rounded-2xl border border-dashed border-[#B19CD9]">
                 <label className="text-[10px] font-bold uppercase text-[#7B68A6] mb-2 block">Weekly Affirmation</label>
                 <textarea 
                    className="w-full bg-transparent outline-none text-center serif italic text-xl text-[#7B68A6] resize-none"
                    placeholder="I am capable, strong, and deserving."
                    value={weekData.affirmation}
                    readOnly={data.isArchived}
                    onChange={(e) => {
                      const w = { ...data.plannerFocus.weeklyFocus };
                      const key = getWeekKey(selectedMonth, 0);
                      w[key] = { ...weekData, affirmation: e.target.value };
                      updatePlanner({ weeklyFocus: w });
                    }}
                 />
              </div>
            </div>
          </div>
        </div>

        <div className="paper-card p-10 h-fit">
           <div className="flex items-center gap-3 mb-8">
             <CalendarCheck2 className="text-[#B19CD9]" />
             <h3 className="text-2xl font-bold">Linked Task Board</h3>
           </div>
           <div className="space-y-4">
             {data.wellness.dailyToDos.length > 0 ? data.wellness.dailyToDos.slice(0, 10).map(task => (
               <div key={task.id} className="flex items-center gap-4 p-4 bg-[#F8F7FC] rounded-2xl border border-[#eee] hover:border-[#B19CD9] transition-colors cursor-pointer">
                 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-[#B19CD9] border-[#B19CD9]' : 'border-[#E6D5F0]'}`}>
                  {task.completed && <div className="w-2 h-2 bg-white rounded-full" />}
                 </div>
                 <span className={`flex-1 font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.text}</span>
               </div>
             )) : (
              <p className="text-gray-400 italic text-center py-10">Sync your wellness tasks here...</p>
             )}
           </div>
        </div>
      </div>
    );
  };

  const renderDailyView = () => {
    const dayData = getDayData(selectedDate);
    return (
      <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-500 pb-12">
        <div className="text-center">
          <h2 className="text-5xl serif font-bold text-[#7B68A6] mb-2">{selectedDate}</h2>
          <div className="w-24 h-1 bg-[#D4AF37] mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Morning Section */}
           <div className="paper-card p-10 border-t-8 border-[#B19CD9]">
             <div className="flex items-center gap-3 mb-8">
               <div className="p-2 bg-[#E6D5F0] rounded-lg"><Sparkles size={20} className="text-[#7B68A6]" /></div>
               <h3 className="serif text-3xl font-bold">Morning Rise</h3>
             </div>
             <div className="space-y-8">
               <div>
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4">Top 3 Priorities</label>
                 {dayData.morning.priorities.map((p, i) => (
                   <div key={i} className="flex gap-4 mb-4 items-center">
                     <span className="text-xs font-bold text-[#B19CD9]">{i+1}.</span>
                     <input 
                      className="flex-1 border-b border-[#E6D5F0] py-2 outline-none text-sm bg-transparent" 
                      placeholder="My essential task" 
                      value={p}
                      readOnly={data.isArchived}
                      onChange={(e) => {
                        const d = { ...data.plannerFocus.dailyExecution };
                        const priorities = [...dayData.morning.priorities];
                        priorities[i] = e.target.value;
                        d[selectedDate] = { ...dayData, morning: { ...dayData.morning, priorities } };
                        updatePlanner({ dailyExecution: d });
                      }}
                     />
                   </div>
                 ))}
               </div>
               <div className="grid grid-cols-1 gap-4">
                 <div className="p-5 bg-[#F8F7FC] rounded-2xl border border-[#E6D5F0]">
                   <span className="text-[10px] uppercase font-bold text-[#7B68A6] block mb-2">Financial Action</span>
                   <input 
                    className="w-full bg-transparent text-sm outline-none border-none placeholder:text-gray-300" 
                    placeholder="e.g. Log yesterday's spend"
                    value={dayData.morning.financialAction}
                    readOnly={data.isArchived}
                    onChange={(e) => {
                      const d = { ...data.plannerFocus.dailyExecution };
                      d[selectedDate] = { ...dayData, morning: { ...dayData.morning, financialAction: e.target.value } };
                      updatePlanner({ dailyExecution: d });
                    }}
                   />
                 </div>
                 <div className="p-5 bg-[#F8F7FC] rounded-2xl border border-[#E6D5F0]">
                   <span className="text-[10px] uppercase font-bold text-[#7B68A6] block mb-2">Wellness Action</span>
                   <input 
                    className="w-full bg-transparent text-sm outline-none border-none placeholder:text-gray-300" 
                    placeholder="e.g. 5 min breathwork"
                    value={dayData.morning.wellnessAction}
                    readOnly={data.isArchived}
                    onChange={(e) => {
                      const d = { ...data.plannerFocus.dailyExecution };
                      d[selectedDate] = { ...dayData, morning: { ...dayData.morning, wellnessAction: e.target.value } };
                      updatePlanner({ dailyExecution: d });
                    }}
                   />
                 </div>
               </div>
             </div>
           </div>

           {/* Midday Focus */}
           <div className="paper-card p-10">
             <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-[#E6D5F0] rounded-lg"><LayoutGrid size={20} className="text-[#7B68A6]" /></div>
                <h3 className="serif text-3xl font-bold">Midday Flow</h3>
             </div>
             <div className="space-y-6">
                <div className="p-6 bg-[#E6D5F0]/20 rounded-2xl border border-[#E6D5F0] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#B19CD9]/5 -mr-8 -mt-8 rounded-full" />
                  <span className="text-xs font-bold text-[#7B68A6] block mb-2">Focus Block 1</span>
                  <input 
                    className="w-full bg-transparent border-b-2 border-[#E6D5F0] py-2 outline-none font-bold text-gray-700"
                    placeholder="Deep work target..."
                    value={dayData.midday.focusBlock1}
                    readOnly={data.isArchived}
                    onChange={(e) => {
                      const d = { ...data.plannerFocus.dailyExecution };
                      d[selectedDate] = { ...dayData, midday: { ...dayData.midday, focusBlock1: e.target.value } };
                      updatePlanner({ dailyExecution: d });
                    }}
                  />
                </div>
                <div className="p-6 bg-[#E6D5F0]/20 rounded-2xl border border-[#E6D5F0] relative overflow-hidden">
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#B19CD9]/5 -mr-8 -mb-8 rounded-full" />
                  <span className="text-xs font-bold text-[#7B68A6] block mb-2">Focus Block 2</span>
                  <input 
                    className="w-full bg-transparent border-b-2 border-[#E6D5F0] py-2 outline-none font-bold text-gray-700"
                    placeholder="Secondary target..."
                    value={dayData.midday.focusBlock2}
                    readOnly={data.isArchived}
                    onChange={(e) => {
                      const d = { ...data.plannerFocus.dailyExecution };
                      d[selectedDate] = { ...dayData, midday: { ...dayData.midday, focusBlock2: e.target.value } };
                      updatePlanner({ dailyExecution: d });
                    }}
                  />
                </div>
             </div>
           </div>
        </div>

        {/* Evening Section */}
        <div className="paper-card p-12 bg-white relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#B19CD9] text-white px-8 py-2 rounded-full font-bold shadow-lg">
            Evening Reset
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-4">
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] block text-center">Daily Wins</label>
              <textarea 
                className="w-full h-40 p-4 bg-[#F8F7FC] rounded-2xl outline-none border border-[#E6D5F0] text-sm italic shadow-inner" 
                placeholder="What went well? Celebrating..."
                value={dayData.evening.wins}
                readOnly={data.isArchived}
                onChange={(e) => {
                  const d = { ...data.plannerFocus.dailyExecution };
                  d[selectedDate] = { ...dayData, evening: { ...dayData.evening, wins: e.target.value } };
                  updatePlanner({ dailyExecution: d });
                }}
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#B19CD9] block text-center">Reflection</label>
              <textarea 
                className="w-full h-40 p-4 bg-[#F8F7FC] rounded-2xl outline-none border border-[#E6D5F0] text-sm italic shadow-inner" 
                placeholder="How did I feel today? Lessons..."
                value={dayData.evening.reflection}
                readOnly={data.isArchived}
                onChange={(e) => {
                  const d = { ...data.plannerFocus.dailyExecution };
                  d[selectedDate] = { ...dayData, evening: { ...dayData.evening, reflection: e.target.value } };
                  updatePlanner({ dailyExecution: d });
                }}
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block text-center">Adjust Tomorrow</label>
              <textarea 
                className="w-full h-40 p-4 bg-[#F8F7FC] rounded-2xl outline-none border border-[#E6D5F0] text-sm italic shadow-inner" 
                placeholder="Course correcting for a better day..."
                value={dayData.evening.adjustments}
                readOnly={data.isArchived}
                onChange={(e) => {
                  const d = { ...data.plannerFocus.dailyExecution };
                  d[selectedDate] = { ...dayData, evening: { ...dayData.evening, adjustments: e.target.value } };
                  updatePlanner({ dailyExecution: d });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 min-h-screen pb-20">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-1">Planner Hub</h1>
          <p className="text-gray-500 italic">Navigate from vision to execution seamlessly.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4">
           {/* View Selector */}
           <div className="flex bg-white paper-card p-1 shadow-sm">
             <button 
               onClick={() => setViewMode('monthly')}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${viewMode === 'monthly' ? 'bg-[#B19CD9] text-white shadow-md' : 'text-gray-400 hover:text-[#7B68A6]'}`}
             >
               <LayoutGrid size={16} /> Monthly
             </button>
             <button 
               onClick={() => setViewMode('weekly')}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${viewMode === 'weekly' ? 'bg-[#B19CD9] text-white shadow-md' : 'text-gray-400 hover:text-[#7B68A6]'}`}
             >
               <Columns size={16} /> Weekly
             </button>
             <button 
               onClick={() => setViewMode('daily')}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${viewMode === 'daily' ? 'bg-[#B19CD9] text-white shadow-md' : 'text-gray-400 hover:text-[#7B68A6]'}`}
             >
               <CheckSquare size={16} /> Daily
             </button>
           </div>

           {/* Google Integration */}
           <div className="flex items-center gap-2 bg-white paper-card p-1 px-3 shadow-sm group">
             {googleSync.isConnected ? (
               <div className="flex items-center gap-3">
                 <div className="flex flex-col items-end">
                    <span className="text-[8px] font-bold text-green-500 uppercase tracking-tighter">Sync Active</span>
                    <span className="text-[7px] text-gray-400">Last: {googleSync.lastSynced || 'Never'}</span>
                 </div>
                 <div className="h-6 w-[1px] bg-gray-100" />
                 <button 
                   onClick={syncNow}
                   disabled={isSyncing}
                   className={`p-2 rounded-lg transition-all text-[#7B68A6] hover:bg-[#E6D5F0] ${isSyncing ? 'animate-spin' : ''}`}
                 >
                   <RefreshCcw size={16} />
                 </button>
                 <button 
                   onClick={() => updateGoogleSync({ showEvents: !googleSync.showEvents })}
                   className={`p-2 rounded-lg transition-all ${googleSync.showEvents ? 'text-[#B19CD9] bg-[#E6D5F0]/30' : 'text-gray-300'}`}
                 >
                   <CalendarIcon size={16} />
                 </button>
                 <button 
                   onClick={handleGoogleAuth}
                   className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50"
                   title="Disconnect Google"
                 >
                   <LogOut size={16} />
                 </button>
               </div>
             ) : (
               <button 
                 onClick={handleGoogleAuth}
                 disabled={isSyncing}
                 className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-500 hover:text-[#7B68A6] transition-colors"
               >
                 {isSyncing ? <RefreshCcw size={14} className="animate-spin" /> : <Cloud size={14} />}
                 Connect G-Calendar
               </button>
             )}
           </div>
        </div>
      </header>

      {viewMode === 'monthly' && renderMonthlyView()}
      {viewMode === 'weekly' && renderWeeklyView()}
      {viewMode === 'daily' && renderDailyView()}

      {data.isArchived && (
        <div className="fixed bottom-10 right-10 flex items-center gap-3 bg-gray-900/90 backdrop-blur-md text-white px-8 py-4 rounded-full shadow-2xl border border-white/10 z-50">
          <Lock size={20} className="text-[#B19CD9]" />
          <div>
            <span className="font-bold block text-sm tracking-wide">Archived Year</span>
            <span className="text-[10px] text-gray-400 block -mt-1 uppercase font-bold tracking-[0.2em]">Read Only Mode</span>
          </div>
        </div>
      )}
    </div>
  );
};

const Sparkles: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);

export default Planner;
