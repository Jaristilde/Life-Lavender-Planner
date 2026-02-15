
import React from 'react';
import { Info, ExternalLink, Mail, ShieldCheck, FileText } from 'lucide-react';

const ButterflyIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22V8"/>
    <path d="M5 12c-1.5-1.5-2.5-3.5-2-6 2.5-.5 4.5.5 6 2 1.5-1.5 3.5-2.5 6-2 .5 2.5-.5 4.5-2 6"/>
    <path d="M5 20c-1.5-1.5-2.5-3.5-2-6 2.5-.5 4.5.5 6 2 1.5-1.5 3.5-2.5 6-2 .5 2.5-.5 4.5-2 6"/>
  </svg>
);

interface AboutProps {
  userName: string;
}

const About: React.FC<AboutProps> = ({ userName }) => {
  const frameworkSteps = [
    { emoji: '🎯', label: 'Vision', feature: 'Vision Board' },
    { emoji: '📌', label: 'Goals', feature: 'Financial Goals & Intentions' },
    { emoji: '📅', label: 'Plan', feature: 'Monthly / Weekly / Daily Planner' },
    { emoji: '✅', label: 'Execute', feature: 'To-Do Lists & Morning Money Reset' },
    { emoji: '📊', label: 'Track', feature: 'Financial Hub, Wellness & Habit Tracking' },
    { emoji: '🪞', label: 'Reflect', feature: 'Monthly Reset, Reflections & 30-Day Snapshot' },
    { emoji: '🔄', label: 'Repeat', feature: 'Archive year, set new goals, grow' },
  ];

  return (
    <div className="flex-1 bg-white pb-20">
      {/* Header Section */}
      <div className="w-full bg-gradient-to-b from-[#7B68A6] via-[#9B8EC4] to-[#B19CD9] pt-20 pb-24 px-6 text-center">
        <div className="flex justify-center mb-8">
          <ButterflyIcon size={64} className="text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl serif font-bold text-white mb-4">Lavender Life Planner</h1>
        <p className="text-xl md:text-2xl text-white/80 italic serif max-w-2xl mx-auto">
          "Your life is your biggest project. Plan it beautifully."
        </p>
      </div>

      {/* Story Section */}
      <div className="max-w-2xl mx-auto px-6 -mt-12">
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl border border-[#F0F0F0]">
          <h2 className="text-3xl serif font-bold text-[#7B68A6] mb-8">Why I Built This</h2>
          
          <div className="space-y-6 text-[#2D2D2D] leading-[1.8] text-lg">
            <p>I'm a project manager by trade. It's not just what I do — it's how I see the world.</p>
            
            <p>Most people think project management is about Gantt charts and deadlines. But at its core, it's a discipline — a way of thinking that can be applied to any part of your life. Whether you're planning your career, managing your finances, raising a family, or yes, even washing the dishes — there's a system that makes it easier.</p>
            
            <p>People in my life have always called me "the organized one." But the truth is, I'm not naturally more organized than anyone else. I just learned how to plan my work and track my tasks. That's it. And once I saw how much clarity and peace that brought to my professional life, I thought — why aren't we doing this for our personal lives too?</p>
            
            <p>That's why I created the Lavender Life Planner.</p>
            
            <p>I got tired of buying a new financial journal every January, taping vision board cutouts to my wall, scattering affirmations across three different notebooks, and tracking my habits in yet another app. I needed everything in one place — beautiful, intentional, and designed the way I'd manage any project:</p>
            
            <p className="font-bold text-[#7B68A6] italic text-center py-4">
              Set the vision. Define the goals. Plan the work. Execute daily. Track your progress. Reflect and adjust. Repeat.
            </p>
            
            <p>This app is built on that framework. Your finances, wellness, daily planning, goals, affirmations, and reflections all live together — because your life isn't a collection of disconnected tasks. It's one beautiful, evolving project. And you deserve a tool that treats it that way.</p>
            
            <p>Welcome to your planner. Let's build something amazing.</p>
          </div>
        </div>
      </div>

      {/* PM Framework Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 text-center mb-12">The PM Framework for Living</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {frameworkSteps.map((step, i) => (
            <div 
              key={i} 
              className={`p-6 rounded-2xl bg-[#F8F7FC] border-l-4 border-[#B19CD9] shadow-sm hover:shadow-md transition-shadow ${i === 6 ? 'lg:col-span-3' : ''}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl" role="img" aria-label={step.label}>{step.emoji}</span>
                <span className="font-bold text-gray-800">{step.label}</span>
              </div>
              <p className="text-sm text-[#7B68A6] font-medium">{step.feature}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <footer className="max-w-2xl mx-auto px-6 pt-10 border-t border-[#F0F0F0] text-center">
        <p className="text-sm text-gray-500 italic mb-8">
          Made with intention by a project manager who believes your life deserves the same care as any project.
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 mb-8 text-xs font-bold text-[#7B68A6] uppercase tracking-widest">
          <a href="#" className="hover:text-[#B19CD9] flex items-center gap-1"><ShieldCheck size={14}/> Privacy Policy</a>
          <a href="#" className="hover:text-[#B19CD9] flex items-center gap-1"><FileText size={14}/> Terms of Service</a>
          <a href="#" className="hover:text-[#B19CD9] flex items-center gap-1"><Mail size={14}/> Contact</a>
        </div>
        
        <div className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em] space-y-2">
          <p>Lavender Life Planner • v1.0.4</p>
          <p className="text-[#B19CD9]">www.lavenderlifeplanner.com</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
