
import React, { useState, useEffect } from 'react';
import { YearData } from '../types';
import { Sparkles, TrendingUp, CheckCircle, Quote, Crown, BookOpen, CalendarCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { generatePersonalizedAffirmations } from '../services/geminiService';

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

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    const loadAffirmations = async () => {
      const affs = await generatePersonalizedAffirmations(userName, mood, feeling);
      setPersonalAffirmations(affs);
    };
    loadAffirmations();
  }, [userName, mood, feeling]);

  const financialSummary = {
    income: data.financial.income,
    expenses: data.financial.fixedExpenses.reduce((sum, e) => sum + e.amount, 0) + 
              data.financial.variableExpenses.reduce((sum, e) => sum + e.amount, 0),
    savings: data.financial.savingsGoals.reduce((sum, s) => sum + s.current, 0),
  };

  const chartData = [
    { name: 'Income', value: financialSummary.income },
    { name: 'Expenses', value: financialSummary.expenses },
    { name: 'Savings', value: financialSummary.savings },
  ];

  const simplifyProgress = Math.round(
    (data.simplifyChallenge.filter(c => c.completed).length / 30) * 100
  );

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthName = months[new Date().getMonth()].toLowerCase();
  const currentMonthReset = data.monthlyResets?.[currentMonthName];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{greeting}, {userName}</h1>
          <p className="text-[#7B68A6] italic text-lg font-light">"Your blueprint for abundance and mindfulness."</p>
        </div>
        <div className="paper-card p-6 flex items-center gap-4 border-l-8 border-[#B19CD9]">
          <div className="p-2 bg-[#F8F7FC] rounded-full"><Crown size={24} className="text-[#B19CD9]" /></div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Core Intention</p>
            <p className="text-lg font-bold serif italic text-[#7B68A6]">{data.blueprint.topIntentions[0] || 'Focus'}</p>
          </div>
        </div>
      </header>

      {/* AI Affirmation Section */}
      <div className="paper-card p-8 bg-gradient-to-r from-[#B19CD9]/10 to-[#7B68A6]/10 border-none relative overflow-hidden group">
        <Sparkles size={120} className="absolute -right-10 -bottom-10 text-[#7B68A6]/5 group-hover:scale-110 transition-transform duration-1000" />
        <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-[#7B68A6] mb-6 flex items-center gap-2">
           Today's Intention Focus
        </h3>
        <p className="text-2xl md:text-3xl serif italic text-[#3D2D7C] leading-tight relative z-10 max-w-3xl">
          "{personalAffirmations[0] || 'I am focused on creating a stable and rewarding financial future.'}"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Monthly Reset Engagement Card */}
        <div className="paper-card p-6 bg-gradient-to-br from-[#7B68A6]/5 to-[#B19CD9]/5 border-l-8 border-[#7B68A6] cursor-pointer hover:shadow-lg transition-all" onClick={() => setView('monthlyReset')}>
           <div className="flex items-center gap-3 mb-2">
             <CalendarCheck className="text-[#7B68A6]" size={18} />
             <h3 className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">
               {currentMonthReset?.completedAt ? 'Month Reflection' : 'Monthly Ritual'}
             </h3>
           </div>
           <p className="text-lg font-bold text-[#7B68A6]">
             {currentMonthReset?.completedAt ? `✅ ${months[new Date().getMonth()]} Reset Complete` : `📅 Time for ${months[new Date().getMonth()]} Reset`}
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
          <p className="text-2xl font-bold">${financialSummary.income.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Total Monthly Income</p>
        </div>

        <div className="paper-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#FFEEDD] rounded-lg text-[#FF9933]"><CheckCircle size={20} /></div>
            <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider">Daily Tasks</h3>
          </div>
          <p className="text-2xl font-bold">{data.wellness.dailyToDos.filter(t => t.completed).length} / {data.wellness.dailyToDos.length}</p>
          <p className="text-sm text-gray-500 mt-1">Completed Today</p>
        </div>

        <div className="paper-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#D1F7E9] rounded-lg text-[#10B981]"><Sparkles size={20} /></div>
            <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider">Simplify Streak</h3>
          </div>
          <p className="text-2xl font-bold">{simplifyProgress}%</p>
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

          {/* Money Reset Progress Card */}
          <div className="paper-card p-8 border-t-8 border-[#7B68A6] flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-white to-[#F8F7FC]">
            <div className="p-5 bg-[#E6D5F0] rounded-3xl text-[#7B68A6]">
              <BookOpen size={48} />
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="flex items-center justify-between mb-2">
                <h3 className="serif font-bold text-2xl text-[#7B68A6]">Your Money Reset Journey</h3>
                <span className="text-sm font-bold text-gray-400">
                  {data.workbook.current_page + 1} of 10
                </span>
              </div>
              <div className="w-full bg-[#E6D5F0] rounded-full h-3 mb-4 shadow-inner">
                <div
                  className="bg-[#B19CD9] h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${((data.workbook.current_page + 1) / 10) * 100}%` }}
                />
              </div>
              <button
                onClick={() => setView('workbook')}
                className="inline-flex items-center gap-2 px-6 py-2 bg-[#7B68A6] text-white font-bold rounded-xl hover:bg-[#B19CD9] transition-all shadow-md"
              >
                {data.workbook.completed_at ? 'Review Money Reset →' : data.workbook.started_at ? 'Continue Money Reset →' : 'Start Your Money Reset →'}
              </button>
            </div>
          </div>
        </div>

        <div className="paper-card p-8">
          <h2 className="text-2xl font-bold mb-6">My Morning Ritual</h2>
          <div className="space-y-4">
            {data.blueprint.morningRitual.filter(r => r.activity).map((ritual, i) => (
              <div key={i} className="flex gap-4 items-center p-3 bg-[#F8F7FC] rounded-xl border border-[#eee]">
                <span className="text-[10px] font-bold text-[#B19CD9] w-12">{ritual.time}</span>
                <span className="text-sm font-medium text-gray-700">{ritual.activity}</span>
              </div>
            ))}
            {data.blueprint.morningRitual.every(r => !r.activity) && (
              <p className="text-center text-gray-400 py-8 italic">No ritual planned yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
