
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

  const pFocus = data?.plannerFocus || { monthlyThemes: {}, weeklyFocus: {}, dailyExecution: {} };

  const updatePlanner = (updates: Partial<PlannerFocus>) => {
    if (data?.isArchived) return;
    updateData({
      ...data,
      plannerFocus: { ...pFocus, ...updates }
    });
  };

  const getMonthData = (idx: number) => pFocus.monthlyThemes?.[idx] || {
    theme: '', financialTarget: '', wellnessTarget: '', wordOfMonth: '', reflectionPreview: ''
  };

  const getDayData = (date: string) => pFocus.dailyExecution?.[date] || {
    morning: { priorities: ['', '', ''], financialAction: '', wellnessAction: '' },
    midday: { focusBlock1: '', focusBlock2: '' },
    evening: { wins: '', reflection: '', adjustments: '' }
  };

  const getWeekKey = (month: number, week: number) => `${month}-${week}`;
  const getWeekData = (month: number, week: number) => pFocus.weeklyFocus?.[getWeekKey(month, week)] || {
    outcomes: ['', '', ''], financialMove: '', energyFocus: '', eliminate: '', affirmation: ''
  };

  // ... render methods with safe access ...
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
                  readOnly={data.isArchived}
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
                    readOnly={data.isArchived}
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
                    readOnly={data.isArchived}
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
                  readOnly={data.isArchived}
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
        {/* ... Rest of Calendar Grid with same safety ... */}
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
        {/* View Mode & Sync Buttons */}
      </header>
      {viewMode === 'monthly' && renderMonthlyView()}
      {/* ... other views ... */}
    </div>
  );
};

export default Planner;
