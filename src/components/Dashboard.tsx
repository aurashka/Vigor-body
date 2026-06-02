/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { UserProfile, DailyLog, WorkoutExercise } from '../types';
import { calculateProfileTargets, generateWorkoutPlan, getImprovementAdvice } from '../utils';
import { 
  Droplet, Footprints, CheckSquare, Plus, Edit3, Save, 
  Trash2, Dumbbell, Sparkles, TrendingUp, ChevronRight, HelpCircle, 
  Award, ShieldAlert, Zap, Flame, Lock, CheckCircle2, ChevronDown, ListStart, DumbbellIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { COUNTRY_NORMAL_DIET_FACTS } from '../data';

interface DashboardProps {
  userProfile: UserProfile;
  dailyLog: DailyLog;
  onUpdateDailyLog: (log: Partial<DailyLog>) => void;
  streakCount: number;
  totalPoints: number;
  onOpenFoodLogger: (category: 'protein' | 'carbs' | 'fat' | null) => void;
}

export default function Dashboard({
  userProfile,
  dailyLog,
  onUpdateDailyLog,
  streakCount = 0,
  totalPoints = 0,
  onOpenFoodLogger,
}: DashboardProps) {
  
  const computedTargets = calculateProfileTargets(userProfile);
  const workoutPlan = generateWorkoutPlan(userProfile);

  // 1. Level Calculation Scale based on accumulated points
  const getProgressLevel = (xp: number) => {
    if (xp < 150) {
      return {
        level: 1,
        title: 'Warmup Initiate',
        desc: 'Focus on gentle rehabilitation, posture, and simple joint mobility.',
        intensity: 'Gentle Pacing (1-2 Sets, Moderate Reps)',
        badge: '🌱',
        xpRequired: 0,
        nextXp: 150,
        unlockedExercises: ['ex_brisk_walk', 'ex_joint_star'],
        previewNext: { name: 'Pushups, Planks & Body Squats', xpReq: 150 }
      };
    }
    if (xp < 450) {
      return {
        level: 2,
        title: 'Calisthenic Rookie',
        desc: 'Introducing baseline bodyweight conditioning and core stabilizers.',
        intensity: 'Moderate Stability (3 Sets, Base Reps)',
        badge: '🤸🏼‍♀️',
        xpRequired: 150,
        nextXp: 450,
        unlockedExercises: ['ex_brisk_walk', 'ex_joint_star', 'ex_squats', 'ex_pushups', 'ex_plank', 'ex_glute_bridge'],
        previewNext: { name: 'Dumbbell Rows, Chair Dips & Superman', xpReq: 450 }
      };
    }
    if (xp < 850) {
      return {
        level: 3,
        title: 'Vigor Shaper',
        desc: 'Muscular endurance and specific structural shaper splitting.',
        intensity: 'Target Enduring (3 Sets, 12-15 Reps)',
        badge: '🦾',
        xpRequired: 450,
        nextXp: 850,
        unlockedExercises: ['ex_brisk_walk', 'ex_joint_star', 'ex_squats', 'ex_pushups', 'ex_plank', 'ex_glute_bridge', 'ex_dumbbell_rows', 'ex_bench_dips', 'ex_superman'],
        previewNext: { name: 'Dumbbell Floor Press & Hammer Curls', xpReq: 850 }
      };
    }
    if (xp < 1400) {
      return {
        level: 4,
        title: 'Power Dynamo',
        desc: 'Progressive load resistance with dumbbell workouts for hypertrophy.',
        intensity: 'Hypertrophy Force (4 Sets, Solid Reps)',
        badge: '🏋️',
        xpRequired: 850,
        nextXp: 1400,
        unlockedExercises: ['ex_brisk_walk', 'ex_joint_star', 'ex_squats', 'ex_pushups', 'ex_plank', 'ex_glute_bridge', 'ex_dumbbell_rows', 'ex_bench_dips', 'ex_superman', 'ex_dumbbell_press', 'ex_bicep_curl', 'ex_lunges'],
        previewNext: { name: 'Gladiator High-Fatigue Star Jacks', xpReq: 1400 }
      };
    }
    if (xp < 2000) {
      return {
        level: 5,
        title: 'Titanium Centurion',
        desc: 'High-fatigue supersets with shortened rest duration intervals.',
        intensity: 'Extreme Fatigue (4-5 Sets, 40s Rest)',
        badge: '🔥',
        xpRequired: 1400,
        nextXp: 2000,
        unlockedExercises: ['ex_brisk_walk', 'ex_joint_star', 'ex_squats', 'ex_pushups', 'ex_plank', 'ex_glute_bridge', 'ex_dumbbell_rows', 'ex_bench_dips', 'ex_superman', 'ex_dumbbell_press', 'ex_bicep_curl', 'ex_lunges', 'ex_jumping_jacks'],
        previewNext: { name: 'Peak Homeostasis Giant Combos', xpReq: 2000 }
      };
    }
    return {
      level: 6,
      title: 'Ultimate Vigor Hero',
      desc: 'Peak championship physical performance and maximum conditioning speed.',
      intensity: 'Peak Gladiator (Giant Overload Supersets)',
      badge: '⚡️',
      xpRequired: 2000,
      nextXp: 99999,
      unlockedExercises: ['ex_brisk_walk', 'ex_joint_star', 'ex_squats', 'ex_pushups', 'ex_plank', 'ex_glute_bridge', 'ex_dumbbell_rows', 'ex_bench_dips', 'ex_superman', 'ex_dumbbell_press', 'ex_bicep_curl', 'ex_lunges', 'ex_jumping_jacks'],
      previewNext: null
    };
  };

  const activeLevel = getProgressLevel(totalPoints);

  // 2. Dynamic exercise plan unlocks based on points level
  const progressiveWorkoutPlan = useMemo(() => {
    return workoutPlan.filter((ex) => activeLevel.unlockedExercises.includes(ex.id));
  }, [workoutPlan, activeLevel.unlockedExercises]);

  // 3. Dynamic Sets & Reps Progressive Intensity Scaling
  const scaleWorkoutIntensity = useMemo(() => {
    return progressiveWorkoutPlan.map((ex) => {
      let scaledSets = ex.sets;
      let scaledReps = ex.reps;

      // Increment difficulty parameters as level progresses
      if (activeLevel.level >= 2) {
        scaledSets = ex.sets + 0; // base standard
      }
      if (activeLevel.level >= 3) {
        scaledSets = ex.sets + 1; // plus 1 set for hypertrophy!
      }
      if (activeLevel.level >= 5) {
        if (ex.reps.includes('reps')) {
          const baseRepsNum = parseInt(ex.reps) || 12;
          scaledReps = `${baseRepsNum + 4} reps (High Tempo)`;
        } else if (ex.reps.includes('mins')) {
          const baseMinsNum = parseInt(ex.reps) || 15;
          scaledReps = `${baseMinsNum + 5} mins`;
        } else if (ex.reps.includes('secs')) {
          const baseSecsNum = parseInt(ex.reps) || 30;
          scaledReps = `${baseSecsNum + 15} secs Hold`;
        }
      }

      return {
        ...ex,
        sets: scaledSets,
        reps: scaledReps,
      };
    });
  }, [progressiveWorkoutPlan, activeLevel.level]);

  // 4. Milestone definition array for Leveling Evolutionary Tree Roadmap
  const levelMilestones = [
    { num: 1, name: 'Ground Start', xp: 0, badge: '🌱', unlocks: 'Walking & Joint Mobility rolls', intensity: 'Gentle Pacing Warmup (1-2 Sets)' },
    { num: 2, name: 'Calisthenics', xp: 150, badge: '🤸🏼‍♀️', unlocks: 'Squats, Pushups, Core Planks & Bridges', intensity: 'Rookie (3 Sets, Base Reps)' },
    { num: 3, name: 'Muscle Endure', xp: 450, badge: '🦾', unlocks: 'Dumbbell Rows, Couch Tricep Bench Dips & Supermans', intensity: 'Hypertrophy Tone (4 Sets)' },
    { num: 4, name: 'Strength Forge', xp: 850, badge: '🏋️', unlocks: 'Floor Chest Press, Bicep Hammer curls & Reverse Lunges', intensity: 'Heavy Overload (4 Sets)' },
    { num: 5, name: 'Gladiator', xp: 1400, badge: '🔥', unlocks: 'Explosive Jumping Jacks & Short-rest Supersets', intensity: 'Extreme Burn (4-5 Sets)' },
    { num: 6, name: 'Peak Hero', xp: 2000, badge: '⚡️', unlocks: 'Peak homeostasis, athletic compound fitness, ultimate intense speed', intensity: 'Gladiator Peak Max (Complex Series)' }
  ];

  // Manual inputs for editing targets & metrics with gate protecting to stop desynchronization
  const [isEditingSteps, setIsEditingSteps] = useState(false);
  const [stepsInput, setStepsInput] = useState(dailyLog.stepsWalked.toString());

  const [isEditingWater, setIsEditingWater] = useState(false);
  const [waterInput, setWaterInput] = useState(dailyLog.waterIntake.toString());

  // Local collateral flags for visual expanders
  const [showTreeRoadmap, setShowTreeRoadmap] = useState(false);

  // Buffer protection syncing only while NOT editing
  React.useEffect(() => {
    if (!isEditingSteps) {
      setStepsInput(dailyLog.stepsWalked.toString());
    }
  }, [dailyLog.stepsWalked, isEditingSteps]);

  React.useEffect(() => {
    if (!isEditingWater) {
      setWaterInput(dailyLog.waterIntake.toString());
    }
  }, [dailyLog.waterIntake, isEditingWater]);

  // Log calculation helper aggregates
  const loggedEaten = dailyLog.foodsEaten || [];
  const loggedNutrition = loggedEaten.reduce(
    (acc, f) => {
      acc.calories += f.calories;
      acc.protein += f.protein;
      acc.carbs += f.carbs;
      acc.fat += f.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const completedWorkoutCount = (dailyLog?.exercisesCompleted || []).length;
  // Finished means completed all or all minus one of the dynamic progressive plan
  const isWorkoutFinished = scaleWorkoutIntensity.length > 0 && completedWorkoutCount >= Math.max(1, scaleWorkoutIntensity.length);

  // Check off exercise handler
  const handleToggleExercise = (exId: string, pts: number) => {
    let completed = [...(dailyLog.exercisesCompleted || [])];
    if (completed.includes(exId)) {
      completed = completed.filter(id => id !== exId);
    } else {
      completed.push(exId);
    }
    onUpdateDailyLog({ exercisesCompleted: completed });
  };

  // Water helper increments with complete buffered coordination to prevent glitches
  const handleAddWater = (amount: number) => {
    const current = dailyLog.waterIntake || 0;
    const targetVal = Math.max(0, current + amount);
    onUpdateDailyLog({ waterIntake: targetVal });
    setWaterInput(targetVal.toString());
  };

  const handleSaveWaterInput = () => {
    const val = parseInt(waterInput) || 0;
    const cleanWater = Math.max(0, val);
    onUpdateDailyLog({ waterIntake: cleanWater });
    setWaterInput(cleanWater.toString());
    setIsEditingWater(false);
  };

  // Steps increment helpers
  const handleAddSteps = (amount: number) => {
    const current = dailyLog.stepsWalked || 0;
    const targetVal = Math.max(0, current + amount);
    onUpdateDailyLog({ stepsWalked: targetVal });
    setStepsInput(targetVal.toString());
  };

  const handleSaveStepsInput = () => {
    const val = parseInt(stepsInput) || 0;
    const cleanSteps = Math.max(0, val);
    onUpdateDailyLog({ stepsWalked: cleanSteps });
    setStepsInput(cleanSteps.toString());
    setIsEditingSteps(false);
  };

  const handleRemoveFood = (idx: number) => {
    const nextFoods = [...loggedEaten];
    nextFoods.splice(idx, 1);
    onUpdateDailyLog({ foodsEaten: nextFoods });
  };

  // Percentage calculations
  const calPercent = computedTargets.calories > 0 
    ? Math.min(100, Math.round(((loggedNutrition.calories || 0) / computedTargets.calories) * 100)) 
    : 0;

  const waterPercent = computedTargets.water > 0 
    ? Math.min(100, Math.round(((dailyLog.waterIntake || 0) / computedTargets.water) * 100)) 
    : 0;

  const stepsPercent = computedTargets.steps > 0 
    ? Math.min(100, Math.round(((dailyLog.stepsWalked || 0) / computedTargets.steps) * 100)) 
    : 0;

  // Determine regional staples details
  const regionalFact = COUNTRY_NORMAL_DIET_FACTS[userProfile.country] || {
    summary: 'A clean balanced hydration and multi-tier protein configuration matches this country standard.',
    healthySwap: 'Replace quick refined sugars with raw fiber carbs.',
    staple: 'Whole grains and fresh local produce.'
  };

  // Advice algorithm call
  const dailyAdvices = getImprovementAdvice(
    loggedNutrition.calories, computedTargets.calories,
    loggedNutrition.protein, computedTargets.protein,
    loggedNutrition.carbs, computedTargets.carbs,
    loggedNutrition.fat, computedTargets.fat,
    dailyLog.waterIntake, computedTargets.water,
    dailyLog.stepsWalked, computedTargets.steps,
    userProfile.illness
  );

  // Dynamic Motivation Quote based on Goal and Illness
  const getMotivationQuote = () => {
    const patientSuffix = userProfile.illness !== 'none' 
      ? 'Pacing is our power. Safe progressive motions build ultimate longevity.' 
      : 'Keep shaping your body cleanly. Each check-in adds streak multipliers!';

    if (userProfile.targetBody === 'fat_loss') {
      return `🔥 "Consistency melts fat faster than any strict diet." - ${patientSuffix}`;
    }
    if (userProfile.targetBody === 'muscle_gain') {
      return `💪 "Muscles are forged in the gym, fueled by local macros, and healed with hydration." - ${patientSuffix}`;
    }
    return `✨ "Shape is a balance of customized movement and portion discipline." - ${patientSuffix}`;
  };

  // Next level countdown computations
  const levelProgressPercent = activeLevel.level === 6 
    ? 100 
    : Math.min(100, Math.round(((totalPoints - activeLevel.xpRequired) / (activeLevel.nextXp - activeLevel.xpRequired)) * 100));

  return (
    <div className="flex-1 flex flex-col gap-4 font-sans p-4 pb-12 bg-zinc-50 dark:bg-[#09090b]">
      
      {/* 1. Header Streaks Profile Card with real-time level display */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between bg-white dark:bg-[#18181b] p-4.5 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80">
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 text-xl font-bold border border-zinc-250 dark:border-zinc-700 animate-pulse">
            {activeLevel.badge}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-sans font-black text-zinc-900 dark:text-white leading-tight uppercase tracking-tight">
                Hello, {userProfile.name}!
              </h2>
              <span className="text-[9px] font-black uppercase text-lime-700 dark:text-lime-400 bg-lime-50 dark:bg-lime-950/20 border border-lime-100/50 dark:border-lime-900/10 px-2 py-0.5 rounded-full">
                LVL {activeLevel.level}
              </span>
            </div>
            
            <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider mt-1">
              Active title: <strong className="text-zinc-650 dark:text-zinc-300 font-bold">{activeLevel.title}</strong>
            </p>
          </div>
        </div>

        {/* Level points and XP bar progress indicator */}
        <div className="flex flex-col gap-1 sm:w-44 shrink-0 bg-transparent">
          <div className="flex justify-between items-center text-[9px] font-mono font-bold leading-none text-zinc-400">
            <span>Points: {totalPoints} XP</span>
            {activeLevel.nextXp !== 99999 ? (
              <span>Next {activeLevel.nextXp} XP</span>
            ) : (
              <span>MAX LEVEL REACHED</span>
            )}
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden border border-zinc-200/50 dark:border-zinc-700/50">
            <div 
              className="bg-lime-500 hover:bg-lime-600 dark:bg-lime-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${levelProgressPercent}%` }}
            ></div>
          </div>
          {activeLevel.previewNext && (
            <span className="text-[8.5px] text-zinc-455 text-zinc-450 dark:text-zinc-500 font-semibold font-mono tracking-tight leading-none truncate">
              {activeLevel.nextXp - totalPoints} XP to unlock: {activeLevel.previewNext.name}
            </span>
          )}
        </div>

        {/* Streaks pill */}
        <div className="flex items-center justify-center gap-1.5 bg-zinc-950 dark:bg-zinc-900 border border-zinc-800/80 rounded-full text-[10px] font-black tracking-wider text-lime-400 uppercase py-2 px-4.5 self-start">
          <Flame className="w-3.5 h-3.5 text-lime-400 animate-pulse fill-current" />
          <span className="font-mono">{streakCount} Day Streak</span>
        </div>
      </div>

      {/* 2. Unified Nutrition Dashboard Circle Gauge */}
      <div className="bg-white dark:bg-[#18181b] p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider font-mono">PORTION CALORIES BUDGET</span>
          <span className="text-[10px] font-semibold text-slate-800 dark:text-lime-400 bg-slate-100 dark:bg-lime-950/30 px-2.5 py-0.5 rounded border border-zinc-200 dark:border-lime-900/40 font-mono">
            Target Body Fit
          </span>
        </div>

        {/* Dynamic circular SVG dashboard */}
        <div className="relative w-40 h-40 flex items-center justify-center my-2">
          {/* Background circle outline */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="68"
              className="stroke-zinc-100 dark:stroke-zinc-805 stroke-zinc-200/50 dark:stroke-zinc-800 fill-none"
              strokeWidth="11"
            />
            {/* Active gauge percentage bar */}
            <circle
              cx="80"
              cy="80"
              r="68"
              className="stroke-lime-500 dark:stroke-lime-400 fill-none transition-all duration-500"
              strokeWidth="11"
              strokeDasharray={2 * Math.PI * 68}
              strokeDashoffset={2 * Math.PI * 68 * (1 - calPercent / 100)}
              strokeLinecap="round"
            />
          </svg>

          {/* Internal content numbers */}
          <div className="absolute text-center flex flex-col">
            <span className="text-xs font-semibold text-zinc-450 dark:text-zinc-403 tracking-wider font-mono">LOGGED</span>
            <span className="text-2xl font-black text-zinc-900 dark:text-white font-mono leading-none my-1">
              {loggedNutrition.calories}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
              of {computedTargets.calories} kcal
            </span>
            <span className="text-xs font-bold font-mono text-lime-600 dark:text-lime-400 mt-1">{calPercent}%</span>
          </div>
        </div>

        {/* Clickable Macro Targets Breakdown (Interactive Macro click as requested) */}
        <div className="w-full grid grid-cols-3 gap-2 border-t border-zinc-200 dark:border-zinc-800/85 pt-4 mt-2">
          
          <button 
            onClick={() => onOpenFoodLogger('protein')}
            className="flex flex-col items-center bg-zinc-50 dark:bg-zinc-900/20 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/60 hover:border-lime-400 active:scale-95 transition duration-150 cursor-pointer"
            id="click-macro-protein-btn"
          >
            <span className="text-[9px] text-[#2f855a] dark:text-lime-400 uppercase tracking-widest font-black flex items-center gap-1">
              🥩 Protein
            </span>
            <span className="text-sm font-black text-zinc-800 dark:text-white font-mono leading-tight mt-1">
              {loggedNutrition.protein.toFixed(0)}<span className="text-[10px] font-bold text-zinc-400">/{computedTargets.protein}g</span>
            </span>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-lime-500 dark:bg-lime-400 h-full rounded-full transition-all" 
                style={{ width: `${Math.min(100, (loggedNutrition.protein / computedTargets.protein) * 100)}%` }}
              ></div>
            </div>
            <span className="text-[8px] text-zinc-400 dark:text-zinc-500 mt-1 uppercase font-bold hover:underline">Click to Log</span>
          </button>

          <button 
            onClick={() => onOpenFoodLogger('carbs')}
            className="flex flex-col items-center bg-zinc-50 dark:bg-zinc-900/20 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/60 hover:border-orange-400 active:scale-95 transition duration-150 cursor-pointer"
            id="click-macro-carbs-btn"
          >
            <span className="text-[9px] text-[#c05621] dark:text-orange-400 uppercase tracking-widest font-black flex items-center gap-1">
              🌾 Carbs
            </span>
            <span className="text-sm font-black text-zinc-800 dark:text-white font-mono leading-tight mt-1">
              {loggedNutrition.carbs.toFixed(0)}<span className="text-[10px] font-bold text-zinc-400">/{computedTargets.carbs}g</span>
            </span>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-orange-500 dark:bg-orange-400 h-full rounded-full transition-all" 
                style={{ width: `${Math.min(100, (loggedNutrition.carbs / computedTargets.carbs) * 100)}%` }}
              ></div>
            </div>
            <span className="text-[8px] text-zinc-400 dark:text-zinc-500 mt-1 uppercase font-bold hover:underline">Click to Log</span>
          </button>

          <button 
            onClick={() => onOpenFoodLogger('fat')}
            className="flex flex-col items-center bg-zinc-50 dark:bg-zinc-900/20 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/60 hover:border-blue-400 active:scale-95 transition duration-150 cursor-pointer"
            id="click-macro-fat-btn"
          >
            <span className="text-[9px] text-[#4c51bf] dark:text-blue-400 uppercase tracking-widest font-black flex items-center gap-1">
              🥑 Fat
            </span>
            <span className="text-sm font-black text-zinc-800 dark:text-white font-mono leading-tight mt-1">
              {loggedNutrition.fat.toFixed(0)} <span className="text-[10px] font-bold text-zinc-400 font-sans">/{computedTargets.fat}g</span>
            </span>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-blue-600 dark:bg-blue-400 h-full rounded-full transition-all" 
                style={{ width: `${Math.min(100, (loggedNutrition.fat / computedTargets.fat) * 100)}%` }}
              ></div>
            </div>
            <span className="text-[8px] text-zinc-400 mt-1 uppercase font-bold hover:underline">Click to Log</span>
          </button>

        </div>
      </div>

      {/* 3. Water and Steps - COMPACT GLITCH-FREE REDESIGNED PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Hydro tracking card */}
        <div className="bg-white dark:bg-[#18181b] p-4.5 rounded-3xl border border-zinc-205 border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2f855a] dark:text-lime-400 flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-blue-500 dark:text-cyan-400 fill-current" /> 
                Hydration Log
              </span>
              <span className="text-[9px] bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/10 px-2 py-0.5 rounded-md font-mono text-sky-650 dark:text-sky-305 font-bold uppercase tracking-wider">
                {waterPercent}% Goal
              </span>
            </div>

            {isEditingWater ? (
              <div className="flex items-center gap-2 mt-2 bg-zinc-50 dark:bg-zinc-900/60 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <input
                  type="number"
                  min="0"
                  value={waterInput}
                  onChange={(e) => setWaterInput(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-850 px-3 py-1.5 rounded-lg border border-zinc-250 dark:border-zinc-700 text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none"
                  id="water-edit-input"
                  placeholder="ml"
                />
                <button
                  onClick={handleSaveWaterInput}
                  className="px-3.5 py-1.5 rounded-lg bg-lime-500 hover:bg-lime-600 dark:bg-lime-400 text-zinc-950 dark:text-zinc-950 text-xs font-extrabold flex items-center gap-1 transition-all"
                  id="water-edit-save-btn"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-2.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-zinc-850 dark:text-white font-mono leading-none">
                    {dailyLog.waterIntake}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase font-sans">ml</span>
                  <span className="text-[10px] text-zinc-400 font-mono ml-1">/ {computedTargets.water} ml</span>
                </div>
                
                <button 
                  onClick={() => {
                    setWaterInput(dailyLog.waterIntake.toString());
                    setIsEditingWater(true);
                  }} 
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 transition"
                  id="edit-water-icon-btn"
                  title="Edit amount manually"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Quick interactive increments - no flicker, instant state buffer */}
          <div className="grid grid-cols-3 gap-1.5 mt-4">
            <button
              onClick={() => handleAddWater(250)}
              className="py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100/80 dark:bg-zinc-900/40 dark:hover:bg-zinc-800/80 text-sky-700 dark:text-sky-305 text-[10px] font-extrabold border border-sky-100/50 dark:border-zinc-800/80 transition active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-0.5 leading-none shadow-xs"
              id="water-add-250-btn"
            >
              <span className="text-xs">🥛</span>
              <span>+250ml</span>
            </button>
            <button
              onClick={() => handleAddWater(500)}
              className="py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100/80 dark:bg-zinc-900/40 dark:hover:bg-zinc-800/80 text-sky-700 dark:text-sky-305 text-[10px] font-extrabold border border-sky-100/50 dark:border-zinc-800/80 transition active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-0.5 leading-none shadow-xs"
              id="water-add-500-btn"
            >
              <span className="text-xs">🥤</span>
              <span>+500ml</span>
            </button>
            <button
              onClick={() => handleAddWater(1000)}
              className="py-2.5 rounded-xl bg-lime-50 hover:bg-lime-100/80 dark:bg-lime-950/25 dark:hover:bg-lime-900/40 text-lime-700 dark:text-lime-300 text-[10px] font-extrabold border border-lime-100/50 dark:border-lime-900/50 transition active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-0.5 leading-none shadow-xs"
              id="water-add-1000-btn"
            >
              <span className="text-xs">🍶</span>
              <span>+1.0L</span>
            </button>
          </div>
        </div>

        {/* Steps tracking card */}
        <div className="bg-white dark:bg-[#18181b] p-4.5 rounded-3xl border border-zinc-205 border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-lime-400 flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-emerald-500 dark:text-lime-400" /> Walk Milestone
              </span>
              <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/10 px-2 py-0.5 rounded-md font-mono text-emerald-650 dark:text-emerald-305 font-bold uppercase tracking-wider">
                {stepsPercent}% Limit
              </span>
            </div>

            {isEditingSteps ? (
              <div className="flex items-center gap-2 mt-2 bg-zinc-50 dark:bg-zinc-900/60 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <input
                  type="number"
                  min="0"
                  value={stepsInput}
                  onChange={(e) => setStepsInput(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-850 px-3 py-1.5 rounded-lg border border-zinc-250 dark:border-zinc-700 text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none"
                  id="steps-edit-input"
                  placeholder="steps count"
                />
                <button
                  onClick={handleSaveStepsInput}
                  className="px-3.5 py-1.5 rounded-lg bg-lime-500 hover:bg-lime-600 dark:bg-lime-400 text-zinc-950 dark:text-zinc-950 text-xs font-extrabold flex items-center gap-1 transition-all"
                  id="steps-edit-save-btn"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-2.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-zinc-850 dark:text-white font-mono leading-none">
                    {dailyLog.stepsWalked.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase font-sans">Steps</span>
                  <span className="text-[10px] text-zinc-400 font-mono ml-1">/ {computedTargets.steps.toLocaleString()}</span>
                </div>
                
                <button 
                  onClick={() => {
                    setStepsInput(dailyLog.stepsWalked.toString());
                    setIsEditingSteps(true);
                  }} 
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 transition"
                  id="edit-steps-icon-btn"
                  title="Set steps manually"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Quick interactive increments - robust, instant, non-flicker */}
          <div className="grid grid-cols-3 gap-1.5 mt-4">
            <button
              onClick={() => handleAddSteps(1000)}
              className="py-2.5 rounded-xl bg-lime-50 hover:bg-lime-100/85 dark:bg-zinc-900/40 dark:hover:bg-zinc-800/80 text-lime-705 text-[#2c5282] dark:text-lime-400 text-[10px] font-extrabold border border-lime-100/50 dark:border-zinc-800/85 transition active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-0.5 leading-none shadow-xs"
              id="steps-add-1000-btn"
            >
              <span className="text-xs">🚶🏼‍♂️</span>
              <span>+1K Steps</span>
            </button>
            <button
              onClick={() => handleAddSteps(2500)}
              className="py-2.5 rounded-xl bg-lime-50 hover:bg-lime-100/85 dark:bg-zinc-900/40 dark:hover:bg-zinc-800/80 text-lime-705 text-[#2c5282] dark:text-lime-400 text-[10px] font-extrabold border border-lime-100/50 dark:border-zinc-800/85 transition active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-0.5 leading-none shadow-xs"
              id="steps-add-2500-btn"
            >
              <span className="text-xs">🏃🏽‍♂️</span>
              <span>+2.5K</span>
            </button>
            <button
              onClick={() => handleAddSteps(5000)}
              className="py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/85 dark:bg-emerald-950/25 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-100/50 dark:border-emerald-905 transition active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-0.5 leading-none shadow-xs"
              id="steps-add-5000-btn"
            >
              <span className="text-xs">⚡️</span>
              <span>+5K Power</span>
            </button>
          </div>
        </div>

      </div>

      {/* 4. Active Customized Fitness / Workout Section */}
      <div className="bg-white dark:bg-[#18181b] p-4.5 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-black text-rose-500 dark:text-lime-400 tracking-widest font-mono block">
              🌱 PROGRESSIVE Overload Schedule (LEVEL {activeLevel.level})
            </span>
            <h3 className="text-sm font-black text-zinc-900 dark:text-white capitalize flex items-center gap-1.5 mt-0.5">
               Gym & Muscle Shaper Schedule
            </h3>
          </div>
          <span className="text-[10px] font-bold bg-zinc-100 text-zinc-700 dark:bg-lime-950/30 dark:text-lime-400 px-3 py-1 rounded-full border border-zinc-200 dark:border-lime-900/30 font-mono self-start uppercase">
            {completedWorkoutCount} / {scaleWorkoutIntensity.length} Completed
          </span>
        </div>

        {/* Informative progressive level status banner */}
        <div className="p-3 bg-zinc-50 dark:bg-[#0c0c0e]/60 border border-zinc-150 dark:border-zinc-800/50 rounded-2xl flex items-start gap-2">
          <Zap className="w-4 h-4 text-lime-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[10.5px] font-extrabold text-zinc-800 dark:text-zinc-250 leading-tight">
              Level {activeLevel.level} Active Intensity: {activeLevel.intensity}
            </p>
            <p className="text-[9.5px] text-zinc-400 leading-tight mt-0.5">
              {activeLevel.desc} Complete daily movements to accumulate XP points and unlock extreme intensities!
            </p>
          </div>
        </div>

        {/* Exercises List (Dynamically filtered and progressive-overloaded based on Level) */}
        <div className="flex flex-col gap-2.5">
          {scaleWorkoutIntensity.map((ex) => {
            const isCompleted = (dailyLog?.exercisesCompleted || []).includes(ex.id);
            return (
              <div
                key={ex.id}
                className={`p-3 rounded-2xl border transition duration-200 relative ${
                  isCompleted
                    ? 'bg-lime-500/10 border-lime-500/25 text-zinc-900 dark:text-white'
                    : 'bg-zinc-50/50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-850'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-3">
                    <span className="text-[8.5px] uppercase font-black text-zinc-400 dark:text-zinc-500 font-mono tracking-wider block">
                      {ex.targetMuscle} • {ex.sets} Sets
                    </span>
                    <h4 className="text-xs font-black text-zinc-850 dark:text-zinc-200 mt-0.5">
                      {ex.name}
                    </h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight mt-1">
                      {ex.instructions}
                    </p>
                    <div className="mt-2 text-[9px] text-lime-600 dark:text-lime-400 font-extrabold font-mono uppercase tracking-wider flex items-center gap-1 leading-none">
                      <span>Reps target: {ex.reps}</span>
                      <span>•</span>
                      <span className="text-zinc-400 font-bold">+{ex.points} Points XP</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleExercise(ex.id, ex.points)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition active:scale-90 cursor-pointer ${
                      isCompleted
                        ? 'bg-lime-400 text-black shadow-md border border-lime-500/10'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-505 border border-zinc-200 dark:border-zinc-700/60'
                    }`}
                    id={`toggle-ex-${ex.id}`}
                  >
                    <CheckSquare className="w-4 h-4 cursor-pointer" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* -------------------- DYNAMIC EVOLUTIONARY LEVEL PROGRESSION TREE CHART -------------------- */}
        <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-3 mt-1.5">
          <button
            onClick={() => setShowTreeRoadmap(!showTreeRoadmap)}
            className="w-full flex justify-between items-center bg-zinc-50 dark:bg-[#0c0c0e]/50 py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800/60 text-[10.5px] font-black uppercase tracking-wider text-zinc-700 dark:text-lime-405 dark:text-lime-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 transition select-none cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-lime-550 dark:text-lime-400" />
              Evolutionary Level Progress Tree Chart
            </span>
            <ChevronDown className={`w-4 h-4 transition duration-200 ${showTreeRoadmap ? 'rotate-180 text-lime-400' : 'text-zinc-400'}`} />
          </button>

          <AnimatePresence>
            {showTreeRoadmap && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3.5 pb-2 px-1 flex flex-col gap-4 bg-transparent">
                  
                  {/* Explanatory text header */}
                  <p className="text-[10px] text-zinc-400 leading-normal mb-1 font-sans">
                    🌱 As your points increase from physical exercises and healthy hydration limits, you automatically advance through 6 evolutionary milestones! Each level level-up is complete with heavier intensity multipliers and dynamic schedule unlocking:
                  </p>

                  {/* Vertical Progress Roadmap Tree */}
                  <div className="relative pl-3.5 flex flex-col gap-4">
                    {/* Glowing vertical connector strip line */}
                    <div className="absolute left-[25px] top-4 bottom-14 w-1 bg-zinc-200 dark:bg-zinc-800 rounded-full z-0">
                      <div 
                        className="bg-lime-500 dark:bg-lime-400 w-full rounded-full transition-all duration-300" 
                        style={{ height: `${Math.max(0, Math.min(100, (activeLevel.level - 1) * 20))}%` }}
                      ></div>
                    </div>

                    {levelMilestones.map((ml) => {
                      const isActive = ml.num === activeLevel.level;
                      const isUnlocked = ml.num < activeLevel.level;
                      const isLocked = ml.num > activeLevel.level;

                      return (
                        <div key={ml.num} className="relative z-10 flex gap-4.5 items-start">
                          
                          {/* Left node indicator badge frame */}
                          <div className={`w-6.5 w-[26px] h-6.5 h-[26px] rounded-full flex items-center justify-center text-xs shrink-0 font-bold border-2 transition duration-200 ${
                            isActive
                              ? 'bg-lime-500 border-lime-500 text-zinc-950 shadow-lg shadow-lime-500/40 ring-4 ring-lime-500/20 dark:bg-lime-400 dark:border-lime-400 dark:text-black dark:ring-lime-400/20 animate-pulse'
                              : isUnlocked
                              ? 'bg-emerald-500 border-emerald-500 text-white dark:bg-zinc-900 dark:border-emerald-555'
                              : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-250 dark:border-zinc-800 text-zinc-400'
                          }`}>
                            {isUnlocked ? '✓' : ml.badge}
                          </div>

                          {/* Right card content detailing unlock features */}
                          <div className={`flex-1 p-3 rounded-2xl border transition duration-150 ${
                            isActive 
                              ? 'bg-lime-50/10 border-lime-200 dark:bg-zinc-850/80 dark:border-lime-400/30 shadow-xs' 
                              : isUnlocked
                              ? 'bg-zinc-50/40 dark:bg-zinc-900/10 border-zinc-200 dark:border-zinc-800/40 opacity-75'
                              : 'bg-zinc-50/20 dark:bg-zinc-900/5 border-dashed border-zinc-200 dark:border-zinc-800/20 opacity-55'
                          }`}>
                            
                            <div className="flex flex-wrap justify-between items-center gap-1">
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 leading-none">
                                  Level {ml.num}: {ml.name}
                                </h4>
                                {isActive && (
                                  <span className="text-[7.5px] font-black uppercase text-lime-650 dark:text-lime-400 font-mono tracking-widest animate-pulse">
                                     Current
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] font-mono font-bold text-zinc-400">
                                {ml.xp === 0 ? 'Baseline' : `${ml.xp} XP`}
                              </span>
                            </div>

                            <p className="text-[9.5px] text-[#2c5282] dark:text-lime-450 font-extrabold font-mono uppercase tracking-wider mt-1 leading-none">
                              Intensity: {ml.intensity}
                            </p>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight mt-1">
                              <strong className="text-zinc-650 dark:text-zinc-300 font-bold">Unlocks:</strong> {ml.unlocks}
                            </p>

                            {/* Locked countdown info */}
                            {isLocked && (
                              <div className="mt-2 text-[8.5px] text-zinc-400 font-semibold font-mono flex items-center gap-1.5 leading-none">
                                <Lock className="w-2.5 h-2.5 text-zinc-400" /> Locked • Needs {ml.xp - totalPoints} XP more to unlock
                              </div>
                            )}

                          </div>

                        </div>
                      );
                    })}

                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* 5. Food Logger History - Logged items list with absolute custom coordinates */}
      <div className="bg-white dark:bg-[#18181b] p-4.5 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider font-mono">PORTION RECORD LOG</span>
          </div>
          <button
            onClick={() => onOpenFoodLogger(null)}
            className="text-[10px] font-bold text-zinc-800 dark:text-lime-400 flex items-center gap-1 bg-zinc-100 dark:bg-lime-950/20 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-lime-900/40 hover:underline transition select-none cursor-pointer"
            id="open-food-logger-inline-btn"
          >
            <Plus className="w-3.5 h-3.5" /> Log Custom Meal
          </button>
        </div>

        {loggedEaten.length === 0 ? (
          <div className="py-7 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-904 dark:bg-zinc-900/10 border border-dashed border-zinc-200 dark:border-zinc-800/60 text-zinc-400 dark:text-zinc-500 text-[11px] font-medium leading-relaxed px-4">
            🍽️ No foods logged yet. Click any macro button or "Log Custom Meal" to track fresh organic veggies, fruits, meats or hand-made food items.
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
            {loggedEaten.map((f, i) => (
              <div key={f.id || i} className="p-2.5 rounded-xl bg-zinc-50/50 dark:bg-[#0c0c0e]/55 border border-zinc-200/80 dark:border-zinc-805 dark:border-zinc-800/60 flex justify-between items-center shadow-xs">
                <div className="flex-1 pr-2">
                  <h5 className="text-[11.5px] font-extrabold text-zinc-850 dark:text-zinc-200 leading-tight">
                    {f.name} <span className="text-[9px] font-mono font-normal text-zinc-400">({f.servings}x portion)</span>
                  </h5>
                  <p className="text-[9px] text-[#4a5568] dark:text-zinc-405 font-mono mt-0.5">
                    P: {f.protein}g • C: {f.carbs}g • F: {f.fat}g
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-zinc-700 dark:text-zinc-300 font-mono">
                    {f.calories} kcal
                  </span>
                  <button
                    onClick={() => handleRemoveFood(i)}
                    className="w-6.5 h-6.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-zinc-800 text-rose-500 flex items-center justify-center transition cursor-pointer"
                    id={`remove-food-btn-${i}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Traditional Nutrition Tips for selected country */}
      <div className="bg-slate-900/10 dark:bg-zinc-900/40 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-805 dark:border-zinc-800/70 flex flex-col gap-2 shadow-xs">
        <span className="text-[10px] font-bold uppercase text-zinc-850 dark:text-lime-400 tracking-wider leading-none font-mono">
          {userProfile.country} Staple Nutrition Report
        </span>
        <p className="text-[11.5px] text-zinc-600 dark:text-zinc-400 leading-normal font-sans">
          {regionalFact.summary}
        </p>
        <div className="text-[10px] text-zinc-850 dark:text-orange-400 font-bold leading-tight border-t border-zinc-200 dark:border-zinc-800/60 pt-2 flex flex-wrap items-center gap-1.5 font-sans italic">
          <span>💡 Healthy Swap rule:</span>
          <span className="font-normal text-zinc-550 dark:text-zinc-400 font-sans not-italic">{regionalFact.healthySwap}</span>
        </div>
      </div>

      {/* 7. Mindset Motivation Display */}
      <div className="bg-gradient-to-r from-emerald-600 to-lime-500 text-white dark:text-zinc-950 p-5 rounded-3xl flex flex-col justify-between min-h-[140px] shadow-sm relative overflow-hidden">
        <div className="absolute right-3 bottom-0 opacity-10 text-[64px] pointer-events-none select-none">
          ⚡
        </div>
        <div className="relative z-10 flex flex-col justify-between h-full flex-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-white/80 dark:text-zinc-950/80 mb-2 block leading-none">
            MINDSET MOTIVATION
          </span>
          <h3 className="text-sm font-serif italic font-bold leading-relaxed mb-4 text-white dark:text-zinc-900">
            {getMotivationQuote()}
          </h3>
          <div className="flex justify-between items-end border-t border-white/10 dark:border-zinc-950/15 pt-2 text-[9px] font-bold">
            <span className="uppercase tracking-wider">STAY SHAPING</span>
            <span>⚡️ PROGRESS PLAN</span>
          </div>
        </div>
      </div>

      {/* 8. Daily Tasks / Progress Checklist */}
      <div className="bg-white dark:bg-[#18181b] p-4.5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col gap-2.5 justify-center">
        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block font-mono">
          DAILY STREAK KEY TASKS
        </span>
        <div className="flex flex-col gap-2 text-xs">
          
          <div className="flex items-center gap-2.5">
            <div className={`p-0.5 rounded-full ${dailyLog.waterIntake >= computedTargets.water ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-700'}`}>
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className={`text-[11px] font-semibold ${dailyLog.waterIntake >= computedTargets.water ? 'text-zinc-400 dark:text-zinc-550 line-through' : 'text-zinc-700 dark:text-zinc-300'}`}>
              Hydration target ({dailyLog.waterIntake}/{computedTargets.water} ml)
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className={`p-0.5 rounded-full ${dailyLog.stepsWalked >= computedTargets.steps ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-700'}`}>
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className={`text-[11px] font-semibold ${dailyLog.stepsWalked >= computedTargets.steps ? 'text-zinc-400 dark:text-zinc-550 line-through' : 'text-zinc-700 dark:text-zinc-300'}`}>
              Steps milestone ({dailyLog.stepsWalked.toLocaleString()}/{computedTargets.steps.toLocaleString()})
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className={`p-0.5 rounded-full ${isWorkoutFinished ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-700'}`}>
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className={`text-[11px] font-semibold ${isWorkoutFinished ? 'text-zinc-400 dark:text-zinc-550 line-through' : 'text-zinc-700 dark:text-zinc-300'}`}>
              Complete Level {activeLevel.level} schedule list ({completedWorkoutCount}/{scaleWorkoutIntensity.length})
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className={`p-0.5 rounded-full ${loggedNutrition.calories > 0 && loggedNutrition.calories <= computedTargets.calories + 100 ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-700'}`}>
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className={`text-[11px] font-semibold ${loggedNutrition.calories > 0 && loggedNutrition.calories <= computedTargets.calories + 100 ? 'text-zinc-400 dark:text-zinc-550 line-through' : 'text-zinc-700 dark:text-zinc-300'}`}>
              Portions within calories budget ({loggedNutrition.calories}/{computedTargets.calories} kcal)
            </span>
          </div>

        </div>
      </div>

      {/* 9. Coaching Suggestions Loops */}
      <div className="bg-white dark:bg-[#18181b] p-4.5 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 flex flex-col gap-2 shadow-xs">
        <span className="text-[10px] font-bold uppercase text-zinc-900 dark:text-lime-400 tracking-wider flex items-center gap-1 font-mono">
          <Award className="w-4 h-4 text-lime-500 animate-pulse" /> Continuous Sports Shaper Coaching Suggestions
        </span>
        <div className="flex flex-col gap-2 mt-1">
          {dailyAdvices.map((adv, idx) => (
            <div key={idx} className="flex gap-2 items-start text-[11.5px] text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold">
              <span className="text-lime-500 dark:text-lime-400 font-extrabold mt-0.5">•</span>
              <span>{adv}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
