
import React from 'react';
import { YearData } from '../types';
import { Sparkles, TrendingUp, CheckCircle, Quote, Crown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard: React.FC<{ data: YearData; updateData: (d: YearData) => void }> = ({ data, updateData }) => {
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Welcome to {data.year}</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <div className="paper-card p-6">
          <div className="flex items-center gap-3 mb-4 text-[#D4AF37]">
            <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider">Word of the Year</h3>
          </div>
          <p className="text-2xl font-bold serif italic text-[#7B68A6]">
            {data.visionBoard.wordOfTheYear || 'Not set yet'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Your Focus</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="paper-card p-8 lg:col-span-2">
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
