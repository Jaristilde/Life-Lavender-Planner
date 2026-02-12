
import React from 'react';
import { YearData } from '../types';
import { Camera, Type, Image as ImageIcon, Sparkles } from 'lucide-react';

const VisionBoard: React.FC<{ data: YearData; updateData: (d: YearData) => void }> = ({ data, updateData }) => {
  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({
      ...data,
      visionBoard: { ...data.visionBoard, wordOfTheYear: e.target.value }
    });
  };

  const addImage = () => {
    const url = `https://picsum.photos/seed/${Math.random()}/600/400`;
    updateData({
      ...data,
      visionBoard: { ...data.visionBoard, images: [...data.visionBoard.images, url] }
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-1">Vision Board</h1>
          <p className="text-gray-500 italic">Visualize your dreams until they become your reality.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={addImage}
            className="flex items-center gap-2 px-6 py-3 bg-[#E6D5F0] text-[#7B68A6] font-bold rounded-xl hover:bg-[#B19CD9] hover:text-white transition-all shadow-md"
          >
            <ImageIcon size={18} /> Add Inspiration
          </button>
        </div>
      </header>

      <div className="paper-card p-10 min-h-[800px] bg-[radial-gradient(#E6D5F0_1px,transparent_1px)] bg-[size:40px_40px] relative overflow-hidden">
        {/* Word of the Year Centerpiece */}
        <div className="flex flex-col items-center justify-center py-12 mb-12 relative z-10">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#7B68A6] mb-4">Focus of {data.year}</span>
          <input 
            className="text-7xl md:text-9xl serif italic text-[#7B68A6] bg-transparent border-none text-center outline-none focus:ring-0 placeholder:text-[#E6D5F0]"
            placeholder="INTENTION"
            value={data.visionBoard.wordOfTheYear}
            onChange={handleWordChange}
          />
          <div className="w-48 h-[1px] bg-[#D4AF37] mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {data.visionBoard.images.map((img, i) => (
            <div 
              key={i} 
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition-transform cursor-pointer border-4 border-white"
              style={{ transform: `rotate(${(i % 3 === 0 ? -2 : i % 2 === 0 ? 3 : -1)}deg)` }}
            >
              <img src={img} alt="Inspiration" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button 
                  onClick={() => {
                    const newList = [...data.visionBoard.images];
                    newList.splice(i, 1);
                    updateData({ ...data, visionBoard: { ...data.visionBoard, images: newList } });
                  }}
                  className="bg-white/90 p-2 rounded-full text-red-500"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          {/* Goals Stickers */}
          <div className="p-8 bg-[#FFEEDD] shadow-lg rounded-sm aspect-square flex flex-col items-center justify-center text-center rotate-3 border-l-4 border-[#FF9933]">
            <Sparkles className="text-[#FF9933] mb-4" />
            <h3 className="serif text-xl font-bold mb-2">My Top Goal</h3>
            <p className="text-sm italic font-medium">Financial Independence</p>
          </div>
        </div>

        {data.visionBoard.images.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <h2 className="text-4xl serif font-light text-[#7B68A6]">Start pinning your future here...</h2>
          </div>
        )}
      </div>
    </div>
  );
};

const Trash2: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);

export default VisionBoard;
