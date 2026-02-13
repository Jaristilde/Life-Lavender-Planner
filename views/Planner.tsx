import React, { useState } from 'react';
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
  Sparkles,
  CalendarCheck2,
  Sunrise
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

  const pFocus = data?.plannerFocus || { monthlyThemes: {}, weeklyFocus: {}, dailyExecution: {} };

  const updatePlanner = (updates: Partial<PlannerFocus>) => {
    if (data?.isArchived) return;
    updateData({
      ...data,
      plannerFocus: { ...pFocus, ...updates }
    });
  };

  const getMonthData = (idx: number) => pFocus?.monthlyThemes?.[idx] || {
    theme: '', financialTarget: '', wellnessTarget: '', wordOfMonth: '', reflectionPreview: ''
  };

  const getDayData = (date: string) => pFocus?.dailyExecution?.[date] || {
    morning: { priorities: ['', '', ''], financialAction: '', wellnessAction: '' },
    midday: { focusBlock1: '', focusBlock2: '' },
    evening: { wins: '', reflection: '', adjustments: '' }
  };

  const getWeekKey = (month: number, week: number) => `${month}-${week}`;
  const getWeekData = (month: number, week: number) => pFocus?.weeklyFocus?.[getWeekKey(month, week)] || {
    outcomes: ['', '', ''], financialMove: '', energyFocus: '', eliminate: '', affirmation: ''
  };

  const renderMonthlyView = () => {
    const monthData = getMonthData(selectedMonth);
    return (
      <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="lg:w-1/3 space-y-6">
          <div className="paper-card p-8 bg-white border-l-8 border-[#B19CD9]">
            <h3 className="serif text-2xl font-bold text-[#7B68A6] mb-8">Monthly Strategy</h3>
            <div className="space-y-6">
              <div className="group">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block group-focus-within:text-[#B19CD9] transition-colors">Monthly Theme</label>
                <input 
                  className="w-full bg-transparent border-b border-[#E6D5F0] py-2 outline-none italic text-lg"
                  placeholder="The focus of this month..."
                  value={monthData.theme || ''}
                  readOnly={data?.isArchived}
                  onChange={(e) => {
                    const themes = { ...(pFocus.monthlyThemes || {}) };
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
                    value={monthData.financialTarget || ''}
                    readOnly={data?.isArchived}
                    onChange={(e) => {
                      const themes = { ...(pFocus.monthlyThemes || {}) };
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
                    value={monthData.wellnessTarget || ''}
                    readOnly={data?.isArchived}
                    onChange={(e) => {
                      const themes = { ...(pFocus.monthlyThemes || {}) };
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
                  value={monthData.wordOfMonth || ''}
                  readOnly={data?.isArchived}
                  onChange={(e) => {
                    const themes = { ...(pFocus.monthlyThemes || {}) };
                    themes[selectedMonth] = { ...monthData, wordOfMonth: e.target.value };
                    updatePlanner({ monthlyThemes: themes });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 paper-card p-8">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                 <button onClick={() => setSelectedMonth(prev => prev > 0 ? prev - 1 : 11)} className="p-2 hover:bg-[#F8F7FC] rounded-full transition-colors"><ChevronLeft size={20} /></button>
                 <h2 className="serif text-3xl font-bold text-[#7B68A6] min-w-[150px] text-center">{months[selectedMonth]}</h2>
                 <button onClick={() => setSelectedMonth(prev => prev < 11 ? prev + 1 : 0)} className="p-2 hover:bg-[#F8F7FC] rounded-full transition-colors"><ChevronRight size={20} /></button>
              </div>
              <div className="flex items-center gap-2">
                 {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                   <div key={d} className="w-10 h-10 flex items-center justify-center text-[10px] font-bold text-gray-400">{d}</div>
                 ))}
              </div>
           </div>
           
           <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="aspect-square border border-[#F8F7FC] rounded-xl flex flex-col p-2 hover:bg-[#F8F7FC] transition-colors cursor-pointer group">
                  <span className="text-[10px] font-bold text-gray-300 group-hover:text-[#B19CD9]">{i + 1}</span>
                  <div className="flex-1 flex flex-col justify-end">
                    <div className="w-full h-1 bg-[#E6D5F0]/30 rounded-full mb-1" />
                    <div className="w-2/3 h-1 bg-[#E6D5F0]/30 rounded-full" />
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    );
  };

  const renderWeeklyView = () => {
    const weekData = getWeekData(selectedMonth, 1);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
         <div className="paper-card p-6 bg-white border-t-8 border-[#7B68A6] space-y-6">
           <h3 className="font-bold text-[#7B68A6] uppercase text-xs tracking-widest">Core Outcomes</h3>
           <div className="space-y-4">
              {(weekData?.outcomes || []).map((o, i) => (
                <input 
                  key={i}
                  className="w-full bg-transparent border-b border-[#E6D5F0] py-2 outline-none text-sm"
                  placeholder={`Outcome ${i+1}`}
                  value={o || ''}
                  readOnly={data?.isArchived}
                  onChange={(e) => {
                    const next = [...(weekData.outcomes || [])];
                    next[i] = e.target.value;
                    const weeks = { ...(pFocus.weeklyFocus || {}) };
                    weeks[getWeekKey(selectedMonth, 1)] = { ...weekData, outcomes: next };
                    updatePlanner({ weeklyFocus: weeks });
                  }}
                />
              ))}
           </div>
         </div>
      </div>
    );
  };

  const renderDailyView = () => {
    const dayData = getDayData(selectedDate);
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="paper-card p-8 bg-white border-t-8 border-[#B19CD9] space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Sunrise size={24} className="text-[#B19CD9]" />
            <h3 className="text-xl serif font-bold text-[#7B68A6]">Morning Execution</h3>
          </div>
          <div className="space-y-4">
            {(dayData?.morning?.priorities || []).map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                 <div className="w-6 h-6 rounded-full border-2 border-[#E6D5F0] flex-shrink-0" />
                 <input 
                  className="flex-1 bg-transparent border-b border-[#eee] py-2 outline-none text-sm"
                  placeholder={`Priority ${i+1}`}
                  value={p || ''}
                  readOnly={data?.isArchived}
                  onChange={(e) => {
                    const next = [...(dayData.morning.priorities || [])];
                    next[i] = e.target.value;
                    const days = { ...(pFocus.dailyExecution || {}) };
                    days[selectedDate] = { ...dayData, morning: { ...dayData.morning, priorities: next } };
                    updatePlanner({ dailyExecution: days });
                  }}
                 />
              </div>
            ))}
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
        <div className="flex items-center gap-4 bg-white p-1 rounded-2xl shadow-sm border border-[#eee]">
          <button 
            onClick={() => setViewMode('monthly')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all ${viewMode === 'monthly' ? 'bg-[#B19CD9] text-white shadow-lg' : 'text-gray-400 hover:text-[#7B68A6]'}`}
          >
            <LayoutGrid size={16} /> Monthly
          </button>
          <button 
            onClick={() => setViewMode('weekly')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all ${viewMode === 'weekly' ? 'bg-[#B19CD9] text-white shadow-lg' : 'text-gray-400 hover:text-[#7B68A6]'}`}
          >
            <Columns size={16} /> Weekly
          </button>
          <button 
            onClick={() => setViewMode('daily')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all ${viewMode === 'daily' ? 'bg-[#B19CD9] text-white shadow-lg' : 'text-gray-400 hover:text-[#7B68A6]'}`}
          >
            <CheckSquare size={16} /> Daily
          </button>
        </div>
      </header>

      {viewMode === 'monthly' && renderMonthlyView()}
      {viewMode === 'weekly' && renderWeeklyView()}
      {viewMode === 'daily' && renderDailyView()}
    </div>
  );
};

export default Planner;