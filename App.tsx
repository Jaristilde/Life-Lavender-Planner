
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import MoreSheet from './components/MoreSheet';
import { YearData } from './types';
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

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeYearId, setActiveYearId] = useState<string>('');
  const [activeYearData, setActiveYearData] = useState<any>(null);
  const [allYears, setAllYears] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  
  const saveTimeout = useRef<any>(null);
  const authChecked = useRef(false);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // Security: Add a global timeout to prevent infinite splash screen
      const timeout = setTimeout(() => {
        if (mounted && loading) setLoading(false);
      }, 5000);

      try {
        const currentUser = await authService.getUser();
        if (!mounted) return;

        if (currentUser) {
          setUser(currentUser);
          await loadUserData(currentUser.id, mounted);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth init failed:", err);
        if (mounted) setLoading(false);
      } finally {
        clearTimeout(timeout);
      }
    };

    if (!authChecked.current) {
      authChecked.current = true;
      initAuth();
    }

    const subscription = authService.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        await loadUserData(session.user.id, mounted);
      } else {
        setUser(null);
        setProfile(null);
        setActiveYearData(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (userId: string, isMounted: boolean) => {
    try {
      const userProfile = await dataService.getProfile(userId);
      if (!isMounted) return;
      setProfile(userProfile);

      const years = await dataService.getAllYears(userId);
      if (!isMounted) return;
      setAllYears(years || []);

      const currentYear = new Date().getFullYear();
      let dbYear = await dataService.getYearData(userId, currentYear);

      if (!dbYear && isMounted) {
        dbYear = await dataService.createYear(userId, currentYear, INITIAL_YEAR_DATA(currentYear));
      }

      if (!isMounted) return;

      const baseData = INITIAL_YEAR_DATA(currentYear);
      
      // Robust Deep Merge to prevent "undefined reading 0" crashes
      const mergedData = {
        ...baseData,
        ...dbYear,
        financial: { ...baseData.financial, ...(dbYear?.financial_data || {}) },
        wellness: { ...baseData.wellness, ...(dbYear?.wellness_data || {}) },
        workbook: { ...baseData.workbook, ...(dbYear?.workbook_data || {}) },
        monthlyResets: dbYear?.monthly_resets || {},
        dailyMorningResets: dbYear?.daily_morning_resets || {},
        visionBoard: { ...baseData.visionBoard, ...(dbYear?.vision_board || {}) },
        simplifyChallenge: (dbYear?.simplify_challenge?.length > 0) ? dbYear.simplify_challenge : baseData.simplifyChallenge,
        reflections: { ...baseData.reflections, ...(dbYear?.reflections || {}) },
        plannerFocus: { ...baseData.plannerFocus, ...(dbYear?.planner || {}) },
        library: dbYear?.library || [],
        dailyMetrics: dbYear?.daily_todos || {}
      };

      setActiveYearId(dbYear.id);
      setActiveYearData(mergedData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load data:', err);
      if (isMounted) setLoading(false);
    }
  };

  const updateYearField = (field: string, value: any) => {
    setActiveYearData((prev: any) => {
      if (!prev) return prev;
      const keyMap: Record<string, string> = {
        'financial_data': 'financial',
        'wellness_data': 'wellness',
        'workbook_data': 'workbook',
        'monthly_resets': 'monthlyResets',
        'daily_morning_resets': 'dailyMorningResets',
        'vision_board': 'visionBoard',
        'simplify_challenge': 'simplifyChallenge',
        'reflections': 'reflections',
        'planner': 'plannerFocus',
        'library': 'library',
        'daily_todos': 'dailyMetrics'
      };
      
      const componentKey = keyMap[field];
      if (componentKey) {
        return { ...prev, [field]: value, [componentKey]: value };
      }
      return { ...prev, [field]: value };
    });
    
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
    if (!activeYearData) return null;

    switch (currentView) {
      case 'dashboard': 
        return <Dashboard 
          data={activeYearData} 
          updateData={() => {}} 
          setView={setCurrentView} 
          userName={profile?.name || 'Friend'} 
          mood={profile?.mood || 'Good'} 
          feeling={profile?.feeling || 'Abundance'} 
        />;
      case 'morningReset': 
        return <MorningReset 
          data={activeYearData}
          updateData={(d) => {
            if (d.dailyMorningResets !== activeYearData.dailyMorningResets) updateYearField('daily_morning_resets', d.dailyMorningResets);
            if (d.wellness !== activeYearData.wellness) updateYearField('wellness_data', d.wellness);
          }}
          isPremium={profile?.is_premium} 
          userName={profile?.name || 'Friend'} 
        />;
      case 'tracking': 
        return <TrackingCenter 
          data={activeYearData}
          updateData={(d) => updateYearField('daily_todos', d.dailyMetrics)}
        />;
      case 'financial': 
        return <FinancialHub 
          financialData={activeYearData.financial} 
          updateFinancialData={(val) => updateYearField('financial_data', val)}
          isPremium={profile?.is_premium} 
          isArchived={activeYearData.isArchived}
        />;
      case 'wellness': 
        return <WellnessTracker 
          data={activeYearData}
          updateData={(d) => updateYearField('wellness_data', d.wellness)}
        />;
      case 'planner': 
        return <Planner 
          data={activeYearData}
          updateData={(d) => updateYearField('planner', d.plannerFocus)}
          googleSync={{ enabled: false, syncFrequency: 'manual', showEvents: true, isConnected: false }}
          updateGoogleSync={() => {}}
        />;
      case 'vision': 
        return <VisionBoard 
          data={activeYearData}
          updateData={(d) => updateYearField('vision_board', d.visionBoard)}
        />;
      case 'simplify': 
        return <SimplifyChallenge 
          data={activeYearData}
          updateData={(d) => updateYearField('simplify_challenge', d.simplifyChallenge)}
        />;
      case 'monthlyReset': 
        return <MonthlyReset 
          data={activeYearData}
          updateData={(d) => updateYearField('monthly_resets', d.monthlyResets)}
          isPremium={profile?.is_premium} 
          userName={profile?.name || 'Friend'} 
        />;
      case 'workbook': 
        return <FinancialWorkbook 
          data={activeYearData}
          updateData={(d) => {
            if (d.workbook !== activeYearData.workbook) updateYearField('workbook_data', d.workbook);
            if (d.financial !== activeYearData.financial) updateYearField('financial_data', d.financial);
            if (d.affirmations !== activeYearData.affirmations) updateYearField('affirmations', d.affirmations);
            if (d.wellness !== activeYearData.wellness) updateYearField('wellness_data', d.wellness);
          }}
          isPremium={profile?.is_premium} 
          setView={setCurrentView} 
        />;
      case 'reflections': 
        return <Reflections 
          data={activeYearData}
          updateData={(d) => {
            if (d.reflections !== activeYearData.reflections) updateYearField('reflections', d.reflections);
            if (d.isArchived !== activeYearData.isArchived) updateYearField('is_archived', d.isArchived);
          }}
        />;
      case 'library': 
        return <Library 
          data={activeYearData}
          updateData={(d) => updateYearField('library', d.library)} 
        />;
      case 'about': return <About userName={profile?.name || 'Friend'} />;
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
        activeYear={activeYearData?.year || new Date().getFullYear()}
        years={allYears.map(y => y.year)}
        onYearChange={(year) => loadUserData(user.id, true)}
        onAddYear={() => {}}
      />

      <main className={`transition-all duration-300 min-h-screen ${isSidebarOpen ? 'lg:pl-72' : ''} pb-[90px] lg:pb-0`}>
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-[#eee] sticky top-0 z-30">
          <h1 className="text-xl serif font-bold text-[#7B68A6]">Lavender Life Planner</h1>
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
          activeYear={activeYearData?.year || new Date().getFullYear()}
          years={allYears.map(y => y.year)}
          onYearChange={() => {}}
          onAddYear={() => {}}
        />
      </div>

      <MorningAlignmentModal 
        isOpen={false} 
        onClose={() => {}} 
        onSave={() => {}} 
      />
    </div>
  );
};

export default App;
