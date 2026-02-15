
import React, { useState, useEffect } from 'react';
import { YearData } from '../types';
import { DEFAULT_DAILY_METRICS } from '../constants';
import { Sparkles, TrendingUp, CheckCircle, BookOpen, CalendarCheck, Sunrise, Droplets, Heart, X } from 'lucide-react';
import ButterflyIcon from '../components/ButterflyIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { generatePersonalizedAffirmations } from '../services/geminiService';
import { AnimatedCounter, TextReveal } from '../components/MagicUI';

interface DashboardProps {
  data: YearData;
  updateData: (d: YearData) => void;
  setView: (v: string) => void;
  userName: string;
  mood: string;
  feeling: string;
}

const Dashboard: React.FC<DashboardProps> = ({ data, updateData, setView, userName, mood, feeling }) => {
  const [personalAffirmations, setPersonalAffirmations] = useState<string[]>([]);
  const [greeting, setGreeting] = useState('');
  const [gratitudeDismissed, setGratitudeDismissed] = useState(false);
  const [chartReady, setChartReady] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayMetrics = { ...DEFAULT_DAILY_METRICS(today), ...(data?.dailyMetrics?.[today] || {}) };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
    // Defer chart rendering until container is laid out to prevent Recharts -1 dimension crash
    const raf = requestAnimationFrame(() => setChartReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const loadAffirmations = async () => {
      const affs = await generatePersonalizedAffirmations(userName, mood, feeling);
      setPersonalAffirmations(affs || []);
    };
    loadAffirmations();
  }, [userName, mood, feeling]);

  // Safe Accessor Patterns with Fallbacks
  const financial = data?.financial || { income: 0, fixedExpenses: [], variableExpenses: [], savingsGoals: [] };
  const income = financial?.income ?? 0;
  const fixedExpenses = Array.isArray(financial?.fixedExpenses) ? financial.fixedExpenses : [];
  const variableExpenses = Array.isArray(financial?.variableExpenses) ? financial.variableExpenses : [];
  const savingsGoals = Array.isArray(financial?.savingsGoals) ? financial.savingsGoals : [];

  const challenge = Array.isArray(data?.simplifyChallenge) ? data.simplifyChallenge : [];
  const blueprint = data?.blueprint || { topIntentions: [], morningRitual: [] };
  const workbook = data?.workbook || { current_page: 0 };
  const monthlyResets = data?.monthlyResets || {};

  const financialSummary = {
    income: income,
    expenses: (fixedExpenses || []).reduce((sum, e) => sum + (e?.amount ?? 0), 0) +
              (variableExpenses || []).reduce((sum, e) => sum + (e?.amount ?? 0), 0),
    savings: (savingsGoals || []).reduce((sum, s) => sum + (s?.current ?? 0), 0),
  };

  const chartData = [
    { name: 'Income', value: financialSummary.income },
    { name: 'Expenses', value: financialSummary.expenses },
    { name: 'Savings', value: financialSummary.savings },
  ];

  const simplifyProgress = (challenge || []).length > 0
    ? Math.round(((challenge || []).filter(c => c?.completed).length / (challenge || []).length) * 100)
    : 0;

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthName = months[new Date().getMonth()].toLowerCase();
  const currentMonthReset = monthlyResets?.[currentMonthName];

  // Today's priorities completion
  const priorities = todayMetrics.top_priorities || [];
  const completedPriorities = priorities.filter(p => p?.completed).length;
  const totalPriorities = priorities.filter(p => (p?.text || '').trim()).length;

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

  return (
    <div className="space-y-8">
      <header className="sticky z-10 bg-[#F8F7FC] pb-2 flex flex-col md:flex-row md:items-end justify-between gap-3" style={{ top: 'calc(33px + env(safe-area-inset-top))' }}>
        <div>
          <h1 className="text-xl md:text-3xl font-bold mb-0.5">{greeting}, {userName}</h1>
          <p className="text-[#7B68A6] italic text-sm font-light">"Your blueprint for abundance and mindfulness."</p>
        </div>
        <div className="paper-card p-3 flex items-center gap-3 border-l-4 border-[#B19CD9]">
          <div className="p-1.5 bg-[#F8F7FC] rounded-full"><ButterflyIcon size={18} className="text-[#B19CD9]" /></div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Core Intention</p>
            <p className="text-sm font-bold serif italic text-[#7B68A6]">{blueprint?.topIntentions?.[0] || 'Clarity'}</p>
          </div>
        </div>
      </header>

      {/* Daily Gratitude Prompt — shows when today's gratitude is empty */}
      {!gratitudeDismissed && (todayMetrics.gratitude || ['', '', '']).filter((g: string) => (g || '').trim()).length < 3 && (
        <div className="paper-card p-5 border-l-4 border-[#B19CD9] bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart size={18} className="text-[#B19CD9]" />
              <h3 className="text-sm font-bold text-[#7B68A6]">What are you grateful for today?</h3>
            </div>
            <button onClick={() => setGratitudeDismissed(true)} className="p-1 text-gray-300 hover:text-gray-500">
              <X size={16} />
            </button>
          </div>
          <div className="space-y-2">
            {[0, 1, 2].map(i => (
              <input
                key={i}
                type="text"
                className="w-full text-sm py-2 px-3 bg-[#F8F7FC] border border-[#E6D5F0] rounded-xl outline-none focus:ring-2 focus:ring-[#B19CD9]"
                placeholder={['I am grateful for...', 'I appreciate...', 'I am thankful for...'][i]}
                value={(todayMetrics.gratitude || ['', '', ''])[i] || ''}
                onChange={(e) => {
                  const newGrat = [...(todayMetrics.gratitude || ['', '', ''])];
                  newGrat[i] = e.target.value;
                  updateData({
                    ...data,
                    dailyMetrics: {
                      ...(data?.dailyMetrics || {}),
                      [today]: { ...todayMetrics, gratitude: newGrat }
                    }
                  });
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="paper-card p-5 md:p-8 bg-gradient-to-r from-[#B19CD9]/10 to-[#7B68A6]/10 border-2 border-[#B19CD9]/30 relative overflow-hidden group">
        <Sparkles size={80} className="absolute -right-6 -bottom-6 text-[#7B68A6]/5 group-hover:scale-110 transition-transform duration-1000" />
        <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#7B68A6] mb-3 flex items-center gap-2">
           Today's Intention Focus
        </h3>
        <p className="text-lg md:text-2xl serif italic text-[#3D2D7C] leading-snug relative z-10 max-w-3xl">
          "<TextReveal text={personalAffirmations?.[0] || 'I am focused on creating a stable and rewarding financial future.'} speed={0.02} />"
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="paper-card p-4 md:p-6 bg-gradient-to-br from-[#7B68A6]/5 to-[#B19CD9]/5 border-l-4 border-[#7B68A6] cursor-pointer hover:shadow-lg transition-all col-span-2 lg:col-span-1" onClick={() => setView('monthlyReset')}>
           <div className="flex items-center gap-2 mb-1">
             <CalendarCheck className="text-[#7B68A6]" size={16} />
             <h3 className="font-bold text-gray-500 uppercase text-[10px] tracking-[0.5px]">
               {currentMonthReset?.completedAt ? 'Month Reflection' : 'Monthly Ritual'}
             </h3>
           </div>
           <p className="text-sm font-bold text-[#7B68A6]">
             {currentMonthReset?.completedAt ? `${months[new Date().getMonth()]} Reset Complete` : `Time for ${months[new Date().getMonth()]} Reset`}
           </p>
           <button className="text-[11px] font-bold text-[#B19CD9] mt-1 flex items-center gap-1">
             {currentMonthReset?.completedAt ? 'Review your insights' : 'Start your ritual now'} →
           </button>
        </div>

        <div className="paper-card p-4 md:p-6 bg-gradient-to-br from-white to-[#F8F7FC]">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-[#E6D5F0] rounded-lg text-[#7B68A6]"><TrendingUp size={16} /></div>
            <h3 className="font-bold text-gray-500 uppercase text-[10px] tracking-[0.5px]">Financial Health</h3>
          </div>
          <AnimatedCounter value={financialSummary?.income ?? 0} prefix="$" className="text-xl font-bold" />
          <p className="text-xs text-gray-500 mt-1">Total Monthly Income</p>
        </div>

        <div className="paper-card p-4 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-[#FFEEDD] rounded-lg text-[#FF9933]"><CheckCircle size={16} /></div>
            <h3 className="font-bold text-gray-500 uppercase text-[10px] tracking-[0.5px]">Daily Priorities</h3>
          </div>
          <p className="text-xl font-bold">{completedPriorities} / {totalPriorities || priorities.length}</p>
          <p className="text-xs text-gray-500 mt-1">Completed Today</p>
        </div>

        <div className="paper-card p-4 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-[#D1F7E9] rounded-lg text-[#10B981]"><Sparkles size={16} /></div>
            <h3 className="font-bold text-gray-500 uppercase text-[10px] tracking-[0.5px]">Simplify Streak</h3>
          </div>
          <AnimatedCounter value={simplifyProgress} suffix="%" className="text-xl font-bold" />
          <p className="text-xs text-gray-500 mt-1">Challenge Progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <div className="lg:col-span-2 space-y-4 md:space-y-8">
          <div className="paper-card p-5 md:p-8">
            <h2 className="text-base md:text-xl font-bold mb-4">Yearly Financial Pulse</h2>
            <div style={{ width: '100%', height: 280, minHeight: 200, position: 'relative' }}>
              {chartReady ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#B19CD9', '#E6D5F0', '#7B68A6'][index % 3]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading chart...</div>
              )}
            </div>
          </div>

          <div className="paper-card p-5 md:p-8 border-t-4 border-[#7B68A6] flex flex-col md:flex-row items-center gap-4 md:gap-8 bg-gradient-to-br from-white to-[#F8F7FC]">
            <div className="p-3 bg-[#E6D5F0] rounded-2xl text-[#7B68A6]">
              <BookOpen size={32} />
            </div>
            <div className="flex-1 space-y-3 text-center md:text-left">
              <div className="flex items-center justify-between mb-1">
                <h3 className="serif font-bold text-base md:text-xl text-[#7B68A6]">Your Money Reset Journey</h3>
                <span className="text-xs font-bold text-gray-400">
                  {((workbook?.current_page ?? 0) + 1)} of 10
                </span>
              </div>
              <div className="w-full bg-[#E6D5F0] rounded-full h-3 mb-4 shadow-inner">
                <div
                  className="bg-[#B19CD9] h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${(((workbook?.current_page ?? 0) + 1) / 10) * 100}%` }}
                />
              </div>
              <button
                onClick={() => setView('workbook')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#7B68A6] text-white font-bold rounded-xl hover:bg-[#B19CD9] transition-all shadow-md text-sm"
              >
                {workbook?.completed_at ? 'Review Money Reset →' : workbook?.started_at ? 'Continue Money Reset →' : 'Start Your Money Reset →'}
              </button>
            </div>
          </div>
        </div>

        {/* Morning Ritual Status — reads from today's dailyMetrics */}
        <div className="paper-card p-5 md:p-8 space-y-4">
          <h2 className="text-base md:text-xl font-bold mb-1">My Morning Ritual</h2>

          {/* Ritual status */}
          <div className={`p-4 rounded-2xl flex items-center gap-3 ${todayMetrics.morning_ritual_completed ? 'bg-[#D1F7E9] text-[#10B981]' : 'bg-[#F8F7FC] text-gray-400'}`}>
            <Sunrise size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">
              {todayMetrics.morning_ritual_completed ? 'Completed Today' : 'Not Yet Completed'}
            </span>
          </div>

          {/* Today's intention */}
          {todayMetrics.daily_intention && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Today's Intention</span>
              <p className="text-sm italic text-[#7B68A6]">"{todayMetrics.daily_intention}"</p>
            </div>
          )}

          {/* Mood score */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mood</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getMoodColor(todayMetrics.mood_score ?? 5) }} />
              <span className="text-sm font-bold" style={{ color: getMoodColor(todayMetrics.mood_score ?? 5) }}>
                {getMoodLabel(todayMetrics.mood_score ?? 5)} ({todayMetrics.mood_score ?? 5}/10)
              </span>
            </div>
          </div>

          {/* Water intake */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Water</span>
            <div className="flex items-center gap-1">
              <Droplets size={16} className="text-[#3B82F6]" />
              <span className="text-sm font-bold text-[#3B82F6]">{todayMetrics.water_intake ?? 0}/8 cups</span>
            </div>
          </div>

          {/* Morning Reset button */}
          <button
            onClick={() => setView('morningReset')}
            className="w-full py-3 bg-[#7B68A6] text-white font-bold rounded-2xl hover:bg-[#B19CD9] transition-all shadow-md text-sm"
          >
            {todayMetrics.morning_ritual_completed ? 'Review Today\'s Reset →' : 'Start Morning Reset →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
