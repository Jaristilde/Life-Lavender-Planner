import React, { useState } from 'react';
import { User, Mail, DollarSign, Bell, Save, CheckCircle2, Loader2, Shield, Download, FileText, Printer, LogOut } from 'lucide-react';
import ButterflyIcon from '../components/ButterflyIcon';
import MicButton from '../components/MicButton';
import { authService } from '../services/authService';

interface ProfileProps {
  profile: any;
  user: any;
  allYears: any[];
  activeYearData: any;
  onUpdateProfile: (updates: any) => Promise<void>;
  onImportData: (data: any) => Promise<void>;
}

const Profile: React.FC<ProfileProps> = ({ profile, user, allYears, activeYearData, onUpdateProfile, onImportData }) => {
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [currency, setCurrency] = useState(profile?.currency || 'USD');
  const [financialGoalSummary, setFinancialGoalSummary] = useState(profile?.financial_goal_summary || '');
  const [notifications, setNotifications] = useState(
    profile?.notification_preferences || { email: true, push: false, weekly_summary: true }
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isPremium = profile?.is_premium;
  const avatarUrl = user?.user_metadata?.avatar_url || profile?.avatar_url || null;
  const email = user?.email || '';

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateProfile({
        name,
        bio,
        currency,
        financial_goal_summary: financialGoalSummary,
        notification_preferences: notifications,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
    setSaving(false);
  };

  const handleExportJSON = () => {
    const exportData = {
      _meta: {
        app: 'Lavender Life Planner',
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        exportedBy: email,
      },
      profile: {
        name: profile?.name,
        bio: profile?.bio,
        currency: profile?.currency,
        financial_goal_summary: profile?.financial_goal_summary,
        notification_preferences: profile?.notification_preferences,
        is_premium: profile?.is_premium,
      },
      years: allYears.map(y => ({
        year: y.year,
        data: {
          financial: y.financial_data,
          wellness: y.wellness_data,
          workbook: y.workbook_data,
          monthlyResets: y.monthly_resets,
          visionBoard: y.vision_board,
          simplifyChallenge: y.simplify_challenge,
          reflections: y.reflections,
          plannerFocus: y.planner,
          library: y.library,
          dailyMetrics: y.daily_todos,
        }
      })),
      activeYearSnapshot: activeYearData ? {
        year: activeYearData.year,
        financial: activeYearData.financial,
        wellness: activeYearData.wellness,
        visionBoard: activeYearData.visionBoard,
        dailyMetrics: activeYearData.dailyMetrics,
        plannerFocus: activeYearData.plannerFocus,
        reflections: activeYearData.reflections,
      } : null,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lavender-planner-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <header>
        <h1 className="text-4xl font-bold serif text-[#7B68A6] mb-1">My Profile</h1>
        <p className="text-gray-500 italic">Manage your account and preferences</p>
      </header>

      {/* Avatar & Plan Badge */}
      <div className="paper-card p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-[#E6D5F0] shadow-lg" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#B19CD9] to-[#7B68A6] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {(name || 'U')[0].toUpperCase()}
            </div>
          )}
          {isPremium && (
            <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] p-1.5 rounded-full shadow-md">
              <ButterflyIcon size={14} className="text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-800">{name || 'Your Name'}</h2>
          <p className="text-gray-400 text-sm">{email}</p>
          <div className={`inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full text-xs font-bold ${
            isPremium
              ? 'bg-gradient-to-r from-[#D4AF37]/20 to-[#B19CD9]/20 text-[#D4AF37] border border-[#D4AF37]/30'
              : 'bg-[#F8F7FC] text-[#7B68A6] border border-[#E6D5F0]'
          }`}>
            {isPremium ? <ButterflyIcon size={14} /> : <Shield size={14} />}
            {isPremium ? 'Premium Plan' : 'Free Plan'}
          </div>
        </div>
      </div>

      {/* Editable Fields */}
      <div className="paper-card p-8 space-y-6">
        <h3 className="text-lg font-bold text-[#7B68A6] flex items-center gap-2">
          <User size={20} /> Personal Info
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Full Name</label>
            <input
              type="text"
              className="w-full bg-[#F8F7FC] border border-[#E6D5F0] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#B19CD9] font-medium"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input
                type="email"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none text-gray-400 cursor-not-allowed"
                value={email}
                readOnly
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed here</p>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Bio / About Me</label>
            <div className="relative">
              <textarea
                className="w-full bg-[#F8F7FC] border border-[#E6D5F0] rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#B19CD9] resize-none h-24"
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell us a little about yourself..."
              />
              <div className="absolute right-3 top-3">
                <MicButton onTranscript={(text) => setBio(prev => prev ? prev + ' ' + text : text)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Preferences */}
      <div className="paper-card p-8 space-y-6">
        <h3 className="text-lg font-bold text-[#7B68A6] flex items-center gap-2">
          <DollarSign size={20} /> Financial Preferences
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Currency</label>
            <select
              className="w-full bg-[#F8F7FC] border border-[#E6D5F0] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#B19CD9] font-medium"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code}>{c.symbol} {c.name} ({c.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Financial Goal Summary</label>
            <div className="relative">
              <textarea
                className="w-full bg-[#F8F7FC] border border-[#E6D5F0] rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#B19CD9] resize-none h-24"
                value={financialGoalSummary}
                onChange={e => setFinancialGoalSummary(e.target.value)}
                placeholder="e.g., Save $10k for emergency fund, pay off student loans by 2027..."
              />
              <div className="absolute right-3 top-3">
                <MicButton onTranscript={(text) => setFinancialGoalSummary(prev => prev ? prev + ' ' + text : text)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="paper-card p-8 space-y-6">
        <h3 className="text-lg font-bold text-[#7B68A6] flex items-center gap-2">
          <Bell size={20} /> Notifications
        </h3>

        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive email reminders and updates' },
            { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications for daily reminders' },
            { key: 'weekly_summary', label: 'Weekly Summary', desc: 'Get a weekly email with your progress summary' },
          ].map(pref => (
            <div key={pref.key} className="flex items-center justify-between p-4 bg-[#F8F7FC] rounded-xl">
              <div>
                <p className="text-sm font-bold text-gray-700">{pref.label}</p>
                <p className="text-xs text-gray-400">{pref.desc}</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, [pref.key]: !notifications[pref.key] })}
                className={`w-12 h-7 rounded-full transition-all ${notifications[pref.key] ? 'bg-[#B19CD9]' : 'bg-gray-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${notifications[pref.key] ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data Export */}
      <div className="paper-card p-8 space-y-6">
        <h3 className="text-lg font-bold text-[#7B68A6] flex items-center gap-2">
          <FileText size={20} /> Export Data
        </h3>
        <p className="text-sm text-gray-500 italic">
          Your data belongs to you. Export regularly to keep a personal backup.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportJSON}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-[#F8F7FC] border-2 border-[#E6D5F0] rounded-2xl hover:border-[#B19CD9] hover:bg-[#E6D5F0]/30 transition-all group"
          >
            <Download size={20} className="text-[#B19CD9] group-hover:text-[#7B68A6] transition-colors" />
            <div className="text-left">
              <p className="text-sm font-bold text-gray-700">Download Backup</p>
              <p className="text-[10px] text-gray-400">Full data backup as JSON</p>
            </div>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-[#F8F7FC] border-2 border-[#E6D5F0] rounded-2xl hover:border-[#B19CD9] hover:bg-[#E6D5F0]/30 transition-all group"
          >
            <Printer size={20} className="text-[#B19CD9] group-hover:text-[#7B68A6] transition-colors" />
            <div className="text-left">
              <p className="text-sm font-bold text-gray-700">Download as PDF</p>
              <p className="text-[10px] text-gray-400">Print-friendly summary view</p>
            </div>
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-[#7B68A6] text-white font-bold rounded-2xl hover:bg-[#B19CD9] transition-all shadow-lg disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Sign Out */}
      <div className="pt-4 border-t border-[#eee]">
        <button
          onClick={async () => {
            await authService.signOut();
          }}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-50 border border-red-200 text-red-500 font-bold rounded-2xl hover:bg-red-100 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
