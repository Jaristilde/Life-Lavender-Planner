
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import MoreSheet from './components/MoreSheet';
import { YearData } from './types';
import { INITIAL_YEAR_DATA, DEFAULT_DAILY_METRICS } from './constants';
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
import Profile from './views/Profile';
import Chatbot from './views/Chatbot';
import DatabaseExplorer from './views/DatabaseExplorer';
import AuthScreen from './views/AuthScreen';
import SplashScreen from './components/SplashScreen';
import { Cloud, CloudOff, Loader2, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [splashFading, setSplashFading] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  const [activeYearId, setActiveYearId] = useState<string>('');
  const [activeYearData, setActiveYearData] = useState<any>(null);
  const [allYears, setAllYears] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const saveTimeout = useRef<any>(null);
  const splashStart = useRef(Date.now());
  const loadingData = useRef(false);
  const splashFinished = useRef(false);

  const finishSplash = () => {
    if (splashFinished.current) return; // idempotent — only run once
    splashFinished.current = true;

    const elapsed = Date.now() - splashStart.current;
    const minDisplay = 1500;
    const remaining = Math.max(0, minDisplay - elapsed);

    setTimeout(() => {
      setSplashFading(true);
      setTimeout(() => {
        setSplashVisible(false);
        setLoading(false);
      }, 500);
    }, remaining);
  };

  useEffect(() => {
    let mounted = true;

    // Safety net: suppress Supabase internal AbortError (known issue with token refresh race)
    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      if (e.reason?.name === 'AbortError') {
        e.preventDefault();
        console.log('[Auth] Suppressed Supabase internal AbortError');
      }
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Hard absolute timeout — force exit splash after 3 seconds no matter what
    const hardTimeout = setTimeout(() => {
      if (mounted && !splashFinished.current) {
        console.log('[Auth] Hard 3s timeout — forcing splash exit');
        splashFinished.current = true;
        setSplashFading(true);
        setTimeout(() => {
          setSplashVisible(false);
          setLoading(false);
        }, 500);
      }
    }, 3000);

    console.log('[Auth] Setting up onAuthStateChange listener');

    // Single auth source: onAuthStateChange fires INITIAL_SESSION on setup
    const subscription = authService.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('[Auth] Event:', event, '| User:', session?.user?.email || 'none');

      try {
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            setUser(session.user);
            clearTimeout(hardTimeout);
            await loadUserData(session.user.id, mounted);
          } else if (event === 'INITIAL_SESSION') {
            // No session on initial load — show auth screen
            console.log('[Auth] No session found, showing auth screen');
            clearTimeout(hardTimeout);
            finishSplash();
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('[Auth] User signed out');
          setUser(null);
          setProfile(null);
          setActiveYearData(null);
          setLoadError(null);
          clearTimeout(hardTimeout);
          finishSplash();
        }
      } catch (err: any) {
        console.error('[Auth] Handler error:', event, err?.message || err);
        if (mounted) {
          if (err?.name === 'AbortError') {
            console.log('[Auth] AbortError in handler — retrying via fallback');
          } else {
            setLoadError(err?.message || err?.msg || 'Connection error');
          }
          clearTimeout(hardTimeout);
          finishSplash();
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(hardTimeout);
      subscription.unsubscribe();
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const loadUserData = async (userId: string, isMounted: boolean, targetYear?: number) => {
    if (loadingData.current) {
      console.log('[Data] Already loading, skipping duplicate call');
      return;
    }
    loadingData.current = true;
    console.log('[Data] Loading user data for:', userId);
    try {
      console.log('[Data] Fetching profile...');
      const userProfile = await dataService.getProfile(userId);
      if (!isMounted) return;
      setProfile(userProfile);
      console.log('[Data] Profile loaded:', userProfile?.name || 'new user');

      console.log('[Data] Fetching years...');
      const years = await dataService.getAllYears(userId);
      if (!isMounted) return;
      setAllYears(years || []);

      const currentYear = targetYear || new Date().getFullYear();
      console.log('[Data] Fetching year data for', currentYear);
      let dbYear = await dataService.getYearData(userId, currentYear);

      if (!dbYear && isMounted) {
        console.log('[Data] No year found, creating...');
        dbYear = await dataService.createYear(userId, currentYear, INITIAL_YEAR_DATA(currentYear));
      }

      if (!isMounted) return;

      const baseData = INITIAL_YEAR_DATA(currentYear);

      const mergedData = {
        ...baseData,
        ...dbYear,
        financial: { ...baseData.financial, ...(dbYear?.financial_data || {}) },
        wellness: { ...baseData.wellness, ...(dbYear?.wellness_data || {}) },
        workbook: { ...baseData.workbook, ...(dbYear?.workbook_data || {}) },
        monthlyResets: dbYear?.monthly_resets || {},
        visionBoard: { ...baseData.visionBoard, ...(dbYear?.vision_board || {}) },
        simplifyChallenge: (dbYear?.simplify_challenge?.length > 0) ? dbYear.simplify_challenge : baseData.simplifyChallenge,
        reflections: { ...baseData.reflections, ...(dbYear?.reflections || {}) },
        plannerFocus: { ...baseData.plannerFocus, ...(dbYear?.planner || {}) },
        library: dbYear?.library || [],
        dailyMetrics: dbYear?.daily_todos || {}
      };

      // Migration: merge dailyMorningResets into dailyMetrics
      const morningResets = dbYear?.daily_morning_resets;
      if (morningResets && Object.keys(morningResets).length > 0) {
        console.log('[Migration] Merging dailyMorningResets into dailyMetrics');
        const emojiToScore: Record<string, number> = { '😊': 7, '😐': 5, '😔': 3, '💪': 8, '😴': 2 };
        const migratedMetrics = { ...(mergedData.dailyMetrics || {}) };

        for (const [dateKey, reset] of Object.entries(morningResets) as [string, any][]) {
          const existing = migratedMetrics[dateKey] || DEFAULT_DAILY_METRICS(dateKey);
          migratedMetrics[dateKey] = {
            ...existing,
            affirmation_shown: reset.affirmationShown || existing.affirmation_shown || '',
            financial_spending: reset.spending ?? existing.financial_spending ?? 0,
            financial_intention: reset.financialIntention || existing.financial_intention || '',
            financial_gratitude: reset.financialGratitude || existing.financial_gratitude || '',
            top_priorities: (reset.priorities?.length > 0) ? reset.priorities : existing.top_priorities,
            mood_score: emojiToScore[reset.mood] ?? existing.mood_score ?? 5,
            water_intake: reset.waterIntake ?? existing.water_intake ?? 0,
            movement_active: reset.movement ?? existing.movement_active ?? false,
            movement_minutes: reset.movementMinutes ?? existing.movement_minutes ?? 0,
            daily_intention: reset.dailyIntention || existing.daily_intention || '',
          };
        }

        mergedData.dailyMetrics = migratedMetrics;

        // Persist migration: write merged dailyMetrics, clear morning resets
        try {
          await dataService.updateYearField(dbYear.id, 'daily_todos', migratedMetrics);
          await dataService.updateYearField(dbYear.id, 'daily_morning_resets', {});
          console.log('[Migration] Successfully migrated and cleared dailyMorningResets');
        } catch (migErr) {
          console.error('[Migration] Failed to persist migration:', migErr);
        }
      }

      // Remove stale dailyMorningResets from merged data
      delete mergedData.dailyMorningResets;

      setActiveYearId(dbYear.id);
      setActiveYearData(mergedData);
      console.log('[Data] All data loaded successfully');
      finishSplash();
    } catch (err: any) {
      console.error('[Data] Failed to load:', err?.code, err?.message || err?.msg || err);
      if (isMounted) {
        const msg = err?.message || err?.msg || 'Failed to load your data';
        setLoadError(msg);
        finishSplash();
      }
    } finally {
      loadingData.current = false;
    }
  };

  const switchToYear = async (year: number) => {
    if (!user) return;
    loadingData.current = false; // reset so loadUserData can proceed
    await loadUserData(user.id, true, year);
  };

  const handleAddYear = async () => {
    if (!user) return;
    const existingYears = allYears.map(y => y.year);
    const nextYear = existingYears.length > 0 ? Math.max(...existingYears) + 1 : new Date().getFullYear();
    try {
      await dataService.createYear(user.id, nextYear, INITIAL_YEAR_DATA(nextYear));
      // Refresh years list and switch to the new year
      const years = await dataService.getAllYears(user.id);
      setAllYears(years || []);
      await switchToYear(nextYear);
    } catch (err) {
      console.error('[Year] Failed to create year:', err);
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

  if (loading || splashVisible) {
    return <SplashScreen fadingOut={splashFading} />;
  }
  if (!user) return <AuthScreen />;

  if (loadError || (!activeYearData && !loading)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#7B68A6] via-[#9B8EC4] to-[#B19CD9] flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[32px] shadow-2xl max-w-sm w-full text-center space-y-6">
          <div className="text-4xl">🦋</div>
          <h2 className="serif text-2xl font-bold text-white">Connection Issue</h2>
          <p className="text-white/70 text-sm">{loadError || 'Unable to load your data. Please try again.'}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setLoadError(null);
                setLoading(true);
                setSplashVisible(true);
                setSplashFading(false);
                splashStart.current = Date.now();
                loadUserData(user.id, true);
              }}
              className="w-full py-3 bg-white text-[#7B68A6] font-bold rounded-2xl hover:bg-gray-50 transition-all"
            >
              Try Again
            </button>
            <button
              onClick={async () => {
                await authService.signOut();
                setUser(null);
                setProfile(null);
                setActiveYearData(null);
                setLoadError(null);
              }}
              className="w-full py-3 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all text-sm"
            >
              Sign Out & Try Different Account
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          updateData={(d) => {
            if (d.dailyMetrics !== activeYearData.dailyMetrics) updateYearField('daily_todos', d.dailyMetrics);
          }}
          setView={setCurrentView}
          userName={profile?.name || 'Friend'}
          mood={profile?.mood || 'Good'}
          feeling={profile?.feeling || 'Abundance'}
        />;
      case 'morningReset':
        return <MorningReset
          data={activeYearData}
          updateData={(d) => {
            if (d.dailyMetrics !== activeYearData.dailyMetrics) updateYearField('daily_todos', d.dailyMetrics);
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
          updateData={(d) => {
            if (d.plannerFocus !== activeYearData.plannerFocus) updateYearField('planner', d.plannerFocus);
            if (d.dailyMetrics !== activeYearData.dailyMetrics) updateYearField('daily_todos', d.dailyMetrics);
          }}
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
          userId={user.id}
        />;
      case 'profile':
        return <Profile
          profile={profile}
          user={user}
          onUpdateProfile={async (updates) => {
            await dataService.updateProfile(user.id, updates);
            setProfile({ ...profile, ...updates });
          }}
        />;
      case 'database':
        return <DatabaseExplorer userId={user.id} />;
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
        onYearChange={(year) => switchToYear(year)}
        onAddYear={handleAddYear}
        isPremium={profile?.is_premium}
        userName={profile?.name || 'Friend'}
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
          onYearChange={(year) => switchToYear(year)}
          onAddYear={handleAddYear}
          isPremium={profile?.is_premium}
          userName={profile?.name || 'Friend'}
        />
      </div>

      <Chatbot userId={user.id} userName={profile?.name || 'Friend'} />

      <MorningAlignmentModal
        isOpen={false}
        onClose={() => {}}
        onSave={() => {}}
      />
    </div>
  );
};

export default App;
