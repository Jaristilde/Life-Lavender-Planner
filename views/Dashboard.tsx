
import React, { useState, useEffect } from 'react';
import { YearData } from '../types';
import { DEFAULT_DAILY_METRICS } from '../constants';
import { Sparkles, TrendingUp, CheckCircle, BookOpen, CalendarCheck, Sunrise, Droplets } from 'lucide-react';
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

  const today = new Date().toISOString().split('T')[0];
  const todayMetrics = data?.dailyMetrics?.[today] || DEFAULT_DAILY_METRICS(today);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    const loadAffirmations = async () => {
      const affs = await generatePersonalizedAffirmations(userName, mood, feeling);
      setPersonalAffirmations(affs || []);
    };
    loadAffirmations();
  }, [userName, mood, feeling]);

  // Safe Accessor Patterns with Fallbacks
  const financial = data?.financial ?? { income: 0, fixedExpenses: [], variableExpenses: [], savingsGoals: [] };
  const income = financial?.income ?? 0;
  const fixedExpenses = financial?.fixedExpenses ?? [];
  const variableExpenses = financial?.variableExpenses ?? [];
  const savingsGoals = financial?.savingsGoals ?? [];

  const challenge = data?.simplifyChallenge ?? [];
  const blueprint = data?.blueprint ?? { topIntentions: [], morningRitual: [] };
  const workbook = data?.workbook ?? { current_page: 0 };
  const monthlyResets = data?.monthlyResets ?? {};

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
  const completedPriorities = priorities.filter(p => p.completed).length;
  const totalPriorities = priorities.filter(p => p.text.trim()).length;

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{greeting}, {userName}</h1>
          <p className="text-[#7B68A6] italic text-lg font-light">"Your blueprint for abundance and mindfulness."</p>
        </div>
        <div className="paper-card p-6 flex items-center gap-4 border-l-8 border-[#B19CD9]">
          <div className="p-2 bg-[#F8F7FC] rounded-full"><ButterflyIcon size={24} className="text-[#B19CD9]" /></div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Core Intention</p>
            <p className="text-lg font-bold serif italic text-[#7B68A6]">{blueprint?.topIntentions?.[0] || 'Clarity'}</p>
          </div>
        </div>
      </header>

      <div className="paper-card p-8 bg-gradient-to-r from-[#B19CD9]/10 to-[#7B68A6]/10 border-2 border-[#B19CD9]/30 relative overflow-hidden group">
        <Sparkles size={120} className="absolute -right-10 -bottom-10 text-[#7B68A6]/5 group-hover:scale-110 transition-transform duration-1000" />
        <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-[#7B68A6] mb-6 flex items-center gap-2">
           Today's Intention Focus
        </h3>
        <p className="text-2xl md:text-3xl serif italic text-[#3D2D7C] leading-tight relative z-10 max-w-3xl">
          "<TextReveal text={personalAffirmations?.[0] || 'I am focused on creating a stable and rewarding financial future.'} speed={0.02} />"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="paper-card p-6 bg-gradient-to-br from-[#7B68A6]/5 to-[#B19CD9]/5 border-l-8 border-[#7B68A6] cursor-pointer hover:shadow-lg transition-all" onClick={() => setView('monthlyReset')}>
           <div className="flex items-center gap-3 mb-2">
             <CalendarCheck className="text-[#7B68A6]" size={18} />
             <h3 className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">
               {currentMonthReset?.completedAt ? 'Month Reflection' : 'Monthly Ritual'}
             </h3>
           </div>
           <p className="text-lg font-bold text-[#7B68A6]">
             {currentMonthReset?.completedAt ? `${months[new Date().getMonth()]} Reset Complete` : `Time for ${months[new Date().getMonth()]} Reset`}
           </p>
           <button className="text-xs font-bold text-[#B19CD9] mt-2 flex items-center gap-1">
             {currentMonthReset?.completedAt ? 'Review your insights' : 'Start your ritual now'} →
           </button>
        </div>

        <div className="paper-card p-6 bg-gradient-to-br from-white to-[#F8F7FC]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#E6D5F0] rounded-lg text-[#7B68A6]"><TrendingUp size={20} /></div>
            <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider">Financial Health</h3>
          </div>
          <AnimatedCounter value={financialSummary?.income ?? 0} prefix="$" className="text-2xl font-bold" />
          <p className="text-sm text-gray-500 mt-1">Total Monthly Income</p>
        </div>

        <div className="paper-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#FFEEDD] rounded-lg text-[#FF9933]"><CheckCircle size={20} /></div>
            <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider">Daily Priorities</h3>
          </div>
          <p className="text-2xl font-bold">{completedPriorities} / {totalPriorities || priorities.length}</p>
          <p className="text-sm text-gray-500 mt-1">Completed Today</p>
        </div>

        <div className="paper-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#D1F7E9] rounded-lg text-[#10B981]"><Sparkles size={20} /></div>
            <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider">Simplify Streak</h3>
          </div>
          <AnimatedCounter value={simplifyProgress} suffix="%" className="text-2xl font-bold" />
          <p className="text-sm text-gray-500 mt-1">Challenge Progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="paper-card p-8">
            <h2 className="text-2xl font-bold mb-6">Yearly Financial Pulse</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#B19CD9', '#E6D5F0', '#7B68A6'][index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="paper-card p-8 border-t-8 border-[#7B68A6] flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-white to-[#F8F7FC]">
            <div className="p-5 bg-[#E6D5F0] rounded-3xl text-[#7B68A6]">
              <BookOpen size={48} />
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="flex items-center justify-between mb-2">
                <h3 className="serif font-bold text-2xl text-[#7B68A6]">Your Money Reset Journey</h3>
                <span className="text-sm font-bold text-gray-400">
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
                className="inline-flex items-center gap-2 px-6 py-2 bg-[#7B68A6] text-white font-bold rounded-xl hover:bg-[#B19CD9] transition-all shadow-md"
              >
                {workbook?.completed_at ? 'Review Money Reset →' : workbook?.started_at ? 'Continue Money Reset →' : 'Start Your Money Reset →'}
              </button>
            </div>
          </div>
        </div>

        {/* Morning Ritual Status — reads from today's dailyMetrics */}
        <div className="paper-card p-8 space-y-6">
          <h2 className="text-2xl font-bold mb-2">My Morning Ritual</h2>

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
