
import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  Heart,
  Calendar,
  Target,
  Sparkles,
  History,
  Settings,
  X,
  Plus,
  BarChart3,
  BookOpen,
  CalendarCheck,
  Sunrise,
  Library as LibraryIcon
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeYear: number;
  years: number[];
  onYearChange: (year: number) => void;
  onAddYear: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setView,
  isOpen,
  setIsOpen,
  activeYear,
  years,
  onYearChange,
  onAddYear
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'morningReset', label: 'Morning Reset', icon: Sunrise },
    { id: 'tracking', label: 'Tracking Center', icon: BarChart3 },
    { id: 'financial', label: 'Financial Hub', icon: Wallet },
    { id: 'wellness', label: 'Wellness Tracker', icon: Heart },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'vision', label: 'Vision Board', icon: Target },
    { id: 'simplify', label: '30-Day Reset', icon: Sparkles },
    { id: 'monthlyReset', label: 'Monthly Reset', icon: CalendarCheck },
    { id: 'workbook', label: 'Money Reset', icon: BookOpen },
    { id: 'reflections', label: 'Reflections', icon: History },
    { id: 'library', label: 'Library', icon: LibraryIcon },
  ];

  const NavLink = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => {
        setView(id);
        if (window.innerWidth < 1024) setIsOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        currentView === id
          ? 'bg-[#B19CD9] text-white shadow-md'
          : 'text-gray-600 hover:bg-[#E6D5F0] hover:text-[#7B68A6]'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-[#eee] transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        hidden lg:block
      `}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-2xl serif font-bold text-[#7B68A6]">Lavender Life Planner</h1>
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400">
              <X size={24} />
            </button>
          </div>

          <div className="mb-8">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Current Year</label>
            <div className="flex items-center gap-2">
              <select
                value={activeYear}
                onChange={(e) => onYearChange(Number(e.target.value))}
                className="flex-1 bg-[#F8F7FC] border border-[#E6D5F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B19CD9]"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <button
                onClick={onAddYear}
                className="p-2 bg-[#E6D5F0] text-[#7B68A6] rounded-lg hover:bg-[#B19CD9] hover:text-white transition-colors"
                title="Add New Year"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block px-4">Menu</label>
            {navItems.map(item => (
              <NavLink key={item.id} {...item} />
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-[#eee]">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-[#7B68A6] transition-colors">
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
