
import React, { useEffect, useState } from 'react';
import {
  X,
  BarChart3,
  Target,
  Sparkles,
  CalendarCheck,
  BookOpen,
  History,
  Settings,
  Plus,
  ChevronRight,
  Info,
  Calendar,
  Heart,
  Library as LibraryIcon,
  User,
  Database,
  MessageCircle,
  Shield
} from 'lucide-react';
import ButterflyIcon from './ButterflyIcon';

interface MoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  setView: (view: string) => void;
  activeYear: number;
  years: number[];
  onYearChange: (year: number) => void;
  onAddYear: () => void;
  isPremium?: boolean;
  userName?: string;
}

const MoreSheet: React.FC<MoreSheetProps> = ({
  isOpen,
  onClose,
  currentView,
  setView,
  activeYear,
  years,
  onYearChange,
  onAddYear,
  isPremium,
  userName
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setIsAnimating(false), 300);
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  const moreItems = [
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'tracking', label: 'Tracking Center', icon: BarChart3 },
    { id: 'vision', label: 'Vision Board', icon: Target },
    { id: 'wellness', label: 'Wellness', icon: Heart },
    { id: 'simplify', label: '30-Day Reset', icon: Sparkles },
    { id: 'monthlyReset', label: 'Monthly Reset', icon: CalendarCheck },
    { id: 'workbook', label: 'Money Reset', icon: BookOpen },
    { id: 'reflections', label: 'Reflections', icon: History },
    { id: 'library', label: 'Library', icon: LibraryIcon },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'database', label: 'Database Explorer', icon: Database },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-2xl transition-transform duration-300 transform ease-out px-6 pb-12 pt-4 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Handle Bar */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl serif font-bold text-[#7B68A6]">More Destinations</h2>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Year Switcher */}
        <div className="mb-8 p-4 bg-[#F8F7FC] rounded-2xl border border-[#E6D5F0]">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Planning Year</label>
          <div className="flex items-center gap-3">
            <select 
              value={activeYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="flex-1 bg-white border border-[#E6D5F0] rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#B19CD9]"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button 
              onClick={onAddYear}
              className="p-3 bg-[#E6D5F0] text-[#7B68A6] rounded-xl hover:bg-[#B19CD9] hover:text-white transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Nav Grid */}
        <div className="grid grid-cols-2 gap-4 max-h-[40vh] overflow-y-auto custom-scrollbar">
          {moreItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id);
                onClose();
              }}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl transition-all border ${
                currentView === item.id 
                  ? 'bg-[#E6D5F0] border-[#B19CD9] text-[#7B68A6]' 
                  : 'bg-white border-[#F0F0F0] text-gray-600 active:scale-95'
              }`}
            >
              <item.icon size={24} className={currentView === item.id ? 'text-[#7B68A6]' : 'text-[#9B8EC4]'} />
              <span className="text-[11px] font-bold tracking-tight">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-[#F0F0F0] space-y-3">
          {/* Plan Badge */}
          <div className={`px-4 py-3 rounded-xl flex items-center gap-3 ${
            isPremium
              ? 'bg-gradient-to-r from-[#D4AF37]/10 to-[#B19CD9]/10 border border-[#D4AF37]/20'
              : 'bg-[#F8F7FC] border border-[#E6D5F0]'
          }`}>
            {isPremium ? <ButterflyIcon size={16} className="text-[#D4AF37]" /> : <Shield size={16} className="text-[#B19CD9]" />}
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{userName || 'User'}</p>
              <p className={`text-xs font-bold ${isPremium ? 'text-[#D4AF37]' : 'text-[#7B68A6]'}`}>
                {isPremium ? 'Premium Plan' : 'Free Plan'}
              </p>
            </div>
          </div>
          <button
            onClick={() => { setView('profile'); onClose(); }}
            className="w-full flex items-center justify-between px-4 py-3 text-gray-500 hover:text-[#7B68A6] transition-colors bg-[#F8F7FC] rounded-xl"
          >
            <div className="flex items-center gap-3">
              <Settings size={20} />
              <span className="font-bold text-sm">Account Settings</span>
            </div>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoreSheet;
