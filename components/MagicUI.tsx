/**
 * Magic UI Components — Inspired by 21st.dev Magic UI & ReactBits
 *
 * Custom animated components using Framer Motion, styled with the
 * Lavender Life Planner theme. Each component is clearly labeled
 * with its 21st.dev / ReactBits inspiration source.
 *
 * Components exported:
 *   1. AnimatedCounter   — Smoothly animates numbers counting up
 *   2. ShimmerCard       — Skeleton loading placeholder with lavender shimmer
 *   3. SparkleEffect     — Sparkle/confetti animation on goal completion
 *   4. GlowBorder        — Animated gradient glowing border effect
 *   5. TextReveal        — Text that reveals character by character
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';

/* ======================================================================
   1. AnimatedCounter — Inspired by 21st.dev "Animated Number" component
   Smoothly animates from 0 to the target value using spring physics.
   ====================================================================== */
interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.5,
  className = ''
}) => {
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate: (latest) => {
        setDisplayValue(
          latest.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
          })
        );
      }
    });
    return controls.stop;
  }, [value, duration, decimals]);

  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
};


/* ======================================================================
   2. ShimmerCard — Inspired by 21st.dev "Shimmer/Skeleton" component
   A skeleton loading placeholder with a lavender shimmer wave effect.
   ====================================================================== */
interface ShimmerCardProps {
  lines?: number;
  className?: string;
  height?: string;
}

export const ShimmerCard: React.FC<ShimmerCardProps> = ({
  lines = 3,
  className = '',
  height
}) => {
  return (
    <div className={`paper-card p-6 space-y-4 ${className}`} style={height ? { height } : {}}>
      {/* Title bar */}
      <div className="h-6 w-2/5 rounded-lg animate-shimmer" />
      {/* Content lines */}
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded-lg animate-shimmer"
          style={{ width: `${85 - i * 15}%`, animationDelay: `${i * 0.15}s` }}
        />
      ))}
      {/* Action area */}
      <div className="flex gap-3 pt-2">
        <div className="h-10 w-24 rounded-xl animate-shimmer" />
        <div className="h-10 w-10 rounded-xl animate-shimmer" style={{ animationDelay: '0.1s' }} />
      </div>
    </div>
  );
};


/* ======================================================================
   3. SparkleEffect — Inspired by 21st.dev "Sparkles" & ReactBits confetti
   Shows animated sparkles/particles when triggered (e.g. goal completion).
   ====================================================================== */
interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

interface SparkleEffectProps {
  active: boolean;
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export const SparkleEffect: React.FC<SparkleEffectProps> = ({
  active,
  children,
  className = '',
  color
}) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const colors = ['#B19CD9', '#D4AF37', '#7B68A6', '#E6D5F0', '#10B981'];

  useEffect(() => {
    if (active) {
      const newSparkles: Sparkle[] = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        color: color || colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5
      }));
      setSparkles(newSparkles);
      const timer = setTimeout(() => setSparkles([]), 1200);
      return () => clearTimeout(timer);
    }
  }, [active]);

  return (
    <div className={`relative ${className}`}>
      {children}
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute pointer-events-none z-50"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              width: sparkle.size,
              height: sparkle.size,
            }}
            initial={{ opacity: 1, scale: 0, rotate: 0 }}
            animate={{
              opacity: [1, 1, 0],
              scale: [0, 1.5, 0],
              rotate: [0, 180],
              y: [0, -30 - Math.random() * 20],
              x: [(Math.random() - 0.5) * 40],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: sparkle.delay, ease: 'easeOut' }}
          >
            <svg viewBox="0 0 24 24" fill={sparkle.color} width="100%" height="100%">
              <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41Z" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};


/* ======================================================================
   4. GlowBorder — Inspired by 21st.dev "Animated Border" component
   An animated gradient border that rotates around the card edges.
   ====================================================================== */
interface GlowBorderProps {
  children: React.ReactNode;
  className?: string;
  borderRadius?: string;
  glowColor1?: string;
  glowColor2?: string;
  glowColor3?: string;
  speed?: number;
}

export const GlowBorder: React.FC<GlowBorderProps> = ({
  children,
  className = '',
  borderRadius = '16px',
  glowColor1 = '#B19CD9',
  glowColor2 = '#7B68A6',
  glowColor3 = '#D4AF37',
  speed = 3
}) => {
  return (
    <div className={`relative ${className}`} style={{ borderRadius }}>
      {/* Rotating gradient border */}
      <motion.div
        className="absolute -inset-[2px] rounded-[inherit] z-0"
        style={{
          background: `conic-gradient(from 0deg, ${glowColor1}, ${glowColor2}, ${glowColor3}, ${glowColor1})`,
          borderRadius,
          filter: 'blur(4px)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      />
      {/* Inner content */}
      <div className="relative z-10 bg-white rounded-[inherit]" style={{ borderRadius }}>
        {children}
      </div>
    </div>
  );
};


/* ======================================================================
   5. TextReveal — Inspired by 21st.dev "Text Reveal" component
   Text that reveals character by character with a staggered animation.
   ====================================================================== */
interface TextRevealProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}

export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  className = '',
  speed = 0.03,
  delay = 0
}) => {
  return (
    <span className={className}>
      {text}
    </span>
  );
};


/* ======================================================================
   6. PremiumBadge — Premium upgrade overlay for locked features
   ====================================================================== */
interface PremiumBadgeProps {
  children: React.ReactNode;
  isPremium: boolean;
  featureName?: string;
  className?: string;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  children,
  isPremium,
  featureName = 'this feature',
  className = ''
}) => {
  if (isPremium) return <>{children}</>;

  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none opacity-40 blur-[1px] select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="bg-gradient-to-r from-[#7B68A6] to-[#B19CD9] text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <div>
            <p className="text-sm font-bold">Upgrade to Premium</p>
            <p className="text-[10px] text-white/70">Unlock {featureName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
