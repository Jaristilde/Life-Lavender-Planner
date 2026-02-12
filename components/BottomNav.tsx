
import React from 'react';
import { 
  Home, 
  Wallet, 
  Heart, 
  Menu,
  Sunrise
} from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  setView: (view: string) => void;
  onMoreClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView, onMoreClick }) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'financial', label: 'Finance', icon: Wallet },
    { id: 'morningReset', label: 'Morning', icon: Sunrise },
    { id: 'wellness', label: 'Wellness', icon: Heart },
    { id: 'more', label: 'More', icon: Menu },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E6D5F0] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50 px-4 flex items-center justify-around h-[70px] pb-[env(safe-area-inset-bottom)]"
    >
      {tabs.map(tab => {
        const isActive = currentView === tab.id || (tab.id === 'more' && false); // More is a sheet, not a view
        
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
            className={`flex flex-col items-center justify-center gap-1 min-w-[64px] h-full transition-all active:scale-90 ${
              isActive ? 'text-[#7B68A6]' : 'text-[#9B8EC4]'
            }`}
          >
            <div className="relative flex flex-col items-center">
              <tab.icon 
                size={24} 
                className={`transition-all ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} 
              />
              {isActive && (
                <div className="absolute -bottom-1.5 w-1 h-1 bg-[#7B68A6] rounded-full" />
              )}
            </div>
            <span className={`text-[10px] font-bold tracking-tight transition-all ${isActive ? 'opacity-100' : 'opacity-70'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
