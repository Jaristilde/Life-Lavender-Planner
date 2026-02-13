
import React, { useState, useRef, useEffect } from 'react';
import { YearData } from '../types';
import {
  Image as ImageIcon,
  Sparkles,
  Upload,
  X,
  Trash2,
  Plus,
  Star,
  Wand2,
  Loader2,
  HelpCircle,
  Check,
  Type
} from 'lucide-react';
import { generateVisionImage, isAiEnabled } from '../services/geminiService';

// ─── Local Gallery (replaces Unsplash) ──────────────────────────────────────
const LOCAL_GALLERY = [
  { url: '/fiancialabundance.jpg', tag: 'Financial Abundance', category: 'Financial' },
  { url: '/FinancialFreedom.jpg', tag: 'Financial Freedom', category: 'Financial' },
  { url: '/newjob.jpg', tag: 'New Job', category: 'Career' },
  { url: '/ownbusiness.jpg', tag: 'Own Business', category: 'Career' },
  { url: '/growth.jpg', tag: 'Growth', category: 'Career' },
  { url: '/apartmentnew.jpg', tag: 'New Apartment', category: 'Home' },
  { url: '/newhome.jpg', tag: 'New Home', category: 'Home' },
  { url: '/Exploredworld.jpg', tag: 'Explore the World', category: 'Travel' },
  { url: '/newhorizon.jpg', tag: 'New Horizons', category: 'Travel' },
  { url: '/travel.jpg', tag: 'Travel', category: 'Travel' },
  { url: '/family.jpg', tag: 'Family', category: 'Family' },
  { url: '/heath&fitness.jpg', tag: 'Health & Fitness', category: 'Health' },
  { url: '/school.jpg', tag: 'Education', category: 'Education' },
  { url: '/car.jpg', tag: 'New Car', category: 'Lifestyle' },
];

const CATEGORIES = ['All', 'Financial', 'Career', 'Home', 'Travel', 'Family', 'Health', 'Education', 'Lifestyle'];

// ─── How-To Guide Steps ─────────────────────────────────────────────────────
const GUIDE_STEPS = [
  { num: 1, title: 'Browse Gallery', desc: 'Tap "Inspiration Gallery" to explore curated images sorted by category — finances, career, travel, and more.' },
  { num: 2, title: 'Upload Photos', desc: 'Add your own photos directly from your phone or computer using the Upload button.' },
  { num: 3, title: 'Add Text', desc: 'Tap any image on your board to add a personal affirmation or goal as a text overlay.' },
  { num: 4, title: 'Set Word of Year', desc: 'Define your overall theme at the top to keep your vision focused all year long.' },
];

const VisionBoard: React.FC<{ data: YearData; updateData: (d: YearData) => void }> = ({ data, updateData }) => {
  const [showGallery, setShowGallery] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [textEditIndex, setTextEditIndex] = useState<number | null>(null);
  const [textDraft, setTextDraft] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-show guide on first visit
  useEffect(() => {
    const shown = localStorage.getItem('visionBoardGuideShown');
    if (!shown) {
      setShowGuide(true);
      localStorage.setItem('visionBoardGuideShown', 'true');
    }
  }, []);

  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({
      ...data,
      visionBoard: { ...data.visionBoard, wordOfTheYear: e.target.value }
    });
  };

  const addImage = (url: string) => {
    updateData({
      ...data,
      visionBoard: {
        ...data.visionBoard,
        images: [...data.visionBoard.images, url],
        goals: [...data.visionBoard.goals, '']
      }
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
    const newImages = [...data.visionBoard.images];
    const newGoals = [...data.visionBoard.goals];
    newImages.splice(index, 1);
    newGoals.splice(index, 1);
    updateData({ ...data, visionBoard: { ...data.visionBoard, images: newImages, goals: newGoals } });
  };

  const openTextOverlay = (index: number) => {
    setTextEditIndex(index);
    setTextDraft(data.visionBoard.goals[index] || '');
    setShowTextModal(true);
  };

  const saveTextOverlay = () => {
    if (textEditIndex === null) return;
    const newGoals = [...data.visionBoard.goals];
    newGoals[textEditIndex] = textDraft;
    updateData({ ...data, visionBoard: { ...data.visionBoard, goals: newGoals } });
    setShowTextModal(false);
    setTextEditIndex(null);
    setTextDraft('');
  };

  const handleGenerateAiImage = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setGeneratedImg(null);
    const result = await generateVisionImage(aiPrompt);
    setGeneratedImg(result);
    setIsGenerating(false);
  };

  const filteredGallery = activeCategory === 'All'
    ? LOCAL_GALLERY
    : LOCAL_GALLERY.filter(img => img.category === activeCategory);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-24">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold serif">Vision Board</h1>
            <p className="text-gray-500 italic text-sm">"manifesting my dream life ✨"</p>
          </div>
          <button
            onClick={() => setShowGuide(true)}
            className="p-2 rounded-full bg-[#F8F7FC] text-[#7B68A6] hover:bg-[#E6D5F0] transition-colors"
            title="How to use"
          >
            <HelpCircle size={20} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E6D5F0] text-[#7B68A6] font-bold rounded-xl hover:bg-[#F8F7FC] transition-all shadow-sm text-sm"
          >
            <Upload size={16} /> Upload
          </button>
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#7B68A6] to-[#B19CD9] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-md text-sm"
          >
            <Wand2 size={16} /> Magic Manifest
          </button>
          <button
            onClick={() => setShowGallery(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#B19CD9] text-white font-bold rounded-xl hover:bg-[#7B68A6] transition-all shadow-md text-sm"
          >
            <ImageIcon size={16} /> Gallery
          </button>
        </div>
      </header>

      {/* ─── Word of the Year Card ─────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#F8F7FC] to-[#FDF4E3]/40 p-5 rounded-2xl border border-[#E6D5F0] flex items-center gap-4">
        <div className="p-3 bg-white rounded-xl shadow-sm flex-none">
          <Star size={24} className="text-[#7B68A6]" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#7B68A6]/60 mb-1">Word of the Year</p>
          <input
            className="w-full bg-transparent border-none outline-none font-bold text-lg text-[#7B68A6] placeholder:text-[#B19CD9]/40 serif"
            placeholder="What is your focus this year?"
            value={data.visionBoard.wordOfTheYear}
            onChange={handleWordChange}
          />
        </div>
      </div>

      {/* ─── Main Board Area ───────────────────────────────────────────── */}
      <div className="paper-card p-4 md:p-8 min-h-[500px] bg-white border-[#eee] relative overflow-hidden">
        {data.visionBoard.images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 relative z-10">
            {data.visionBoard.images.map((img, i) => (
              <div
                key={i}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer border border-[#eee]"
                onClick={() => openTextOverlay(i)}
              >
                <img src={img} alt="Vision" className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />

                {/* Text overlay */}
                {data.visionBoard.goals[i] && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                    <p className="text-white text-xs md:text-sm font-bold drop-shadow-lg">{data.visionBoard.goals[i]}</p>
                  </div>
                )}

                {/* Hover controls */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); openTextOverlay(i); }}
                    className="bg-white/90 p-2 rounded-full text-[#7B68A6] shadow-lg hover:scale-110 transition-transform"
                    title="Add text"
                  >
                    <Type size={18} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                    className="bg-white/90 p-2 rounded-full text-red-500 shadow-lg hover:scale-110 transition-transform"
                    title="Remove"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {/* Add more placeholder */}
            <div
              onClick={() => setShowGallery(true)}
              className="aspect-[3/4] rounded-xl border-2 border-dashed border-[#E6D5F0] flex flex-col items-center justify-center text-[#B19CD9] hover:bg-[#F8F7FC] transition-colors cursor-pointer"
            >
              <Plus size={28} className="opacity-30 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Add Vision</span>
            </div>
          </div>
        ) : (
          /* Empty state with decorative butterfly */
          <div className="flex flex-col items-center justify-center py-16 relative">
            <img
              src="/butterfly2.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none rounded-xl"
            />
            <div className="relative z-10 text-center space-y-4">
              <Sparkles size={80} className="mx-auto text-[#B19CD9] opacity-30" />
              <h2 className="text-2xl md:text-3xl serif font-light text-[#7B68A6] opacity-60">Start pinning your future...</h2>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">Tap "Gallery" or "Upload" above to add your first vision to the board.</p>
              <button
                onClick={() => setShowGallery(true)}
                className="mt-4 px-6 py-3 bg-[#B19CD9] text-white font-bold rounded-xl hover:bg-[#7B68A6] transition-all shadow-md text-sm"
              >
                <span className="flex items-center gap-2"><ImageIcon size={16} /> Browse Gallery</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── How-To Guide Modal ────────────────────────────────────────── */}
      {showGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden">
            {/* Lavender gradient header */}
            <div className="p-6 bg-gradient-to-r from-[#7B68A6] to-[#B19CD9] text-white text-center">
              <HelpCircle size={36} className="mx-auto mb-2 opacity-80" />
              <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>How to Use Your Vision Board</h2>
              <p className="text-xs text-white/70 mt-1 uppercase tracking-widest font-bold">4 simple steps</p>
            </div>

            <div className="p-6 space-y-5">
              {GUIDE_STEPS.map(step => (
                <div key={step.num} className="flex items-start gap-4">
                  <div className="flex-none w-8 h-8 rounded-full bg-[#E6D5F0] text-[#7B68A6] flex items-center justify-center font-bold text-sm">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#7B68A6]" style={{ fontFamily: "'Playfair Display', serif" }}>{step.title}</h3>
                    <p className="text-gray-500 text-sm mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={() => setShowGuide(false)}
                className="w-full py-4 bg-gradient-to-r from-[#7B68A6] to-[#B19CD9] text-white font-bold rounded-2xl shadow-lg hover:opacity-90 transition-all text-sm"
              >
                Got it, let's start!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Text Overlay Modal ────────────────────────────────────────── */}
      {showTextModal && textEditIndex !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-[#eee] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#E6D5F0] rounded-xl"><Type size={20} className="text-[#7B68A6]" /></div>
                <h2 className="text-lg font-bold serif text-[#7B68A6]">Add Text Overlay</h2>
              </div>
              <button onClick={() => setShowTextModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="aspect-video rounded-xl overflow-hidden border border-[#eee]">
                <img src={data.visionBoard.images[textEditIndex]} alt="Selected" className="w-full h-full object-cover" />
              </div>
              <textarea
                className="w-full h-24 p-4 bg-[#F8F7FC] border border-[#E6D5F0] rounded-2xl outline-none focus:ring-2 focus:ring-[#B19CD9] text-sm resize-none"
                placeholder="Write your affirmation or goal..."
                value={textDraft}
                onChange={(e) => setTextDraft(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTextModal(false)}
                  className="flex-1 py-3 border border-[#E6D5F0] text-[#7B68A6] font-bold rounded-xl hover:bg-[#F8F7FC] transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={saveTextOverlay}
                  className="flex-1 py-3 bg-[#7B68A6] text-white font-bold rounded-xl shadow-md hover:bg-[#B19CD9] transition-all text-sm"
                >
                  Save Text
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── AI Generation Modal ───────────────────────────────────────── */}
      {showAiModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-8 border-b border-[#eee] flex items-center justify-between bg-gradient-to-r from-[#7B68A6] to-[#B19CD9]">
              <div className="flex items-center gap-4 text-white">
                <div className="p-3 bg-white/20 rounded-2xl"><Wand2 size={24} /></div>
                <div>
                  <h2 className="text-2xl font-bold serif">Magic Manifest</h2>
                  <p className="text-xs text-white/70 uppercase tracking-widest font-bold">Dream it, generate it</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-3 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {!generatedImg && !isGenerating ? (
                <>
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Describe your dream</label>
                    <textarea
                      className="w-full h-40 p-6 bg-[#F8F7FC] border border-[#E6D5F0] rounded-3xl outline-none focus:ring-2 focus:ring-[#B19CD9] text-lg resize-none italic"
                      placeholder="e.g. A peaceful workspace in a glass house overlooking the mountains, decorated with lavender flowers and cozy blankets..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                    />
                  </div>
                  <button
                    disabled={!aiPrompt.trim()}
                    onClick={handleGenerateAiImage}
                    className="w-full py-5 bg-gradient-to-r from-[#7B68A6] to-[#B19CD9] text-white font-bold rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    <Sparkles size={20} /> Manifest Vision
                  </button>
                </>
              ) : isGenerating ? (
                <div className="py-12 flex flex-col items-center text-center space-y-6 animate-pulse">
                  <div className="relative">
                    <Loader2 size={80} className="text-[#B19CD9] animate-spin" />
                    <Sparkles size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#7B68A6]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl serif font-bold text-[#7B68A6]">Visualizing your future...</h3>
                    <p className="text-gray-400 italic">"The universe is aligning your dreams with reality."</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                    <img src={generatedImg!} alt="Generated Vision" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setGeneratedImg(null)}
                      className="flex-1 py-4 border border-[#E6D5F0] text-[#7B68A6] font-bold rounded-2xl hover:bg-[#F8F7FC] transition-all"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => {
                        addImage(generatedImg!);
                        setShowAiModal(false);
                        setGeneratedImg(null);
                        setAiPrompt('');
                      }}
                      className="flex-1 py-4 bg-[#7B68A6] text-white font-bold rounded-2xl shadow-lg hover:bg-[#B19CD9] transition-all"
                    >
                      Add to Board
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Gallery Modal with Category Tabs ──────────────────────────── */}
      {showGallery && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 md:p-8 border-b border-[#eee] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#E6D5F0] rounded-2xl"><Sparkles className="text-[#7B68A6]" /></div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold serif text-[#7B68A6]">Inspiration Gallery</h2>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Curated for your vision</p>
                </div>
              </div>
              <button
                onClick={() => setShowGallery(false)}
                className="p-3 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            {/* Category filter tabs — horizontal scrollable */}
            <div className="px-6 md:px-8 pt-4 pb-2 overflow-x-auto flex gap-2 no-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-none px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-[#7B68A6] text-white shadow-md'
                      : 'bg-[#F8F7FC] text-[#7B68A6] hover:bg-[#E6D5F0]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredGallery.map((item, idx) => {
                  const alreadyAdded = data.visionBoard.images.includes(item.url);
                  return (
                    <div
                      key={idx}
                      className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer group hover:ring-4 hover:ring-[#B19CD9] transition-all ${alreadyAdded ? 'ring-2 ring-[#7B68A6]' : ''}`}
                      onClick={() => { if (!alreadyAdded) addImage(item.url); }}
                    >
                      <img src={item.url} alt={item.tag} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                        <span className="font-bold text-xs md:text-sm mb-2 text-center px-2">{item.tag}</span>
                        {alreadyAdded ? (
                          <div className="p-2 bg-green-500 rounded-full"><Check size={16} /></div>
                        ) : (
                          <div className="p-2 bg-[#B19CD9] rounded-full"><Plus size={16} /></div>
                        )}
                      </div>
                      {/* Always-visible checkmark for added images */}
                      {alreadyAdded && (
                        <div className="absolute top-2 right-2 p-1 bg-green-500 rounded-full text-white shadow-md">
                          <Check size={14} />
                        </div>
                      )}
                      {/* Category badge */}
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/80 rounded-full text-[10px] font-bold text-[#7B68A6]">
                        {item.category}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 md:p-8 bg-[#F8F7FC] border-t border-[#eee] text-center">
              <p className="text-sm text-gray-500 italic">"What you focus on, you attract. Dream big, {data.year} is yours."</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisionBoard;
