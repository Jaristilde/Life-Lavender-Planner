
import React from 'react';
import { YearData } from '../types';
import { History, Award, Heart, BookOpen, Download } from 'lucide-react';

const Reflections: React.FC<{ data: YearData; updateData: (d: YearData) => void }> = ({ data, updateData }) => {
  const updateReflections = (newR: Partial<typeof data.reflections>) => {
    updateData({ ...data, reflections: { ...data.reflections, ...newR } });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-1">Yearly Reflections</h1>
          <p className="text-gray-500 italic">"We do not learn from experience... we learn from reflecting on experience."</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#7B68A6] text-white font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-lg">
          <Download size={18} /> Export PDF
        </button>
      </header>

      <div className="space-y-8">
        <section className="paper-card p-10">
          <div className="flex items-center gap-4 mb-8">
            <Award className="text-[#D4AF37]" size={32} />
            <h2 className="text-3xl serif font-bold">Top Achievements</h2>
          </div>
          <textarea 
            className="w-full min-h-[150px] p-6 bg-[#F8F7FC] border border-[#E6D5F0] rounded-2xl italic text-lg outline-none focus:ring-2 focus:ring-[#B19CD9]"
            placeholder="What are the wins that made you proud this year?"
            value={data.reflections.lessons}
            onChange={(e) => updateReflections({ lessons: e.target.value })}
          />
        </section>

        <section className="paper-card p-10">
          <div className="flex items-center gap-4 mb-8">
            <Heart className="text-[#B19CD9]" size={32} />
            <h2 className="text-3xl serif font-bold">Gratitude Journal</h2>
          </div>
          <textarea 
            className="w-full min-h-[150px] p-6 bg-[#F8F7FC] border border-[#E6D5F0] rounded-2xl italic text-lg outline-none focus:ring-2 focus:ring-[#B19CD9]"
            placeholder="Who and what are you most grateful for?"
            value={data.reflections.gratitude}
            onChange={(e) => updateReflections({ gratitude: e.target.value })}
          />
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="paper-card p-8 bg-[#E6D5F0]/20 border-[#E6D5F0]">
            <BookOpen className="text-[#7B68A6] mb-4" />
            <h3 className="text-xl font-bold mb-4">Biggest Lesson Learned</h3>
            <p className="text-gray-500 italic">Reflection is the mirror of the soul.</p>
          </div>
          <div className="paper-card p-8 bg-[#F8F7FC] border-[#E6D5F0]">
            <History className="text-[#B19CD9] mb-4" />
            <h3 className="text-xl font-bold mb-4">Financial Progress</h3>
            <p className="text-gray-500 italic">Your habits shape your future wealth.</p>
          </div>
        </div>

        <div className="pt-10 border-t border-[#eee] flex justify-center">
          <button 
            className={`px-10 py-4 rounded-full font-bold text-lg transition-all ${
              data.isArchived 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-[#B19CD9] text-white hover:bg-[#7B68A6] shadow-xl'
            }`}
            onClick={() => updateData({ ...data, isArchived: true })}
            disabled={data.isArchived}
          >
            {data.isArchived ? 'Year Archived' : 'Archive Year & Reset'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reflections;
