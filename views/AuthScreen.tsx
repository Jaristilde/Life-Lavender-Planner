
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { LogIn, UserPlus, Apple, Mail, Lock, Eye, EyeOff, Loader2, User } from 'lucide-react';

const ButterflyIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22V8"/><path d="M5 12c-1.5-1.5-2.5-3.5-2-6 2.5-.5 4.5.5 6 2 1.5-1.5 3.5-2.5 6-2 .5 2.5-.5 4.5-2 6"/><path d="M5 20c-1.5-1.5-2.5-3.5-2-6 2.5-.5 4.5.5 6 2 1.5-1.5 3.5-2.5 6-2 .5 2.5-.5 4.5-2 6"/>
  </svg>
);

const AuthScreen: React.FC = () => {
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (view === 'login') {
        await authService.signIn(email, password);
      } else {
        if (password !== confirmPassword) throw new Error("Passwords don't match");
        await authService.signUp(email, password, name);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const socialLogin = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setError(null);
    try {
      if (provider === 'apple') await authService.signInWithApple();
      else await authService.signInWithGoogle();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#7B68A6] via-[#9B8EC4] to-[#B19CD9] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-1000">
        <div className="text-center space-y-4">
          <div className="inline-block p-4 bg-white/10 rounded-[32px] backdrop-blur-md mb-2">
            <ButterflyIcon size={48} className="text-white" />
          </div>
          <h1 className="text-4xl serif font-bold text-white tracking-tight">Lavender Life Planner</h1>
          <p className="text-white/80 italic serif text-lg px-4">"Your life is your biggest project. Plan it beautifully."</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[40px] shadow-2xl space-y-6">
          <div className="flex p-1 bg-white/5 rounded-2xl">
            <button 
              onClick={() => setView('login')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${view === 'login' ? 'bg-white text-[#7B68A6]' : 'text-white/60 hover:text-white'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setView('signup')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${view === 'signup' ? 'bg-white text-[#7B68A6]' : 'text-white/60 hover:text-white'}`}
            >
              Join Us
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'signup' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input 
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/10 rounded-2xl outline-none text-white placeholder:text-white/60 focus:border-white/40 transition-all"
                  placeholder="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input 
                type="email"
                required
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/10 rounded-2xl outline-none text-white placeholder:text-white/60 focus:border-white/40 transition-all"
                placeholder="Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/10 rounded-2xl outline-none text-white placeholder:text-white/60 focus:border-white/40 transition-all"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {view === 'signup' && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/10 rounded-2xl outline-none text-white placeholder:text-white/60 focus:border-white/40 transition-all"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-400/20 border border-red-400/30 rounded-2xl text-red-200 text-xs font-medium text-center animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-[#7B68A6] font-bold rounded-2xl shadow-xl hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : view === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
              {view === 'login' ? 'Sign In to Your Planner' : 'Create My Account'}
            </button>
          </form>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">or continue with</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => socialLogin('apple')}
              className="flex items-center justify-center gap-2 py-4 bg-black text-white rounded-2xl hover:bg-black/80 transition-all text-sm font-bold shadow-lg"
            >
              <Apple size={18} /> Apple
            </button>
            <button 
              onClick={() => socialLogin('google')}
              className="flex items-center justify-center gap-2 py-4 bg-white text-gray-800 rounded-2xl hover:bg-gray-100 transition-all text-sm font-bold shadow-lg"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em] leading-relaxed">
            Secure cloud synchronization enabled.<br/>
            Lifetime Access v1.0.5
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
