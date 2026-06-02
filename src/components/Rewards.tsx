/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RewardBadge } from '../types';
import { BADGES_DATABASE } from '../data';
import { Award, Sparkles, Droplet, Dumbbell, Flame, CheckCircle, Search, HelpCircle } from 'lucide-react';

interface RewardsProps {
  totalPoints: number;
  streakCount: number;
  workoutCompleted: boolean;
  waterCompleted: boolean;
  dietCompleted: boolean;
}

export default function Rewards({
  totalPoints = 0,
  streakCount = 0,
  workoutCompleted = false,
  waterCompleted = false,
  dietCompleted = false,
}: RewardsProps) {

  // Dynamically compute showing earned vs unearned badges
  const dynamicBadges = React.useMemo(() => {
    return BADGES_DATABASE.map((badge) => {
      let isUnlocked = false;
      let unlockedAt = '';

      if (badge.id === 'badge_first_log') {
        // Welcomed user gets badge 1 automatic
        isUnlocked = true;
        unlockedAt = 'Unlocked Onboard';
      } else if (badge.id === 'badge_water_champ') {
        isUnlocked = waterCompleted;
        unlockedAt = 'Unlocked Today';
      } else if (badge.id === 'badge_streak_3') {
        isUnlocked = streakCount >= 3;
        unlockedAt = streakCount >= 3 ? 'Unlocked Streaking' : '';
      } else if (badge.id === 'badge_workout_beast') {
        isUnlocked = workoutCompleted;
        unlockedAt = workoutCompleted ? 'Unlocked Gym check-in' : '';
      } else if (badge.id === 'badge_tracker_pro') {
        isUnlocked = dietCompleted;
        unlockedAt = dietCompleted ? 'Unlocked Diet checks' : '';
      }

      return {
        ...badge,
        unlockedAt: isUnlocked ? unlockedAt || 'Unlocked' : undefined,
      };
    });
  }, [waterCompleted, streakCount, workoutCompleted, dietCompleted]);

  const unlockedCount = dynamicBadges.filter((b) => b.unlockedAt).length;

  const renderBadgeIcon = (iconName: string, active: boolean) => {
    const color = active ? 'text-lime-600 dark:text-lime-400' : 'text-zinc-300 dark:text-zinc-700';
    switch (iconName) {
      case 'Droplet':
        return <Droplet className={`w-5 h-5 ${color} ${active ? 'fill-current text-blue-500' : ''}`} />;
      case 'Dumbbell':
        return <Dumbbell className={`w-5 h-5 ${color}`} />;
      case 'Flame':
        return <Flame className={`w-5 h-5 ${color} ${active ? 'fill-current text-amber-500' : ''}`} />;
      case 'Search':
        return <Search className={`w-5 h-5 ${color}`} />;
      default:
        return <Sparkles className={`w-5 h-5 ${color}`} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 pb-12 font-sans bg-zinc-50 dark:bg-zinc-950">
      
      {/* Dynamic Milestones summary */}
      <div className="bg-gradient-to-r from-emerald-600 to-lime-500 p-5 rounded-3xl text-zinc-950 dark:text-zinc-950 shadow-md">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#1c1917] bg-white/30 px-2.5 py-0.5 rounded-full">
            Fit Progress Rank
          </span>
          <span className="text-xs font-black text-emerald-950 flex items-center gap-1">
             {unlockedCount} / {dynamicBadges.length} Trophies
          </span>
        </div>
        <h2 className="text-xl font-black mt-3 leading-none">Your Gym Rewards Locker</h2>
        
        {/* Physical Stats bar */}
        <div className="grid grid-cols-2 gap-4 mt-4 border-t border-white/10 pt-4 text-center">
          <div>
            <span className="text-[10px] text-zinc-300 uppercase tracking-widest block font-mono">Accumulated Points</span>
            <span className="text-xl font-black font-mono text-amber-300">{totalPoints} <span className="text-xs font-normal">XP</span></span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-300 uppercase tracking-widest block font-mono">Active Streak</span>
            <span className="text-xl font-black font-mono text-emerald-350">{streakCount} <span className="text-xs font-normal">Days</span></span>
          </div>
        </div>
      </div>

      {/* Badges database representation list */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-4 shadow-xs">
        <span className="text-[10px] uppercase font-black text-zinc-400 tracking-wider mb-3.5 block">
          Achievements & Physical Milestones
        </span>

        <div className="flex flex-col gap-3">
          {dynamicBadges.map((badge) => {
            const isUnlocked = !!badge.unlockedAt;
            return (
              <div
                key={badge.id}
                className={`flex gap-3.5 items-center p-3 rounded-2xl border transition duration-200 ${
                  isUnlocked
                    ? 'bg-lime-50/10 border-lime-150 dark:bg-zinc-850 dark:border-lime-900/30 text-zinc-900 dark:text-white'
                    : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-100 dark:border-zinc-800 text-zinc-400'
                }`}
                id={`reward-badge-card-${badge.id}`}
              >
                {/* Custom Badge Avatar Icon Container */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                  isUnlocked 
                    ? 'bg-white dark:bg-zinc-800 border-lime-200 text-lime-600 dark:border-zinc-700' 
                    : 'bg-zinc-100 dark:bg-zinc-800/80 border-transparent text-zinc-300'
                }`}>
                  {renderBadgeIcon(badge.iconName, isUnlocked)}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className={`text-xs font-black ${isUnlocked ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-400'}`}>
                      {badge.title}
                    </h4>
                    {isUnlocked ? (
                      <span className="text-[8px] font-black uppercase text-lime-700 bg-lime-100/60 dark:bg-lime-950/25 dark:text-lime-400 px-2 py-0.5 rounded-full">
                        {badge.unlockedAt}
                      </span>
                    ) : (
                      <span className="text-[8px] font-extrabold uppercase text-zinc-400 font-mono">
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-tight mt-0.5">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rewards guidance call out */}
      <div className="p-3 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex items-start gap-2.5">
        <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[10.5px] text-zinc-505 dark:text-zinc-400 leading-normal font-medium">
          <strong>How do I unlock more badges?</strong> Complete all 4 daily tasks (Water, Gym, Steps, Food calorie targets) to gain streaks. Once your streaks accumulate or points reach milestone targets, locks release dynamically!
        </p>
      </div>

    </div>
  );
}
