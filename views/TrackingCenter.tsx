
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
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DEFAULT_DAILY_METRICS } from '../constants';

interface TrackingCenterProps {
  data: YearData;
  updateData: (d: YearData) => void;
}

const TrackingCenter: React.FC<TrackingCenterProps> = ({ data, updateData }) => {
  const today = new Date().toISOString().split('T')[0];
  const metrics = data.dailyMetrics[today] || DEFAULT_DAILY_METRICS(today);

  const updateMetrics = (updates: Partial<UserDailyMetrics>) => {
    if (data.isArchived) return;
    updateData({
      ...data,
      dailyMetrics: {
        ...data.dailyMetrics,
        [today]: { ...metrics, ...updates }
      }
    });
  };

  // Prepare trend data for Energy Index (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayMetrics = data.dailyMetrics[dateStr];
    return {
      date: dateStr.split('-').slice(2).join('/'),
      level: dayMetrics?.energy_level || 0
    };
  });

  const getEnergyLabel = (level: number) => {
    if (level <= 2) return 'Low';
    if (level <= 4) return 'Drained';
    if (level <= 6) return 'Neutral';
    if (level <= 8) return 'Focused';
    return 'Elevated';
  };

  // Fix: Explicitly cast to UserDailyMetrics[] to resolve 'unknown' property access error on morning_alignment_completed
  const streak = (Object.values(data.dailyMetrics) as UserDailyMetrics[]).filter(m => m.morning_alignment_completed).length;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-1">Tracking Center</h1>
          <p className="text-gray-500 italic">"Measure what matters, nurture what grows."</p>
        </div>
        <div className="flex items-center gap-4 bg-white paper-card px-6 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#D4AF37]" size={18} />
            <span className="text-sm font-bold text-[#7B68A6]">{streak} Day Streak</span>
          </div>
          <div className="h-4 w-[1px] bg-gray-100" />
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{new Date().toDateString()}</div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Morning Alignment Card */}
        <div className="paper-card p-8 bg-gradient-to-br from-white to-[#F8F7FC] border-t-8 border-[#B19CD9]">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-[#E6D5F0] rounded-xl"><Sparkles size={20} className="text-[#7B68A6]" /></div>
            <h2 className="text-2xl font-bold">Morning Alignment</h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Intention</label>
              <p className="text-sm italic text-gray-700">{metrics.intention_text || 'No intention set yet.'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Commitment</label>
              <p className="text-sm font-semibold text-gray-700">{metrics.focus_commitment || 'No commitment set yet.'}</p>
            </div>
            <div className="pt-4 border-t border-[#eee]">
               <div className={`p-4 rounded-2xl flex items-center justify-between ${metrics.morning_alignment_completed ? 'bg-[#D1F7E9] text-[#10B981]' : 'bg-[#F8F7FC] text-gray-400'}`}>
                 <span className="text-xs font-bold uppercase tracking-widest">Status</span>
                 <span className="text-xs font-bold">{metrics.morning_alignment_completed ? 'Aligned' : 'Pending'}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Energy Index Card */}
        <div className="paper-card p-8 lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFEEDD] rounded-xl"><Zap size={20} className="text-[#FF9933]" /></div>
              <h2 className="text-2xl font-bold">Energy Index</h2>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-gray-400 uppercase">Today's Level</span>
              <p className="text-lg font-bold text-[#FF9933]">{getEnergyLabel(metrics.energy_level)} ({metrics.energy_level}/10)</p>
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
              value={metrics.energy_level}
              onChange={(e) => updateMetrics({ energy_level: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Meditation Log */}
        <div className="paper-card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-[#D1F7E9] rounded-xl"><Wind size={20} className="text-[#10B981]" /></div>
            <h2 className="text-2xl font-bold">Meditation Log</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Daily Total</span>
                <p className="text-3xl font-bold text-[#10B981]">{metrics.meditation_minutes} <span className="text-sm font-normal text-gray-400">min</span></p>
              </div>
              <button 
                onClick={() => updateMetrics({ meditation_minutes: metrics.meditation_minutes + 5 })}
                className="p-3 bg-[#D1F7E9] text-[#10B981] rounded-2xl hover:bg-[#10B981] hover:text-white transition-all shadow-sm"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {['Guided', 'Silent', 'Breathwork'].map(type => (
                <button
                  key={type}
                  onClick={() => updateMetrics({ meditation_type: type.toLowerCase() as any })}
                  className={`px-3 py-2 text-[10px] font-bold rounded-xl border transition-all ${metrics.meditation_type === type.toLowerCase() ? 'bg-[#10B981] border-[#10B981] text-white' : 'border-[#eee] text-gray-400 hover:border-[#10B981]'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Movement Log Integration */}
        <div className="paper-card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-[#E6D5F0] rounded-xl"><Dumbbell size={20} className="text-[#7B68A6]" /></div>
            <h2 className="text-2xl font-bold">Movement Log</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Active Minutes</span>
              <p className="text-3xl font-bold text-[#B19CD9]">{metrics.movement_minutes} <span className="text-sm font-normal text-gray-400">min</span></p>
            </div>
            
            <div className="p-4 bg-[#F8F7FC] rounded-2xl border border-[#eee] border-dashed">
              <p className="text-[10px] text-gray-400 uppercase font-bold text-center">Linked to Wellness Tracker</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {[15, 30, 45, 60].map(mins => (
                <button 
                  key={mins}
                  onClick={() => updateMetrics({ movement_minutes: mins })}
                  className={`py-3 rounded-xl border font-bold text-xs transition-all ${metrics.movement_minutes === mins ? 'bg-[#B19CD9] border-[#B19CD9] text-white' : 'bg-white border-[#eee] text-gray-400'}`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Financial Action Tracker */}
        <div className="paper-card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-[#FFEEDD] rounded-xl"><Wallet size={20} className="text-[#D4AF37]" /></div>
            <h2 className="text-2xl font-bold">Financial Actions</h2>
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
                  const newActions = { ...metrics.financial_actions, [action.id]: !metrics.financial_actions[action.id as keyof typeof metrics.financial_actions] };
                  updateMetrics({ financial_actions: newActions });
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${metrics.financial_actions[action.id as keyof typeof metrics.financial_actions] ? 'bg-[#FFEEDD] border-[#FF9933] text-[#D4AF37]' : 'bg-white border-[#eee] text-gray-400'}`}
              >
                <div className="flex items-center gap-3">
                  {action.icon}
                  <span className="text-sm font-bold">{action.label}</span>
                </div>
                {metrics.financial_actions[action.id as keyof typeof metrics.financial_actions] ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Plus: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7v14"/></svg>
);

export default TrackingCenter;
