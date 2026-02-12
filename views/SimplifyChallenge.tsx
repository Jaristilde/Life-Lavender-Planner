
import React from 'react';
import { YearData } from '../types';
import { SIMPLIFY_CHALLENGES } from '../constants';
import { CheckCircle2, Circle, Sparkles } from 'lucide-react';

const SimplifyChallenge: React.FC<{ data: YearData; updateData: (d: YearData) => void }> = ({ data, updateData }) => {
  const toggleDay = (day: number) => {
    if (data.isArchived) return;
    const newList = [...data.simplifyChallenge];
    const idx = newList.findIndex(c => c.day === day);
    newList[idx].completed = !newList[idx].completed;
    updateData({ ...data, simplifyChallenge: newList });
  };

  const progress = data.simplifyChallenge.filter(c => c.completed).length;

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E6D5F0] text-[#7B68A6] rounded-full text-sm font-bold uppercase tracking-widest">
          <Sparkles size={16} /> 30-Day Reset
        </div>
        <h1 className="text-5xl font-bold">The Reset Challenge</h1>
        <p className="text-gray-500 max-w-2xl mx-auto italic">
          30 tiny actions to declutter your physical space, digital life, and mind. 
          Focus on one task each day to create more room for what truly matters.
        </p>

        <div className="pt-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-[#7B68A6]">{progress}/30 Completed</span>
            <span className="text-2xl font-bold serif italic text-[#D4AF37]">{Math.round((progress/30)*100)}%</span>
          </div>
          <div className="w-full bg-[#E6D5F0] h-4 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-[#B19CD9] to-[#7B68A6] transition-all duration-1000 ease-out"
              style={{ width: `${(progress/30)*100}%` }}
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.simplifyChallenge.map((item, index) => {
          const task = SIMPLIFY_CHALLENGES[index];
          return (
            <div 
              key={item.day}
              onClick={() => toggleDay(item.day)}
              className={`paper-card p-6 cursor-pointer transition-all hover:scale-[1.02] border-2 ${
                item.completed ? 'bg-[#F8F7FC] border-[#B19CD9] opacity-80' : 'bg-white border-transparent'
              } ${data.isArchived ? 'cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                  item.completed ? 'bg-[#B19CD9] text-white' : 'bg-[#F8F7FC] text-[#7B68A6]'
                }`}>
                  {item.day}
                </div>
                <div className="flex-1">
                  <p className={`font-medium leading-tight ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {task}
                  </p>
                </div>
                <div>
                  {item.completed ? <CheckCircle2 className="text-[#B19CD9]" /> : <Circle className="text-gray-200" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimplifyChallenge;
