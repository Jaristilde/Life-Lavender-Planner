
import React from 'react';
import {
  Home,
  Wallet,
  Sparkles,
  Menu,
  ClipboardList
} from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  setView: (view: string) => void;
  onMoreClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView, onMoreClick }) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'planner', label: 'Planner', icon: ClipboardList },
    { id: 'vision', label: 'Vision', icon: Sparkles },
    { id: 'financial', label: 'Finance', icon: Wallet },
    { id: 'more', label: 'More', icon: Menu },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex items-center"
      style={{ height: '60px', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map(tab => {
        const isActive = tab.id !== 'more' && currentView === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'more') {
                onMoreClick();
              } else {
                setView(tab.id);
              }
            }}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full"
          >
            <tab.icon
              size={20}
              className={isActive ? 'text-[#B19CD9]' : 'text-[#999]'}
              strokeWidth={isActive ? 2.5 : 1.5}
            />
            <span
              className={`text-[10px] font-semibold ${isActive ? 'text-[#B19CD9]' : 'text-[#999]'}`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
