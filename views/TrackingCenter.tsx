import React from 'react';
import { YearData, UserDailyMetrics } from '../types';
import { 
  Sparkles, 
  Zap, 
  Wind, 
  Dumbbell, 
  Wallet, 
  CheckCircle2, 
  Circle, 
  Calendar,
  TrendingUp,
  Clock,
  Plus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DEFAULT_DAILY_METRICS } from '../constants';

interface TrackingCenterProps {
  data: YearData;
  updateData: (d: YearData) => void;
}

const TrackingCenter: React.FC<TrackingCenterProps> = ({ data, updateData }) => {
  const today = new Date().toISOString().split('T')[0];
  const rawMetrics = data?.dailyMetrics?.[today] || DEFAULT_DAILY_METRICS(today);
  // Clean up any obvious test data patterns (e.g. "TestTestTest...")
  const cleanIntention = (() => {
    const val = rawMetrics?.daily_intention || '';
    if (/^(.{2,8})\1{3,}/.test(val)) return ''; // repeated pattern like "TestTestTest"
    return val;
  })();
  const metrics = { ...rawMetrics, daily_intention: cleanIntention };

  const updateMetrics = (updates: Partial<UserDailyMetrics>) => {
    if (data?.isArchived) return;
    updateData({
      ...data,
      dailyMetrics: {
        ...(data?.dailyMetrics || {}),
        [today]: { ...metrics, ...updates }
      }
    });
  };

  // Prepare trend data for Energy Index (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayMetrics = data?.dailyMetrics?.[dateStr];
    return {
      date: dateStr.split('-').slice(2).join('/'),
      level: dayMetrics?.energy_level ?? 0
    };
  });

  const getEnergyLabel = (level: number) => {
    if (level <= 2) return 'Low';
    if (level <= 4) return 'Drained';
    if (level <= 6) return 'Neutral';
    if (level <= 8) return 'Focused';
    return 'Elevated';
  };

  const streak = Object.values(data?.dailyMetrics || {}).filter(m => (m as UserDailyMetrics)?.morning_ritual_completed).length;

  return (
    <div className="space-y-10 pb-20">
      <header className="sticky z-10 bg-[#F8F7FC] pb-2 flex flex-col md:flex-row items-center justify-between gap-3" style={{ top: 'calc(33px + env(safe-area-inset-top))' }}>
        <div>
          <h1 className="text-xl md:text-3xl font-bold mb-0.5">Tracking Center</h1>
          <p className="text-gray-500 italic text-sm">"Measure what matters, nurture what grows."</p>
        </div>
        <div className="flex items-center gap-3 bg-white paper-card px-4 py-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="text-[#D4AF37]" size={14} />
            <span className="text-xs font-bold text-[#7B68A6]">{streak} Day Streak</span>
          </div>
          <div className="h-3 w-[1px] bg-gray-200" />
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{new Date().toDateString()}</div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <div className="paper-card p-5 md:p-8 bg-gradient-to-br from-white to-[#F8F7FC] border-t-4 border-[#B19CD9]">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-[#E6D5F0] rounded-lg"><Sparkles size={16} className="text-[#7B68A6]" /></div>
            <h2 className="text-base font-bold">Morning Ritual</h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Intention</label>
              <input
                type="text"
                className="w-full text-sm italic text-gray-700 bg-transparent border-b border-[#eee] outline-none focus:border-[#B19CD9] py-1"
                placeholder="No intention set yet."
                value={metrics?.daily_intention || ''}
                onChange={(e) => updateMetrics({ daily_intention: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Commitment</label>
              <p className="text-sm font-semibold text-gray-700">{metrics?.focus_commitment || 'No commitment set yet.'}</p>
            </div>
            <div className="pt-4 border-t border-[#eee]">
               <div className={`p-4 rounded-2xl flex items-center justify-between ${metrics?.morning_ritual_completed ? 'bg-[#D1F7E9] text-[#10B981]' : 'bg-[#F8F7FC] text-gray-400'}`}>
                 <span className="text-xs font-bold uppercase tracking-widest">Status</span>
                 <span className="text-xs font-bold">{metrics?.morning_ritual_completed ? 'Aligned' : 'Pending'}</span>
               </div>
            </div>
          </div>
        </div>

        <div className="paper-card p-5 md:p-8 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#FFEEDD] rounded-lg"><Zap size={16} className="text-[#FF9933]" /></div>
              <h2 className="text-base font-bold">Energy Index</h2>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-gray-400 uppercase">Today's Level</span>
              <p className="text-lg font-bold text-[#FF9933]">{getEnergyLabel(metrics?.energy_level ?? 5)} ({metrics?.energy_level ?? 5}/10)</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                <YAxis hide domain={[0, 10]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#7B68A6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="level" 
                  stroke="#B19CD9" 
                  strokeWidth={4} 
                  dot={{ fill: '#B19CD9', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6">
            <input 
              type="range"
              min="1"
              max="10"
              className="w-full h-2 bg-[#F8F7FC] rounded-lg appearance-none cursor-pointer accent-[#B19CD9] border border-[#eee]"
              value={metrics?.energy_level ?? 5}
              onChange={(e) => updateMetrics({ energy_level: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="paper-card p-5 md:p-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-[#D1F7E9] rounded-lg"><Wind size={16} className="text-[#10B981]" /></div>
            <h2 className="text-base font-bold">Meditation Log</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Daily Total</span>
                <p className="text-3xl font-bold text-[#10B981]">{metrics?.meditation_minutes ?? 0} <span className="text-sm font-normal text-gray-400">min</span></p>
              </div>
              <button 
                onClick={() => updateMetrics({ meditation_minutes: (metrics?.meditation_minutes ?? 0) + 5 })}
                className="p-3 bg-[#D1F7E9] text-[#10B981] rounded-2xl hover:bg-[#10B981] hover:text-white transition-all shadow-sm"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="paper-card p-5 md:p-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-[#E6D5F0] rounded-lg"><Dumbbell size={16} className="text-[#7B68A6]" /></div>
            <h2 className="text-base font-bold">Movement Log</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Active Minutes</span>
              <p className="text-3xl font-bold text-[#B19CD9]">{metrics?.movement_minutes ?? 0} <span className="text-sm font-normal text-gray-400">min</span></p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {[15, 30, 45, 60].map(mins => (
                <button 
                  key={mins}
                  onClick={() => updateMetrics({ movement_minutes: mins })}
                  className={`py-3 rounded-xl border font-bold text-xs transition-all ${metrics?.movement_minutes === mins ? 'bg-[#B19CD9] border-[#B19CD9] text-white' : 'bg-white border-[#eee] text-gray-400'}`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="paper-card p-5 md:p-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-[#FFEEDD] rounded-lg"><Wallet size={16} className="text-[#D4AF37]" /></div>
            <h2 className="text-base font-bold">Financial Actions</h2>
          </div>

          <div className="space-y-3">
            {[
              { id: 'loggedExpenses', label: 'Logged Expenses', icon: <CheckCircle2 size={18} /> },
              { id: 'reviewedBudget', label: 'Reviewed Budget', icon: <TrendingUp size={18} /> },
              { id: 'savingsMove', label: 'Savings Move', icon: <CheckCircle2 size={18} /> },
              { id: 'paidDebt', label: 'Paid Debt', icon: <Wallet size={18} /> },
            ].map(action => (
              <button
                key={action.id}
                onClick={() => {
                  const currentActions = metrics?.financial_actions || { loggedExpenses: false, reviewedBudget: false, savingsMove: false, paidDebt: false };
                  const newActions = { ...currentActions, [action.id]: !currentActions[action.id as keyof typeof currentActions] };
                  updateMetrics({ financial_actions: newActions });
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${metrics?.financial_actions?.[action.id as keyof typeof metrics.financial_actions] ? 'bg-[#FFEEDD] border-[#FF9933] text-[#D4AF37]' : 'bg-white border-[#eee] text-gray-400'}`}
              >
                <div className="flex items-center gap-3">
                  {action.icon}
                  <span className="text-sm font-bold">{action.label}</span>
                </div>
                {metrics?.financial_actions?.[action.id as keyof typeof metrics.financial_actions] ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingCenter;