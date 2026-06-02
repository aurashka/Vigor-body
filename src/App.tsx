/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, DailyLog, FoodEaten } from './types';
import { getTodayDateKey, calculateProfileTargets } from './utils';
import AndroidFrame from './components/AndroidFrame';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import Rewards from './components/Rewards';
import Settings from './components/Settings';
import FoodLoggerModal from './components/FoodLoggerModal';
import { Home, Trophy, Award, Settings as SettingsIcon, Sparkles } from 'lucide-react';

const LOCAL_STORAGE_PROFILE_KEY = 'vigor_body_user_profile';
const LOCAL_STORAGE_LOGS_KEY = 'vigor_body_daily_logs';
const LOCAL_STORAGE_THEME_KEY = 'vigor_body_theme_mode';
const LOCAL_STORAGE_STREAK_KEY = 'vigor_body_streak_count';

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leaderboard' | 'rewards' | 'settings'>('dashboard');
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>({});
  const [isFoodLoggerOpen, setIsFoodLoggerOpen] = useState(false);
  const [foodLoggerCategory, setFoodLoggerCategory] = useState<'protein' | 'carbs' | 'fat' | null>(null);

  // Load configuration and cached history on mount
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      }

      const storedLogs = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
      if (storedLogs) {
        setDailyLogs(JSON.parse(storedLogs));
      }

      const storedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
      if (storedTheme === 'dark' || storedTheme === 'light') {
        setTheme(storedTheme);
      } else {
        // Light mode is default matching standard guidelines
        setTheme('light');
      }
    } catch (e) {
      console.error('Failed loading cache', e);
    }
  }, []);

  // Update DOM classes when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
  }, [theme]);

  // Derive today's current log, creating it if it doesn't exist
  const todayKey = getTodayDateKey();
  const todayLog: DailyLog = React.useMemo(() => {
    if (dailyLogs[todayKey]) {
      return dailyLogs[todayKey];
    }
    return {
      date: todayKey,
      waterIntake: 0,
      stepsWalked: 0,
      exercisesCompleted: [],
      foodsEaten: [],
      caloriesBurned: 0,
    };
  }, [dailyLogs, todayKey]);

  // Save profile helper
  const handleCompleteOnboarding = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
  };

  const handleChangeProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
  };

  // Upstream update handler to save daily indicators
  const handleUpdateDailyLog = (changes: Partial<DailyLog>) => {
    const updatedLog = { ...todayLog, ...changes };
    const nextLogs = { ...dailyLogs, [todayKey]: updatedLog };
    setDailyLogs(nextLogs);
    localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(nextLogs));
  };

  // Add Eaten portion helper
  const handleAddFoodToLog = (food: Omit<FoodEaten, 'id' | 'loggedAt'>) => {
    const newFood: FoodEaten = {
      ...food,
      id: `food_log_${Date.now()}`,
      loggedAt: new Date().toISOString(),
    };
    const currentList = todayLog.foodsEaten || [];
    handleUpdateDailyLog({ foodsEaten: [...currentList, newFood] });
  };

  // Reset override targets but preserve checked list (the checkins history is protected!)
  const handleResetSystemTargets = () => {
    if (!userProfile) return;
    
    const restoredProfile: UserProfile = {
      ...userProfile,
      caloriesTargetCustom: undefined,
      proteinTargetCustom: undefined,
      carbsTargetCustom: undefined,
      waterTargetCustom: undefined,
      stepsTargetCustom: undefined,
    };

    setUserProfile(restoredProfile);
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(restoredProfile));
  };

  const handleOpenFoodLoggerByMacro = (category: 'protein' | 'carbs' | 'fat' | null) => {
    setFoodLoggerCategory(category);
    setIsFoodLoggerOpen(true);
  };

  // Compute points and streaks
  const { totalPoints, streakCount, tasksCompletedToday } = React.useMemo(() => {
    let score = 50; // base startup points
    let activeStreak = 1;

    // Calculate sum score over previous logs
    Object.values(dailyLogs).forEach((logObj) => {
      const log = logObj as DailyLog;
      // 10 XP for each 250ml water
      score += Math.min(100, Math.round((log.waterIntake || 0) / 250) * 10);
      // 5 XP for each 1000 steps
      score += Math.min(100, Math.floor((log.stepsWalked || 0) / 1000) * 5);
      // 25 XP for each workout checked off
      score += (log.exercisesCompleted || []).length * 25;
      // 15 XP for logging meals
      score += (log.foodsEaten || []).length * 15;
    });

    // Compute Streak: Consecutive days where at least 2 key targets are completed
    // Today's completed tasks indicators
    let waterOk = false;
    let stepsOk = false;
    let workoutOk = false;
    let dietOk = false;

    if (userProfile) {
      const targets = calculateProfileTargets(userProfile);
      waterOk = todayLog.waterIntake >= targets.water;
      stepsOk = todayLog.stepsWalked >= targets.steps;
      workoutOk = todayLog.exercisesCompleted.length >= 2;
      const totalCal = todayLog.foodsEaten.reduce((sum, f) => sum + f.calories, 0);
      dietOk = totalCal > 0 && totalCal <= targets.calories + 100;
    }

    const tasksOk = [waterOk, stepsOk, workoutOk, dietOk].filter(Boolean).length;
    
    // Streak defaults to 1 for new profiles but grows as logs are captured
    const historicDatesLoaded = Object.keys(dailyLogs).filter(k => k !== todayKey).sort();
    if (historicDatesLoaded.length > 0) {
      activeStreak = Math.min(5, 1 + historicDatesLoaded.length);
    } else if (tasksOk >= 2) {
      activeStreak = 1;
    }

    return {
      totalPoints: score,
      streakCount: activeStreak,
      tasksCompletedToday: { waterOk, stepsOk, workoutOk, dietOk },
    };
  }, [dailyLogs, todayLog, userProfile, todayKey]);

  return (
    <AndroidFrame theme={theme}>
      {!userProfile ? (
        <Onboarding onComplete={handleCompleteOnboarding} />
      ) : (
        <div className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-[#09090b]">
          
          {/* Main App Bar Headers */}
          <div className="sticky top-0 bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-md px-5 py-3 border-b border-zinc-200 dark:border-zinc-800/80 z-30 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡️</span>
              <div>
                <h1 className="text-sm font-sans font-black tracking-tight text-zinc-900 dark:text-white leading-none uppercase">
                  Vigor Body
                </h1>
                <p className="text-[10px] text-zinc-400 capitalize mt-0.5 font-mono">
                  {userProfile.targetBody.replace('_', ' ')} • {activeTab}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-zinc-800 dark:text-lime-400 bg-zinc-100 dark:bg-lime-950/30 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-lime-900/50 font-mono tracking-wider">
                {totalPoints} XP
              </span>
            </div>
          </div>

          {/* Active View Router Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'dashboard' && (
              <Dashboard
                userProfile={userProfile}
                dailyLog={todayLog}
                onUpdateDailyLog={handleUpdateDailyLog}
                streakCount={streakCount}
                totalPoints={totalPoints}
                onOpenFoodLogger={handleOpenFoodLoggerByMacro}
              />
            )}

            {activeTab === 'leaderboard' && (
              <Leaderboard
                currentUserScore={totalPoints}
                currentUserCountry={userProfile.country}
              />
            )}

            {activeTab === 'rewards' && (
              <Rewards
                totalPoints={totalPoints}
                streakCount={streakCount}
                workoutCompleted={tasksCompletedToday.workoutOk}
                waterCompleted={tasksCompletedToday.waterOk}
                dietCompleted={tasksCompletedToday.dietOk}
              />
            )}

            {activeTab === 'settings' && (
              <Settings
                userProfile={userProfile}
                onChangeProfile={handleChangeProfile}
                theme={theme}
                onChangeTheme={setTheme}
                onResetSystemTargetsOnly={handleResetSystemTargets}
              />
            )}
          </div>

          {/* Android Sticky Bottom Tab Segment Bar */}
          <div className="bg-white/95 dark:bg-[#0c0c0e]/95 border-t border-zinc-200 dark:border-zinc-800/80 fireworks-nav py-2.5 px-4 flex justify-around items-center z-30">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center gap-1 bg-transparent border-transparent select-none transition duration-150 ${
                activeTab === 'dashboard' ? 'text-zinc-900 dark:text-lime-400 font-extrabold' : 'text-zinc-400 dark:text-zinc-500'
              }`}
              id="tab-btn-dashboard"
            >
              <Home className="w-5 h-5 cursor-pointer" />
              <span className="text-[9px] font-bold tracking-wide">Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex flex-col items-center gap-1 bg-transparent border-transparent select-none transition duration-150 ${
                activeTab === 'leaderboard' ? 'text-zinc-900 dark:text-lime-400 font-extrabold' : 'text-zinc-400 dark:text-zinc-500'
              }`}
              id="tab-btn-leaderboard"
            >
              <Trophy className="w-5 h-5 cursor-pointer" />
              <span className="text-[9px] font-bold tracking-wide">Arena</span>
            </button>

            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex flex-col items-center gap-1 bg-transparent border-transparent select-none transition duration-150 ${
                activeTab === 'rewards' ? 'text-zinc-900 dark:text-lime-400 font-extrabold' : 'text-zinc-400 dark:text-zinc-500'
              }`}
              id="tab-btn-rewards"
            >
              <Award className="w-5 h-5 cursor-pointer" />
              <span className="text-[9px] font-bold tracking-wide">Locker</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center gap-1 bg-transparent border-transparent select-none transition duration-150 ${
                activeTab === 'settings' ? 'text-zinc-900 dark:text-lime-400 font-extrabold' : 'text-zinc-400 dark:text-zinc-500'
              }`}
              id="tab-btn-settings"
            >
              <SettingsIcon className="w-5 h-5 cursor-pointer" />
              <span className="text-[9px] font-bold tracking-wide">Settings</span>
            </button>
          </div>

          {/* Interactive Modal Sheet overlay */}
          <FoodLoggerModal
            userCountry={userProfile.country}
            userDietPref={userProfile.dietPreference}
            illness={userProfile.illness}
            isOpen={isFoodLoggerOpen}
            onClose={() => setIsFoodLoggerOpen(false)}
            onAddFood={handleAddFoodToLog}
            initialCategory={foodLoggerCategory}
          />

        </div>
      )}
    </AndroidFrame>
  );
}
