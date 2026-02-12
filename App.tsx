
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import MoreSheet from './components/MoreSheet';
import { YearData, AppState, UserDailyMetrics } from './types';
import { INITIAL_YEAR_DATA, DEFAULT_DAILY_METRICS } from './constants';
import Dashboard from './views/Dashboard';
import FinancialHub from './views/FinancialHub';
import WellnessTracker from './views/WellnessTracker';
import Planner from './views/Planner';
import VisionBoard from './views/VisionBoard';
import SimplifyChallenge from './views/SimplifyChallenge';
import Reflections from './views/Reflections';
import TrackingCenter from './views/TrackingCenter';
import FinancialWorkbook from './views/FinancialWorkbook';
import MorningAlignmentModal from './components/MorningAlignmentModal';
import PremiumOnboarding from './views/PremiumOnboarding';
import MonthlyReset from './views/MonthlyReset';

const STORAGE_KEY = 'lavender_planner_premium_v1';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Check for trial expiration on load
      if (parsed.trialStartDate) {
        const startDate = new Date(parsed.trialStartDate);
        const now = new Date();
        const diffDays = (now.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays >= 5) {
          parsed.isPremium = false;
        }
      }
      return parsed;
    }
    const currentYear = new Date().getFullYear();
    return {
      years: { [currentYear]: INITIAL_YEAR_DATA(currentYear) },
      currentYear,
      isPremium: true,
      googleSync: {
        enabled: false,
        syncFrequency: 'manual',
        showEvents: true,
        isConnected: false
      },
      userName: '',
      userMood: '',
      userFeeling: '',
      trialStartDate: null
    };
  });

  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAlignmentModalOpen, setIsAlignmentModalOpen] = useState(false);
  const [hasCheckedAlignment, setHasCheckedAlignment] = useState(false);
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, [appState]);

  const activeYearData = useMemo(() => appState.years[appState.currentYear], [appState]);

  // Check for morning alignment on initial load of the day
  useEffect(() => {
    if (appState.userName && activeYearData && !hasCheckedAlignment) {
      const today = new Date().toISOString().split('T')[0];
      const todayMetrics = activeYearData.dailyMetrics[today];
      if (!todayMetrics || !todayMetrics.morning_alignment_completed) {
        setIsAlignmentModalOpen(true);
      }
      setHasCheckedAlignment(true);
    }
  }, [appState.userName, activeYearData, hasCheckedAlignment]);

  const updateYearData = useCallback((data: YearData) => {
    setAppState(prev => ({
      ...prev,
      years: { ...prev.years, [data.year]: data }
    }));
  }, []);

  const updateGoogleSync = (settings: Partial<AppState['googleSync']>) => {
    setAppState(prev => ({
      ...prev,
      googleSync: { ...prev.googleSync, ...settings }
    }));
  };

  const handleAddYear = () => {
    const nextYear = Math.max(...Object.keys(appState.years).map(Number)) + 1;
    setAppState(prev => ({
      ...prev,
      years: { ...prev.years, [nextYear]: INITIAL_YEAR_DATA(nextYear) },
      currentYear: nextYear
    }));
  };

  const handleAlignmentSave = (metrics: Partial<UserDailyMetrics>) => {
    const today = new Date().toISOString().split('T')[0];
    const existingMetrics = activeYearData.dailyMetrics[today] || DEFAULT_DAILY_METRICS(today);
    const updatedMetrics = { ...existingMetrics, ...metrics };
    
    updateYearData({
      ...activeYearData,
      dailyMetrics: {
        ...activeYearData.dailyMetrics,
        [today]: updatedMetrics
      }
    });
    setCurrentView('dashboard');
  };

  const handleOnboardingComplete = (data: { 
    userName: string; 
    userMood: string; 
    userFeeling: string; 
    isPremium: boolean;
    trialStartDate: string | null;
  }) => {
    setAppState(prev => ({
      ...prev,
      ...data
    }));
  };

  if (!appState.userName) {
    return <PremiumOnboarding onComplete={handleOnboardingComplete} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard data={activeYearData} updateData={updateYearData} setView={setCurrentView} userName={appState.userName} mood={appState.userMood} feeling={appState.userFeeling} />;
      case 'tracking': return <TrackingCenter data={activeYearData} updateData={updateYearData} />;
      case 'financial': return <FinancialHub data={activeYearData} updateData={updateYearData} isPremium={appState.isPremium} />;
      case 'wellness': return <WellnessTracker data={activeYearData} updateData={updateYearData} />;
      case 'planner': return <Planner data={activeYearData} updateData={updateYearData} googleSync={appState.googleSync} updateGoogleSync={updateGoogleSync} />;
      case 'vision': return <VisionBoard data={activeYearData} updateData={updateYearData} />;
      case 'simplify': return <SimplifyChallenge data={activeYearData} updateData={updateYearData} />;
      case 'monthlyReset': return <MonthlyReset data={activeYearData} updateData={updateYearData} isPremium={appState.isPremium} userName={appState.userName} />;
      case 'workbook': return <FinancialWorkbook data={activeYearData} updateData={updateYearData} isPremium={appState.isPremium} setView={setCurrentView} />;
      case 'reflections': return <Reflections data={activeYearData} updateData={updateYearData} />;
      default: return <Dashboard data={activeYearData} updateData={updateYearData} setView={setCurrentView} userName={appState.userName} mood={appState.userMood} feeling={appState.userFeeling} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC]">
      <Sidebar 
        currentView={currentView}
        setView={setCurrentView}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeYear={appState.currentYear}
        years={Object.keys(appState.years).map(Number).sort((a,b) => b-a)}
        onYearChange={(year) => setAppState(prev => ({ ...prev, currentYear: year }))}
        onAddYear={handleAddYear}
      />

      <main className={`transition-all duration-300 min-h-screen ${isSidebarOpen ? 'lg:pl-72' : ''} pb-[90px] lg:pb-0`}>
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-[#eee] sticky top-0 z-30">
          <h1 className="text-xl serif font-bold text-[#7B68A6]">Reset & Rebuild</h1>
          {/* Hide Sidebar burger on small screens because we use BottomNav */}
          <div className="w-10" /> 
        </header>

        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-10">
          {renderView()}
        </div>
      </main>

      {/* Bottom Nav for Mobile & Tablet */}
      <div className="lg:hidden">
        <BottomNav 
          currentView={currentView} 
          setView={setCurrentView} 
          onMoreClick={() => setIsMoreSheetOpen(true)}
        />
        <MoreSheet 
          isOpen={isMoreSheetOpen} 
          onClose={() => setIsMoreSheetOpen(false)}
          currentView={currentView}
          setView={setCurrentView}
          activeYear={appState.currentYear}
          years={Object.keys(appState.years).map(Number).sort((a,b) => b-a)}
          onYearChange={(year) => setAppState(prev => ({ ...prev, currentYear: year }))}
          onAddYear={handleAddYear}
        />
      </div>

      <MorningAlignmentModal 
        isOpen={isAlignmentModalOpen}
        onClose={() => setIsAlignmentModalOpen(false)}
        onSave={handleAlignmentSave}
      />
    </div>
  );
};

export default App;
