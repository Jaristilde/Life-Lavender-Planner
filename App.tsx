
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

const CACHE_KEY = 'lavender_planner_v1_cache';

const App: React.FC = () => {
  // Auth & Profile State
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // App Data State
  const [activeYearId, setActiveYearId] = useState<string>('');
  const [activeYearData, setActiveYearData] = useState<any>(null);
  const [allYears, setAllYears] = useState<any[]>([]);
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
        setActiveYearData(null);
        setLoading(false);
      }
    });
    
    authService.getUser().then(async (user) => {
      if (user) {
        setUser(user);
        await loadUserData(user.id);
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

      const years = await dataService.getAllYears(userId);
      setAllYears(years || []);

      const currentYear = new Date().getFullYear();
      let yearData = await dataService.getYearData(userId, currentYear);

      if (!yearData) {
        yearData = await dataService.createYear(userId, currentYear, INITIAL_YEAR_DATA(currentYear));
      }

      setActiveYearId(yearData.id);
      setActiveYearData(yearData);
      
      // Update Offline Cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({ userId, yearData, profile: userProfile }));
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load data:', err);
      // Try to load from cache
      const cache = localStorage.getItem(CACHE_KEY);
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
    // 1. Update UI immediately for responsiveness
    setActiveYearData((prev: any) => ({ ...prev, [field]: value }));
    
    // 2. Debounce cloud sync
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    setSaveStatus('saving');
    
    saveTimeout.current = setTimeout(async () => {
      try {
        if (activeYearId) {
          await dataService.updateYearField(activeYearId, field, value);
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        }
      } catch (err) {
        console.error('Cloud save failed:', err);
        setSaveStatus('error');
      }
    }, 1000);
  };

  const handleSignOut = async () => {
    await authService.signOut();
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
    const yearData = activeYearData;
    if (!yearData) return null;

    switch (currentView) {
      case 'dashboard': 
        return <Dashboard 
          data={{
            ...yearData,
            financial: yearData.financial_data,
            wellness: yearData.wellness_data,
            workbook: yearData.workbook_data,
            visionBoard: yearData.vision_board,
            simplifyChallenge: yearData.simplify_challenge,
            reflections: yearData.reflections,
            blueprint: yearData.workbook_data // Assuming blueprint maps here for now
          }} 
          updateData={() => {}} // Dashboard mainly reads
          setView={setCurrentView} 
          userName={profile?.name || ''} 
          mood={profile?.mood || ''} 
          feeling={profile?.feeling || ''} 
        />;
      case 'morningReset': 
        return <MorningReset 
          data={{
            ...yearData,
            dailyMorningResets: yearData.daily_morning_resets,
            financial: yearData.financial_data,
            wellness: yearData.wellness_data,
            affirmations: yearData.affirmations
          }}
          updateData={(d) => {
            // Mapping back from the older data structure if needed
            if (d.dailyMorningResets !== yearData.daily_morning_resets) updateYearField('daily_morning_resets', d.dailyMorningResets);
            if (d.wellness !== yearData.wellness_data) updateYearField('wellness_data', d.wellness);
          }}
          isPremium={profile?.is_premium} 
          userName={profile?.name || ''} 
        />;
      case 'tracking': 
        return <TrackingCenter 
          data={{
            ...yearData,
            dailyMetrics: yearData.daily_todos || {} // Map daily_todos to dailyMetrics as per existing component logic
          }}
          updateData={(d) => updateYearField('daily_todos', d.dailyMetrics)}
        />;
      case 'financial': 
        return <FinancialHub 
          financialData={yearData.financial_data} 
          updateFinancialData={(val) => updateYearField('financial_data', val)}
          isPremium={profile?.is_premium} 
          isArchived={yearData.is_archived}
        />;
      case 'wellness': 
        return <WellnessTracker 
          data={{
            ...yearData,
            wellness: yearData.wellness_data
          }}
          updateData={(d) => updateYearField('wellness_data', d.wellness)}
        />;
      case 'planner': 
        return <Planner 
          data={{
            ...yearData,
            plannerFocus: yearData.planner,
            wellness: yearData.wellness_data
          }}
          updateData={(d) => {
             if (d.plannerFocus !== yearData.planner) updateYearField('planner', d.plannerFocus);
          }}
          googleSync={{ enabled: false, syncFrequency: 'manual', showEvents: true, isConnected: false }}
          updateGoogleSync={() => {}}
        />;
      case 'vision': 
        return <VisionBoard 
          data={{
            ...yearData,
            visionBoard: yearData.vision_board
          }}
          updateData={(d) => updateYearField('vision_board', d.visionBoard)}
        />;
      case 'simplify': 
        return <SimplifyChallenge 
          data={{
            ...yearData,
            simplifyChallenge: yearData.simplify_challenge
          }}
          updateData={(d) => updateYearField('simplify_challenge', d.simplifyChallenge)}
        />;
      case 'monthlyReset': 
        return <MonthlyReset 
          data={{
            ...yearData,
            monthlyResets: yearData.monthly_resets,
            financial: yearData.financial_data
          }}
          updateData={(d) => updateYearField('monthly_resets', d.monthlyResets)}
          isPremium={profile?.is_premium} 
          userName={profile?.name || ''} 
        />;
      case 'workbook': 
        return <FinancialWorkbook 
          data={{
            ...yearData,
            workbook: yearData.workbook_data,
            financial: yearData.financial_data,
            affirmations: yearData.affirmations,
            wellness: yearData.wellness_data
          }}
          updateData={(d) => {
            if (d.workbook !== yearData.workbook_data) updateYearField('workbook_data', d.workbook);
            if (d.financial !== yearData.financial_data) updateYearField('financial_data', d.financial);
            if (d.affirmations !== yearData.affirmations) updateYearField('affirmations', d.affirmations);
            if (d.wellness !== yearData.wellness_data) updateYearField('wellness_data', d.wellness);
          }}
          isPremium={profile?.is_premium} 
          setView={setCurrentView} 
        />;
      case 'reflections': 
        return <Reflections 
          data={{
            ...yearData,
            reflections: yearData.reflections
          }}
          updateData={(d) => {
            if (d.reflections !== yearData.reflections) updateYearField('reflections', d.reflections);
            if (d.isArchived !== yearData.is_archived) updateYearField('is_archived', d.isArchived);
          }}
        />;
      case 'library': 
        return <Library 
          data={{
            ...yearData,
            library: yearData.library
          }}
          updateData={(d) => updateYearField('library', d.library)} 
        />;
      case 'about': return <About userName={profile?.name || ''} />;
      default: return null;
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
        years={allYears.map(y => y.year)}
        onYearChange={(year) => loadUserData(user.id)} // Basic implementation
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
          years={allYears.map(y => y.year)}
          onYearChange={() => {}}
          onAddYear={() => {}}
        />
      </div>

      <MorningAlignmentModal 
        isOpen={isAlignmentModalOpen} 
        onClose={() => setIsAlignmentModalOpen(false)} 
        onSave={(metrics) => {
           const today = new Date().toISOString().split('T')[0];
           const newMetrics = { ...activeYearData.daily_todos, [today]: { ...metrics, morning_alignment_completed: true } };
           updateYearField('daily_todos', newMetrics);
        }} 
      />
    </div>
  );
};

export default App;
