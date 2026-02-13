
import React, { useState } from 'react';
import { YearData, GoogleSyncSettings, PlannerFocus, UserDailyMetrics, KanbanItem } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  LayoutGrid,
  Columns,
  CheckSquare,
  Plus,
  GripVertical,
  Trash2
} from 'lucide-react';
import { DEFAULT_DAILY_METRICS } from '../constants';

interface PlannerProps {
  data: YearData;
  updateData: (d: YearData) => void;
  googleSync: GoogleSyncSettings;
  updateGoogleSync: (s: Partial<GoogleSyncSettings>) => void;
}

const Planner: React.FC<PlannerProps> = ({ data, updateData }) => {
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly' | 'daily'>('daily');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

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

  const getDayMetrics = (date: string): UserDailyMetrics => {
    return data.dailyMetrics[date] || DEFAULT_DAILY_METRICS(date);
  };

  const updateDailyMetrics = (date: string, updates: Partial<UserDailyMetrics>) => {
    if (data.isArchived) return;
    const current = getDayMetrics(date);
    updateData({
      ...data,
      dailyMetrics: {
        ...data.dailyMetrics,
        [date]: { ...current, ...updates }
      }
    });
  };

  const renderDailyView = () => {
    const metrics = getDayMetrics(selectedDate);
    const dateObj = new Date(selectedDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const handleKanbanAdd = (column: keyof UserDailyMetrics['kanban']) => {
      const text = prompt('Enter task description:');
      if (!text) return;
      const newItem: KanbanItem = { id: Math.random().toString(36).substr(2, 9), text };
      const newKanban = { ...metrics.kanban, [column]: [...(metrics.kanban[column] || []), newItem] };
      updateDailyMetrics(selectedDate, { kanban: newKanban });
    };

    const handleKanbanRemove = (column: keyof UserDailyMetrics['kanban'], id: string) => {
      const newKanban = { ...metrics.kanban, [column]: (metrics.kanban[column] || []).filter(i => i.id !== id) };
      updateDailyMetrics(selectedDate, { kanban: newKanban });
    };

    const handleDragStart = (e: React.DragEvent, id: string, sourceCol: string) => {
      e.dataTransfer.setData('itemId', id);
      e.dataTransfer.setData('sourceCol', sourceCol);
    };

    const handleDrop = (e: React.DragEvent, targetCol: keyof UserDailyMetrics['kanban']) => {
      const itemId = e.dataTransfer.getData('itemId');
      const sourceCol = e.dataTransfer.getData('sourceCol') as keyof UserDailyMetrics['kanban'];

      if (sourceCol === targetCol) return;

      const item = metrics.kanban[sourceCol].find(i => i.id === itemId);
      if (!item) return;

      const newSourceList = metrics.kanban[sourceCol].filter(i => i.id !== itemId);
      const newTargetList = [...metrics.kanban[targetCol], item];

      updateDailyMetrics(selectedDate, {
        kanban: {
          ...metrics.kanban,
          [sourceCol]: newSourceList,
          [targetCol]: newTargetList
        }
      });
    };

    return (
      <div className="max-w-4xl mx-auto space-y-0 pb-20 bg-white shadow-2xl rounded-2xl overflow-hidden border border-[#eee] animate-in fade-in duration-700">

        {/* 1. HEADER AREA */}
        <div className="relative w-full h-48 md:h-64 overflow-hidden">
          <img
            src="/butterfly.png"
            alt="Lavender Butterfly"
            className="w-full h-full object-cover grayscale-[30%] opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent flex items-end p-8">
            <div className="space-y-1">
              <h2 className="text-4xl serif font-bold text-white">Daily Planner</h2>
              <p className="text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                Today's Date: <span className="text-white">{formattedDate}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 2. GRATITUDE SECTION */}
        <section className="bg-[#E6D5F0]/30 p-8 space-y-4">
          <h3 className="serif text-xl font-bold text-[#7B68A6]">Today I Am Grateful For:</h3>
          <div className="space-y-2">
            {[0, 1, 2].map(i => (
              <input
                key={i}
                type="text"
                className="w-full workbook-input italic text-gray-700 border-[#B19CD9]/30"
                placeholder="List something you're thankful for..."
                value={metrics.gratitude[i] || ''}
                onChange={e => {
                  const newGrat = [...metrics.gratitude];
                  newGrat[i] = e.target.value;
                  updateDailyMetrics(selectedDate, { gratitude: newGrat });
                }}
              />
            ))}
          </div>
        </section>

        {/* 3. TODAY'S GOALS */}
        <section className="bg-white p-8 space-y-4">
          <h3 className="serif text-xl font-bold text-[#7B68A6]">Today's Goals:</h3>
          <div className="space-y-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex items-center gap-4">
                <button
                  onClick={() => {
                    const newGoals = [...metrics.daily_goals];
                    newGoals[i].completed = !newGoals[i].completed;
                    updateDailyMetrics(selectedDate, { daily_goals: newGoals });
                  }}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${metrics.daily_goals[i].completed ? 'bg-[#B19CD9] border-[#B19CD9]' : 'border-[#E6D5F0]'}`}
                >
                  {metrics.daily_goals[i].completed && <div className="w-2 h-2 bg-white rounded-full" />}
                </button>
                <input
                  type="text"
                  className={`flex-1 workbook-input ${metrics.daily_goals[i].completed ? 'line-through text-gray-400' : 'text-gray-800 font-medium'}`}
                  placeholder="Enter a primary goal..."
                  value={metrics.daily_goals[i].text || ''}
                  onChange={e => {
                    const newGoals = [...metrics.daily_goals];
                    newGoals[i].text = e.target.value;
                    updateDailyMetrics(selectedDate, { daily_goals: newGoals });
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* 4. SELF-CARE SECTION */}
        <section className="bg-[#E6D5F0]/30 p-8 space-y-4">
          <h3 className="serif text-xl font-bold text-[#7B68A6]">How I Am Taking Care of Myself Today:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4">
                <button
                  onClick={() => {
                    const newSc = [...metrics.self_care];
                    newSc[i].completed = !newSc[i].completed;
                    updateDailyMetrics(selectedDate, { self_care: newSc });
                  }}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${metrics.self_care[i].completed ? 'bg-[#7B68A6] border-[#7B68A6]' : 'border-[#B19CD9]'}`}
                >
                  {metrics.self_care[i].completed && <div className="w-2 h-2 bg-white rounded-full" />}
                </button>
                <input
                  type="text"
                  className={`flex-1 workbook-input border-[#B19CD9]/30 ${metrics.self_care[i].completed ? 'line-through text-gray-400' : 'text-gray-700 italic'}`}
                  placeholder="Self-care activity..."
                  value={metrics.self_care[i].text || ''}
                  onChange={e => {
                    const newSc = [...metrics.self_care];
                    newSc[i].text = e.target.value;
                    updateDailyMetrics(selectedDate, { self_care: newSc });
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* 5. MOOD TRACKER */}
        <section className="bg-white p-8 space-y-6">
          <h3 className="serif text-xl font-bold text-[#7B68A6]">My Mood Is:</h3>
          <div className="flex justify-around items-center max-w-md mx-auto">
            {[
              { id: 'rough', emoji: '😢', label: 'Rough' },
              { id: 'meh', emoji: '😐', label: 'Meh' },
              { id: 'good', emoji: '🙂', label: 'Good' },
              { id: 'amazing', emoji: '😄', label: 'Amazing' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => updateDailyMetrics(selectedDate, { mood: m.id as any })}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`relative w-14 h-14 rounded-full border-2 flex items-center justify-center text-2xl transition-all ${metrics.mood === m.id ? 'bg-[#E6D5F0] border-[#B19CD9] scale-110 shadow-md' : 'border-transparent hover:bg-gray-50'}`}>
                  {m.emoji}
                  {metrics.mood === m.id && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#7B68A6] rounded-full flex items-center justify-center shadow-md">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${metrics.mood === m.id ? 'text-[#7B68A6]' : 'text-gray-400'}`}>{m.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 6. DAILY SELF-CARE ACT */}
        <section className="p-8 bg-white">
          <div className="bg-[#E6D5F0]/40 rounded-3xl p-8 border-2 border-[#B19CD9]/20 space-y-4 text-center">
            <h3 className="serif text-2xl font-bold text-[#7B68A6]">Daily Self-Care Act</h3>
            <p className="text-gray-500 italic text-sm">"Go for a walk, meditate, or do something fun you enjoy"</p>
            <input
              type="text"
              className="w-full bg-white border border-[#E6D5F0] rounded-2xl p-4 text-center text-[#7B68A6] font-medium outline-none focus:ring-2 focus:ring-[#B19CD9]"
              placeholder="What did you do for yourself?"
              value={metrics.daily_self_care_act || ''}
              onChange={e => updateDailyMetrics(selectedDate, { daily_self_care_act: e.target.value })}
            />
          </div>
        </section>

        {/* 7. ENERGY LEVEL */}
        <section className="bg-[#E6D5F0]/30 p-8 space-y-6">
          <h3 className="serif text-xl font-bold text-[#7B68A6] text-center">Energy Level:</h3>
          <div className="flex justify-center gap-2 md:gap-4 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <button
                key={n}
                onClick={() => updateDailyMetrics(selectedDate, { energy_level: n })}
                className={`w-10 h-10 rounded-full border-2 font-bold text-sm transition-all ${metrics.energy_level === n ? 'bg-[#B19CD9] border-[#B19CD9] text-white shadow-md' : 'bg-white border-[#E6D5F0] text-gray-400 hover:border-[#B19CD9]'}`}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        {/* 8. SELF-LOVE PROMPT */}
        <section className="bg-white p-8 space-y-4">
          <h3 className="serif text-xl font-bold text-[#7B68A6]">One Thing You Love About Yourself Today:</h3>
          <input
            type="text"
            className="w-full workbook-input italic text-[#7B68A6] text-lg text-center"
            placeholder="Write a self-love affirmation..."
            value={metrics.self_love_statement || ''}
            onChange={e => updateDailyMetrics(selectedDate, { self_love_statement: e.target.value })}
          />
        </section>

        {/* 9. EXERCISE TRACKER */}
        <section className="bg-[#E6D5F0]/30 p-8 space-y-6">
          <h3 className="font-bold text-[#7B68A6] uppercase tracking-[0.2em] text-sm text-center">Exercise & Hydration</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block text-center">Physical Activity</label>
              <input
                type="text"
                className="w-full workbook-input text-center text-sm font-medium border-[#B19CD9]/30"
                placeholder="e.g., Pilates, Walking"
                value={metrics.physical_activity || ''}
                onChange={e => updateDailyMetrics(selectedDate, { physical_activity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block text-center">Minutes</label>
              <input
                type="number"
                className="w-full workbook-input text-center text-sm font-bold border-[#B19CD9]/30"
                placeholder="0"
                value={metrics.movement_minutes || ''}
                onChange={e => updateDailyMetrics(selectedDate, { movement_minutes: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block text-center">Hydration</label>
              <div className="flex justify-center items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <button
                    key={i}
                    onClick={() => updateDailyMetrics(selectedDate, { hydration_count: i === metrics.hydration_count ? i - 1 : i })}
                    className={`text-xl transition-all ${i <= metrics.hydration_count ? 'scale-110' : 'opacity-30 hover:opacity-60'}`}
                  >
                    💧
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 10. TOMORROW'S FOCUS */}
        <section className="bg-white p-8 space-y-4">
          <h3 className="serif text-xl font-bold text-[#7B68A6]">Tomorrow's Self-Care Focus:</h3>
          <div className="space-y-2">
            {[0, 1].map(i => (
              <input
                key={i}
                type="text"
                className="w-full workbook-input italic text-gray-500"
                placeholder="Tomorrow I will focus on..."
                value={metrics.tomorrow_focus[i] || ''}
                onChange={e => {
                  const newT = [...metrics.tomorrow_focus];
                  newT[i] = e.target.value;
                  updateDailyMetrics(selectedDate, { tomorrow_focus: newT });
                }}
              />
            ))}
          </div>
        </section>

        {/* 11. KANBAN BOARD */}
        <section className="bg-[#F8F7FC] p-8 space-y-8 border-t border-[#eee]">
          <h3 className="serif text-3xl font-bold text-[#7B68A6] text-center">My Task Board</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(['todo', 'inProgress', 'done', 'notes'] as Array<keyof UserDailyMetrics['kanban']>).map(colKey => (
              <div
                key={colKey}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, colKey)}
                className="flex flex-col bg-white rounded-2xl shadow-sm border border-[#E6D5F0] overflow-hidden min-h-[300px]"
              >
                <div className="bg-[#B19CD9] p-3 flex justify-between items-center text-white">
                  <span className="font-bold uppercase text-[10px] tracking-[0.2em]">
                    {colKey === 'inProgress' ? 'In Progress' : colKey.toUpperCase()}
                  </span>
                  <button
                    onClick={() => handleKanbanAdd(colKey)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex-1 p-3 space-y-3 custom-scrollbar overflow-y-auto">
                  {(metrics.kanban[colKey] || []).map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id, colKey)}
                      className="p-4 bg-[#F8F7FC] border border-[#E6D5F0]/50 rounded-xl shadow-sm group hover:shadow-md hover:border-[#B19CD9]/40 transition-all cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex gap-2">
                        <GripVertical size={14} className="text-gray-300 mt-1" />
                        <p className="flex-1 text-sm text-gray-700 font-medium leading-relaxed">{item.text}</p>
                      </div>
                      <div className="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleKanbanRemove(colKey, item.id)}>
                          <Trash2 size={12} className="text-red-300 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!metrics.kanban[colKey] || metrics.kanban[colKey].length === 0) && (
                    <div className="flex-1 flex items-center justify-center py-10 opacity-20 italic text-[10px] text-gray-500">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    );
  };

  const renderMonthlyView = () => {
    const monthData = pFocus?.monthlyThemes?.[selectedMonth] || {
      theme: '', financialTarget: '', wellnessTarget: '', wordOfMonth: '', reflectionPreview: ''
    };
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
                  value={monthData?.theme || ''}
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
                    value={monthData?.financialTarget || ''}
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
                    value={monthData?.wellnessTarget || ''}
                    readOnly={data?.isArchived}
                    onChange={(e) => {
                      const themes = { ...(pFocus.monthlyThemes || {}) };
                      themes[selectedMonth] = { ...monthData, wellnessTarget: e.target.value };
                      updatePlanner({ monthlyThemes: themes });
                    }}
                  />
                </div>
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
           </div>

           <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="aspect-square border border-[#F8F7FC] rounded-xl flex flex-col p-2 hover:bg-[#F8F7FC] transition-colors cursor-pointer group">
                  <span className="text-[10px] font-bold text-gray-300 group-hover:text-[#B19CD9]">{i + 1}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    );
  };

  const renderWeeklyView = () => {
    const weekData = pFocus?.weeklyFocus?.[`${selectedMonth}-1`] || {
      outcomes: ['', '', ''], financialMove: '', energyFocus: '', eliminate: '', affirmation: ''
    };
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
         <div className="paper-card p-6 bg-white border-t-8 border-[#7B68A6] space-y-6">
           <h3 className="font-bold text-[#7B68A6] uppercase text-xs tracking-widest">Core Outcomes</h3>
           <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <input
                  key={i}
                  className="w-full bg-transparent border-b border-[#E6D5F0] py-2 outline-none text-sm"
                  placeholder={`Outcome ${i+1}`}
                  value={weekData.outcomes[i] || ''}
                  readOnly={data?.isArchived}
                  onChange={(e) => {
                    const next = [...weekData.outcomes];
                    next[i] = e.target.value;
                    const weeks = { ...(pFocus.weeklyFocus || {}) };
                    weeks[`${selectedMonth}-1`] = { ...weekData, outcomes: next };
                    updatePlanner({ weeklyFocus: weeks });
                  }}
                />
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
          <h1 className="text-4xl font-bold mb-1 serif text-[#7B68A6]">Life Planner</h1>
          <p className="text-gray-500 italic">Navigate from vision to execution seamlessly.</p>
        </div>
        <div className="flex items-center gap-2 md:gap-4 bg-white p-1 rounded-2xl shadow-sm border border-[#eee]">
          <button
            onClick={() => setViewMode('monthly')}
            className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-xs transition-all ${viewMode === 'monthly' ? 'bg-[#B19CD9] text-white shadow-lg' : 'text-gray-400 hover:text-[#7B68A6]'}`}
          >
            <LayoutGrid size={16} /> Monthly
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-xs transition-all ${viewMode === 'weekly' ? 'bg-[#B19CD9] text-white shadow-lg' : 'text-gray-400 hover:text-[#7B68A6]'}`}
          >
            <Columns size={16} /> Weekly
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-xs transition-all ${viewMode === 'daily' ? 'bg-[#B19CD9] text-white shadow-lg' : 'text-gray-400 hover:text-[#7B68A6]'}`}
          >
            <CheckSquare size={16} /> Daily
          </button>
        </div>
      </header>

      {viewMode === 'daily' && (
        <div className="mb-6 flex items-center justify-center gap-4">
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-2 bg-white rounded-full border border-[#eee] text-[#7B68A6] hover:bg-[#F8F7FC]"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="px-6 py-2 bg-white rounded-full border border-[#B19CD9] font-bold text-[#7B68A6] shadow-sm">
            {new Date(selectedDate).toDateString()}
          </div>
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-2 bg-white rounded-full border border-[#eee] text-[#7B68A6] hover:bg-[#F8F7FC]"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {viewMode === 'monthly' && renderMonthlyView()}
      {viewMode === 'weekly' && renderWeeklyView()}
      {viewMode === 'daily' && renderDailyView()}
    </div>
  );
};

export default Planner;
