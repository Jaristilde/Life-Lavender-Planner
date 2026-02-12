
import React, { useState, useRef } from 'react';
import { YearData } from '../types';
import { Image as ImageIcon, Sparkles, Upload, X, Trash2, Plus, Calendar, Star } from 'lucide-react';

const STOCK_GALLERY = [
  { url: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&w=600&q=80', tag: 'Flight' },
  { url: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=600&q=80', tag: 'Cruise' },
  { url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80', tag: 'Traveler' },
  { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', tag: 'Beach' },
  { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80', tag: 'Wedding' },
  { url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80', tag: 'Babies' },
  { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80', tag: 'Gym' },
  { url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&q=80', tag: 'New Car' },
  { url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80', tag: 'Engagement' },
  { url: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=600&q=80', tag: 'Inspiration' },
  { url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80', tag: 'Save Planet' },
  { url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80', tag: 'Family' },
  { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80', tag: 'Harmony' },
  { url: 'https://images.unsplash.com/photo-1502301197179-65228ab57f78?auto=format&fit=crop&w=600&q=80', tag: 'Giggle' },
  { url: 'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&w=600&q=80', tag: 'Best Life' },
  { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80', tag: 'Yoga' },
  { url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=600&q=80', tag: 'Saving Money' },
  { url: 'https://images.unsplash.com/photo-1520206159579-53d3d65ad460?auto=format&fit=crop&w=600&q=80', tag: 'Superior Sleep' },
];

const VisionBoard: React.FC<{ data: YearData; updateData: (d: YearData) => void }> = ({ data, updateData }) => {
  const [showGallery, setShowGallery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({
      ...data,
      visionBoard: { ...data.visionBoard, wordOfTheYear: e.target.value }
    });
  };

  const addImage = (url: string) => {
    updateData({
      ...data,
      visionBoard: { ...data.visionBoard, images: [...data.visionBoard.images, url] }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        addImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    const newList = [...data.visionBoard.images];
    newList.splice(index, 1);
    updateData({ ...data, visionBoard: { ...data.visionBoard, images: newList } });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-1 serif">Vision Board</h1>
          <p className="text-gray-500 italic">"manifesting my dream job & life ✨"</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            accept="image/*"
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-[#E6D5F0] text-[#7B68A6] font-bold rounded-xl hover:bg-[#F8F7FC] transition-all shadow-sm"
          >
            <Upload size={18} /> Upload Photo
          </button>
          <button 
            onClick={() => setShowGallery(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#B19CD9] text-white font-bold rounded-xl hover:bg-[#7B68A6] transition-all shadow-md"
          >
            <ImageIcon size={18} /> Inspiration Gallery
          </button>
        </div>
      </header>

      {/* Notion Style Header Blocks */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-none w-full md:w-64 bg-[#FDF4E3]/50 p-4 rounded-xl border border-[#FDE6D2] flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Calendar size={20} className="text-[#8B5E3C]" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B5E3C]/60">Year</p>
            <p className="font-bold text-[#8B5E3C]">{data.year}</p>
          </div>
        </div>
        <div className="flex-1 bg-[#FDF4E3]/50 p-4 rounded-xl border border-[#FDE6D2] flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Star size={20} className="text-[#8B5E3C]" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B5E3C]/60">Overall Theme</p>
            <input 
              className="w-full bg-transparent border-none outline-none font-bold text-[#8B5E3C] placeholder:text-[#8B5E3C]/30"
              placeholder="What is your focus this year?"
              value={data.visionBoard.wordOfTheYear}
              onChange={handleWordChange}
            />
          </div>
        </div>
      </div>

      {/* Main Board Area */}
      <div className="paper-card p-10 min-h-[900px] bg-white border-[#eee] relative overflow-hidden">
        {/* Aesthetic Grids Inspired by Notion Screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">
          
          {/* Group Header Template (Visual only to match the vibe) */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 mb-4">
            {["Work Life", "Relationships", "Dream Career", "Wellness", "Travel"].map(cat => (
              <div key={cat} className="flex items-center gap-2 text-[#8B5E3C] font-bold serif text-lg opacity-60">
                <div className="w-1 h-4 bg-[#8B5E3C]/30 rounded-full" />
                {cat}
              </div>
            ))}
          </div>

          {data.visionBoard.images.map((img, i) => (
            <div 
              key={i} 
              className="group relative aspect-[3/4] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer border border-[#eee]"
            >
              <img src={img} alt="Inspiration" className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(i);
                  }}
                  className="bg-white/90 p-3 rounded-full text-red-500 shadow-lg hover:scale-110 transition-transform"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            </div>
          ))}

          {/* Empty State Cards */}
          {data.visionBoard.images.length < 12 && Array.from({ length: Math.max(0, 12 - data.visionBoard.images.length) }).map((_, i) => (
            <div 
              key={`empty-${i}`}
              onClick={() => setShowGallery(true)}
              className="aspect-[3/4] rounded-xl border-2 border-dashed border-[#E6D5F0] flex flex-col items-center justify-center text-[#B19CD9] hover:bg-[#F8F7FC] transition-colors cursor-pointer"
            >
              <Plus size={32} className="opacity-20 mb-2" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Add Vision</span>
            </div>
          ))}
        </div>

        {data.visionBoard.images.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
             <div className="text-center">
                <Sparkles size={120} className="mx-auto text-[#7B68A6] mb-4" />
                <h2 className="text-4xl serif font-light text-[#7B68A6]">Start pinning your future...</h2>
             </div>
          </div>
        )}
      </div>

      {/* Stock Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-[#eee] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#E6D5F0] rounded-2xl"><Sparkles className="text-[#7B68A6]" /></div>
                <div>
                  <h2 className="text-2xl font-bold serif text-[#7B68A6]">Inspiration Gallery</h2>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">The fun stuff curated for you</p>
                </div>
              </div>
              <button 
                onClick={() => setShowGallery(false)}
                className="p-3 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {STOCK_GALLERY.map((item, idx) => (
                  <div 
                    key={idx}
                    className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group hover:ring-4 hover:ring-[#B19CD9] transition-all"
                    onClick={() => {
                      addImage(item.url);
                      setShowGallery(false);
                    }}
                  >
                    <img src={item.url} alt={item.tag} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                      <span className="font-bold text-sm mb-2">{item.tag}</span>
                      <div className="p-2 bg-[#B19CD9] rounded-full"><Plus size={16} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-[#F8F7FC] border-t border-[#eee] text-center">
              <p className="text-sm text-gray-500 italic">"What you focus on, you attract. Dream big, {data.year} is yours."</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisionBoard;
