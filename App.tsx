
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import MoreSheet from './components/MoreSheet';
import { YearData, UserDailyMetrics } from './types';
import { INITIAL_YEAR_DATA } from './constants';
import { authService } from './services/authService';
import { dataService } from './services/dataService';
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
import MorningReset from './views/MorningReset';
import Library from './views/Library';
import About from './views/About';
import AuthScreen from './views/AuthScreen';
import SplashScreen from './components/SplashScreen';
import { Cloud, CloudOff, Loader2, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'lavender_planner_v1_cache';

const App: React.FC = () => {
  // Auth & Profile State
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // App Data State
  const [activeYearId, setActiveYearId] = useState<string>('');
  const [activeYearData, setActiveYearData] = useState<any>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAlignmentModalOpen, setIsAlignmentModalOpen] = useState(false);
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  // Sync Logic
  const saveTimeout = useRef<any>(null);

  // Auth Listener
  useEffect(() => {
    const subscription = authService.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadUserData(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });
    
    authService.getUser().then(user => {
      if (user) {
        setUser(user);
        loadUserData(user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const userProfile = await dataService.getProfile(userId);
      setProfile(userProfile);

      const currentYear = new Date().getFullYear();
      let yearData = await dataService.getYearData(userId, currentYear);

      if (!yearData) {
        yearData = await dataService.createYear(userId, currentYear, INITIAL_YEAR_DATA(currentYear));
      }

      setActiveYearId(yearData.id);
      setActiveYearData(yearData);
      
      // Offline Cache
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId, yearData, profile: userProfile }));
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load data:', err);
      // Fallback to cache if exists
      const cache = localStorage.getItem(STORAGE_KEY);
      if (cache) {
        const parsed = JSON.parse(cache);
        if (parsed.userId === userId) {
          setActiveYearData(parsed.yearData);
          setProfile(parsed.profile);
        }
      }
      setLoading(false);
    }
  };

  const updateYearField = (field: string, value: any) => {
    // 1. Update UI immediately
    setActiveYearData((prev: any) => ({ ...prev, [field]: value }));
    
    // 2. Debounce cloud sync
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    setSaveStatus('saving');
    
    saveTimeout.current = setTimeout(async () => {
      try {
        await dataService.updateYearField(activeYearId, field, value);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err) {
        console.error('Cloud save failed:', err);
        setSaveStatus('error');
      }
    }, 1000);
  };

  if (loading) return <SplashScreen />;
  if (!user) return <AuthScreen />;

  if (profile && !profile.onboarding_completed) {
    return (
      <PremiumOnboarding 
        onComplete={async (data) => {
          const updates = {
            name: data.userName,
            mood: data.userMood,
            feeling: data.userFeeling,
            is_premium: data.isPremium,
            trial_start_date: data.trialStartDate,
            onboarding_completed: true
          };
          await dataService.updateProfile(user.id, updates);
          setProfile({ ...profile, ...updates });
        }} 
      />
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': 
        return <Dashboard 
          data={activeYearData} 
          updateData={(d) => updateYearField('vision_board', d.visionBoard)} // Simplification for dashboard needs
          setView={setCurrentView} 
          userName={profile?.name || ''} 
          mood={profile?.mood || ''} 
          feeling={profile?.feeling || ''} 
        />;
      case 'morningReset': 
        return <MorningReset 
          morningData={activeYearData?.daily_morning_resets} 
          updateMorningData={(val) => updateYearField('daily_morning_resets', val)}
          isPremium={profile?.is_premium} 
          userName={profile?.name || ''} 
          affirmations={activeYearData?.affirmations || []}
          dailyToDos={activeYearData?.daily_todos || []}
          weeklyPriorities={activeYearData?.financial_data?.weeklyPriorities || []}
        />;
      case 'tracking': 
        return <TrackingCenter 
          dailyMetrics={activeYearData?.daily_metrics || {}} 
          updateDailyMetrics={(val) => updateYearField('daily_metrics', val)}
          isArchived={activeYearData?.is_archived}
        />;
      case 'financial': 
        return <FinancialHub 
          financialData={activeYearData?.financial_data} 
          updateFinancialData={(val) => updateYearField('financial_data', val)}
          isPremium={profile?.is_premium} 
          isArchived={activeYearData?.is_archived}
        />;
      case 'wellness': 
        return <WellnessTracker 
          wellnessData={activeYearData?.wellness_data} 
          updateWellnessData={(val) => updateYearField('wellness_data', val)}
        />;
      case 'planner': 
        return <Planner 
          plannerData={activeYearData?.planner} 
          updatePlannerData={(val) => updateYearField('planner', val)}
          isArchived={activeYearData?.is_archived}
          year={activeYearData?.year}
          dailyToDos={activeYearData?.daily_todos || []}
        />;
      case 'vision': 
        return <VisionBoard 
          visionData={activeYearData?.vision_board} 
          updateVisionData={(val) => updateYearField('vision_board', val)}
          year={activeYearData?.year}
        />;
      case 'simplify': 
        return <SimplifyChallenge 
          challengeData={activeYearData?.simplify_challenge} 
          updateChallengeData={(val) => updateYearField('simplify_challenge', val)}
          isArchived={activeYearData?.is_archived}
        />;
      case 'monthlyReset': 
        return <MonthlyReset 
          resetsData={activeYearData?.monthly_resets} 
          updateResetsData={(val) => updateYearField('monthly_resets', val)}
          isPremium={profile?.is_premium} 
          userName={profile?.name || ''} 
          financialData={activeYearData?.financial_data}
          isArchived={activeYearData?.is_archived}
        />;
      case 'workbook': 
        return <FinancialWorkbook 
          workbookData={activeYearData?.workbook_data} 
          updateWorkbookData={(val) => updateYearField('workbook_data', val)}
          isPremium={profile?.is_premium} 
          setView={setCurrentView} 
          isArchived={activeYearData?.is_archived}
          affirmations={activeYearData?.affirmations || []}
          updateAffirmations={(val) => updateYearField('affirmations', val)}
          financialData={activeYearData?.financial_data}
          updateFinancialData={(val) => updateYearField('financial_data', val)}
          dailyToDos={activeYearData?.daily_todos || []}
          updateDailyToDos={(val) => updateYearField('daily_todos', val)}
        />;
      case 'reflections': 
        return <Reflections 
          reflectionsData={activeYearData?.reflections} 
          updateReflectionsData={(val) => updateYearField('reflections', val)}
          isArchived={activeYearData?.is_archived}
          onArchive={() => updateYearField('is_archived', true)}
        />;
      case 'library': 
        return <Library 
          libraryData={activeYearData?.library} 
          updateLibraryData={(val) => updateYearField('library', val)} 
        />;
      case 'about': return <About userName={profile?.name || ''} />;
      default: return <Dashboard data={activeYearData} setView={setCurrentView} userName={profile?.name} mood={profile?.mood} feeling={profile?.feeling} updateData={() => {}} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC]">
      <Sidebar 
        currentView={currentView}
        setView={setCurrentView}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeYear={activeYearData?.year || 2026}
        years={[2026]} // Multi-year support handled by DB query normally
        onYearChange={() => {}}
        onAddYear={() => {}}
      />

      <main className={`transition-all duration-300 min-h-screen ${isSidebarOpen ? 'lg:pl-72' : ''} pb-[90px] lg:pb-0`}>
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-[#eee] sticky top-0 z-30">
          <h1 className="text-xl serif font-bold text-[#7B68A6]">Lavender Life</h1>
          <div className="flex items-center gap-2">
             {saveStatus === 'saving' && <Loader2 size={16} className="text-[#B19CD9] animate-spin" />}
             {saveStatus === 'saved' && <CheckCircle2 size={16} className="text-green-400" />}
             {saveStatus === 'error' && <CloudOff size={16} className="text-red-400" />}
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-10 relative">
          <div className="hidden lg:flex fixed top-6 right-8 z-[60] items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-md rounded-full border border-white/50 text-[10px] font-bold uppercase tracking-widest text-gray-400 shadow-sm">
             {saveStatus === 'idle' && <><Cloud size={14} className="text-gray-300" /> Cloud Synced</>}
             {saveStatus === 'saving' && <><Loader2 size={14} className="text-[#B19CD9] animate-spin" /> Syncing...</>}
             {saveStatus === 'saved' && <><CheckCircle2 size={14} className="text-green-400" /> Changes Saved</>}
             {saveStatus === 'error' && <><CloudOff size={14} className="text-red-400" /> Sync Failed</>}
          </div>
          {renderView()}
        </div>
      </main>

      <div className="lg:hidden">
        <BottomNav currentView={currentView} setView={setCurrentView} onMoreClick={() => setIsMoreSheetOpen(true)} />
        <MoreSheet 
          isOpen={isMoreSheetOpen} 
          onClose={() => setIsMoreSheetOpen(false)}
          currentView={currentView}
          setView={setCurrentView}
          activeYear={activeYearData?.year || 2026}
          years={[2026]}
          onYearChange={() => {}}
          onAddYear={() => {}}
        />
      </div>

      <MorningAlignmentModal 
        isOpen={isAlignmentModalOpen} 
        onClose={() => setIsAlignmentModalOpen(false)} 
        onSave={(metrics) => {
           const today = new Date().toISOString().split('T')[0];
           const newMetrics = { ...activeYearData.daily_metrics, [today]: { ...metrics, morning_alignment_completed: true } };
           updateYearField('daily_metrics', newMetrics);
        }} 
      />
    </div>
  );
};

export default App;
