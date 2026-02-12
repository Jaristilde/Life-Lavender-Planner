
import React, { useState, useEffect, useCallback } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import { YearData, AppState, UserDailyMetrics, BlueprintData } from './types';
import { INITIAL_YEAR_DATA, DEFAULT_DAILY_METRICS } from './constants';
import Dashboard from './views/Dashboard';
import FinancialHub from './views/FinancialHub';
import WellnessTracker from './views/WellnessTracker';
import Planner from './views/Planner';
import VisionBoard from './views/VisionBoard';
import SimplifyChallenge from './views/SimplifyChallenge';
import Reflections from './views/Reflections';
import TrackingCenter from './views/TrackingCenter';
import OnboardingBlueprint from './views/OnboardingBlueprint';
import MorningAlignmentModal from './components/MorningAlignmentModal';

const STORAGE_KEY = 'lavender_planner_v1';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
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
      }
    };
  });

  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAlignmentModalOpen, setIsAlignmentModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, [appState]);

  const activeYearData = appState.years[appState.currentYear];

  // Check for morning alignment on load (only if onboarding is done)
  useEffect(() => {
    if (activeYearData?.blueprint?.completed) {
      const today = new Date().toISOString().split('T')[0];
      const todayMetrics = activeYearData.dailyMetrics[today];
      if (!todayMetrics || !todayMetrics.morning_alignment_completed) {
        setIsAlignmentModalOpen(true);
      }
    }
  }, [activeYearData]);

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

  const handleBlueprintComplete = (blueprint: BlueprintData) => {
    updateYearData({
      ...activeYearData,
      blueprint
    });
  };

  // If blueprint isn't completed, force the onboarding view
  if (activeYearData && !activeYearData.blueprint.completed) {
    return <OnboardingBlueprint onComplete={handleBlueprintComplete} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard data={activeYearData} updateData={updateYearData} />;
      case 'tracking': return <TrackingCenter data={activeYearData} updateData={updateYearData} />;
      case 'financial': return <FinancialHub data={activeYearData} updateData={updateYearData} isPremium={appState.isPremium} />;
      case 'wellness': return <WellnessTracker data={activeYearData} updateData={updateYearData} />;
      case 'planner': return <Planner data={activeYearData} updateData={updateYearData} googleSync={appState.googleSync} updateGoogleSync={updateGoogleSync} />;
      case 'vision': return <VisionBoard data={activeYearData} updateData={updateYearData} />;
      case 'simplify': return <SimplifyChallenge data={activeYearData} updateData={updateYearData} />;
      case 'reflections': return <Reflections data={activeYearData} updateData={updateYearData} />;
      default: return <Dashboard data={activeYearData} updateData={updateYearData} />;
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

      <main className={`transition-all duration-300 min-h-screen ${isSidebarOpen ? 'lg:pl-72' : ''}`}>
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-[#eee] sticky top-0 z-30">
          <h1 className="text-xl serif font-bold text-[#7B68A6]">Reset & Rebuild</h1>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-[#7B68A6]">
            <Menu size={24} />
          </button>
        </header>

        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-10">
          {renderView()}
        </div>
      </main>

      <MorningAlignmentModal 
        isOpen={isAlignmentModalOpen}
        onClose={() => setIsAlignmentModalOpen(false)}
        onSave={handleAlignmentSave}
      />
    </div>
  );
};

export default App;
