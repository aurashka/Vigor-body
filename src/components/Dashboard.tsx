/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, DailyLog, WorkoutExercise, FoodEaten, FoodItem } from '../types';
import { calculateProfileTargets, generateWorkoutPlan, getImprovementAdvice } from '../utils';
import { 
  Droplet, Flame, Footprints, CheckSquare, Plus, Edit3, Save, 
  Trash2, Dumbbell, Sparkles, TrendingUp, ChevronRight, HelpCircle, 
  Award, ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';
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

  // Manual inputs for editing targets & metrics inline if requested
  const [isEditingSteps, setIsEditingSteps] = useState(false);
  const [stepsInput, setStepsInput] = useState(dailyLog.stepsWalked.toString());

  const [isEditingWater, setIsEditingWater] = useState(false);
  const [waterInput, setWaterInput] = useState(dailyLog.waterIntake.toString());

  // Log calculation helpers
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

  const completedWorkoutCount = dailyLog.exercisesCompleted.length;
  const isWorkoutFinished = completedWorkoutCount >= Math.max(1, workoutPlan.length - 1);

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

  // Water helper increments
  const handleAddWater = (amount: number) => {
    const current = dailyLog.waterIntake || 0;
    const targetVal = Math.max(0, current + amount);
    onUpdateDailyLog({ waterIntake: targetVal });
    setWaterInput(targetVal.toString());
  };

  const handleSaveWaterInput = () => {
    const val = parseInt(waterInput) || 0;
    onUpdateDailyLog({ waterIntake: Math.max(0, val) });
    setIsEditingWater(false);
  };

  // Save steps handler
  const handleSaveStepsInput = () => {
    const val = parseInt(stepsInput) || 0;
    onUpdateDailyLog({ stepsWalked: Math.max(0, val) });
    setIsEditingSteps(false);
  };

  const handleRemoveFood = (idx: number) => {
    const nextFoods = [...loggedEaten];
    nextFoods.splice(idx, 1);
    onUpdateDailyLog({ foodsEaten: nextFoods });
  };

  // Percentages for SVG visual gauges
  const calPercent = Math.min(100, Math.round((loggedNutrition.calories / computedTargets.calories) * 100));
  const waterPercent = Math.min(100, Math.round((dailyLog.waterIntake / computedTargets.water) * 100));
  const stepsPercent = Math.min(100, Math.round((dailyLog.stepsWalked / computedTargets.steps) * 100));

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

  return (
    <div className="flex-1 flex flex-col gap-5 p-4 pb-12 font-sans bg-zinc-50 dark:bg-[#09090b]">
      
      {/* 1. Header Streaks Profile Card */}
      <div className="flex justify-between items-center bg-white dark:bg-[#18181b] px-4 py-3.5 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-lime-950/40 flex items-center justify-center text-zinc-900 dark:text-lime-400 text-lg font-bold border border-zinc-200 dark:border-lime-900/40">
            {userProfile.gender === 'male' ? '🧔🏽‍♂️' : userProfile.gender === 'female' ? '👩🏻‍💼' : '🧑🏼‍💻'}
          </div>
          <div>
            <h2 className="text-sm font-sans font-black text-zinc-900 dark:text-white leading-tight">
              Hello, {userProfile.name}!
            </h2>
            <p className="text-[10px] text-zinc-400 leading-none mt-1 font-mono uppercase tracking-wider">
              Level: {totalPoints > 400 ? 'Fitness Gladiator' : 'Adaptive Shaper'} • {userProfile.country}
            </p>
          </div>
        </div>

        {/* Streaks pill */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-full text-[11px] font-bold tracking-wider text-lime-400 uppercase py-1.5 px-3">
          <Flame className="w-3.5 h-3.5 text-lime-400 animate-pulse" />
          <span className="font-mono">{streakCount}D Streak</span>
        </div>
      </div>

      {/* 2. Unified Nutrition Dashboard Circle Gauge */}
      <div className="bg-white dark:bg-[#18181b] p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">PORTION CALORIES BUDGET</span>
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
              className="stroke-zinc-100 dark:stroke-zinc-800 fill-none"
              strokeWidth="11"
            />
            {/* Active gauge percentage bar */}
            <circle
              cx="80"
              cy="80"
              r="68"
              className="stroke-zinc-800 dark:stroke-lime-400 fill-none transition-all duration-500"
              strokeWidth="11"
              strokeDasharray={2 * Math.PI * 68}
              strokeDashoffset={2 * Math.PI * 68 * (1 - calPercent / 100)}
              strokeLinecap="round"
            />
          </svg>

          {/* Internal content numbers */}
          <div className="absolute text-center flex flex-col">
            <span className="text-xs font-semibold text-zinc-400 tracking-wider">LOGGED</span>
            <span className="text-2xl font-black text-zinc-900 dark:text-white font-mono leading-none my-1">
              {loggedNutrition.calories}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
              of {computedTargets.calories} kcal
            </span>
            <span className="text-xs font-bold font-mono text-zinc-800 dark:text-lime-400 mt-1">{calPercent}%</span>
          </div>
        </div>

        {/* Clickable Macro Targets Breakdown (Interactive Macro click as requested) */}
        <div className="w-full grid grid-cols-3 gap-2 border-t border-zinc-200 dark:border-zinc-800/80 pt-4 mt-2">
          
          <button 
            onClick={() => onOpenFoodLogger('protein')}
            className="flex flex-col items-center bg-zinc-50 dark:bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/65 hover:border-lime-400 active:scale-95 transition duration-150"
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
            className="flex flex-col items-center bg-zinc-50 dark:bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/65 hover:border-orange-400 active:scale-95 transition duration-150"
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
            className="flex flex-col items-center bg-zinc-50 dark:bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/65 hover:border-blue-400 active:scale-95 transition duration-150"
            id="click-macro-fat-btn"
          >
            <span className="text-[9px] text-[#4c51bf] dark:text-blue-400 uppercase tracking-widest font-black flex items-center gap-1">
              🥑 Fat
            </span>
            <span className="text-sm font-black text-zinc-800 dark:text-white font-mono leading-tight mt-1">
              {loggedNutrition.fat.toFixed(0)} <span className="text-[10px] font-bold text-zinc-400">/ {computedTargets.fat}g</span>
            </span>
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-blue-600 dark:bg-blue-400 h-full rounded-full transition-all" 
                style={{ width: `${Math.min(100, (loggedNutrition.fat / computedTargets.fat) * 100)}%` }}
              ></div>
            </div>
            <span className="text-[8px] text-zinc-400 mt-1 uppercase font-bold hover:underline">Click to Log</span>
          </button>

        </div>
      </div>

      {/* 3. Water and Steps Trackers Card */}
      <div className="grid grid-cols-2 gap-3.5">
        
        {/* Hydro tracking */}
        <div className="bg-white dark:bg-[#18181b] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2b6cb0] dark:text-cyan-400 flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-[#3182ce] dark:text-cyan-400 fill-current animate-pulse" /> Water
              </span>
              <span className="text-[9px] text-zinc-400 font-mono">{waterPercent}%</span>
            </div>
            
            {isEditingWater ? (
              <div className="flex items-center gap-1 my-1">
                <input
                  type="number"
                  value={waterInput}
                  onChange={(e) => setWaterInput(e.target.value)}
                  className="w-16 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:bg-zinc-800 dark:text-white focus:outline-none"
                  id="water-edit-input"
                />
                <button
                  onClick={handleSaveWaterInput}
                  className="p-1 rounded bg-zinc-900 dark:bg-lime-400 text-white dark:text-black font-bold hover:bg-zinc-800 transition"
                  id="water-edit-save-btn"
                >
                  <Save className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-base font-black text-zinc-800 dark:text-white font-mono leading-none">
                  {dailyLog.waterIntake} <span className="text-[10px] font-normal text-zinc-500">ml</span>
                </span>
                <button 
                  onClick={() => setIsEditingWater(true)} 
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  id="edit-water-icon-btn"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-[9px] text-zinc-400 font-mono">Goal: {computedTargets.water} ml</p>
          </div>

          {/* Quick increments buttons */}
          <div className="flex gap-1.5 mt-3">
            <button
              onClick={() => handleAddWater(250)}
              className="flex-1 py-1 rounded-lg bg-cyan-50 dark:bg-zinc-850 hover:bg-cyan-100 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold border border-cyan-100/50 dark:border-zinc-700 transition active:scale-95"
              id="water-add-250-btn"
            >
              +250ml
            </button>
            <button
              onClick={() => handleAddWater(500)}
              className="flex-1 py-1 rounded-lg bg-cyan-50 dark:bg-zinc-850 hover:bg-cyan-100 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold border border-cyan-100/50 dark:border-zinc-700 transition active:scale-95"
              id="water-add-500-btn"
            >
              +500ml
            </button>
          </div>
        </div>

        {/* Steps tracking */}
        <div className="bg-white dark:bg-[#18181b] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2c5282] dark:text-lime-400 flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5 text-zinc-500 dark:text-lime-450" /> Walk Steps
              </span>
              <span className="text-[9px] text-zinc-400 font-mono">{stepsPercent}%</span>
            </div>

            {isEditingSteps ? (
              <div className="flex items-center gap-1 my-1">
                <input
                  type="number"
                  value={stepsInput}
                  onChange={(e) => setStepsInput(e.target.value)}
                  className="w-16 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:bg-zinc-800 dark:text-white focus:outline-none"
                  id="steps-edit-input"
                />
                <button
                  onClick={handleSaveStepsInput}
                  className="p-1 rounded bg-zinc-900 dark:bg-lime-400 text-white dark:text-black font-bold hover:bg-zinc-800 transition"
                  id="steps-edit-save-btn"
                >
                  <Save className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-base font-black text-zinc-800 dark:text-white font-mono leading-none">
                  {dailyLog.stepsWalked.toLocaleString()} <span className="text-[10px] font-normal text-zinc-500 font-sans">steps</span>
                </span>
                <button 
                  onClick={() => setIsEditingSteps(true)} 
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  id="edit-steps-icon-btn"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-[9px] text-zinc-400 font-mono">Goal: {computedTargets.steps.toLocaleString()}</p>
          </div>

          {/* Quick steps increment */}
          <div className="flex gap-1.5 mt-3">
            <button
              onClick={() => {
                const nextVal = (dailyLog.stepsWalked || 0) + 1000;
                onUpdateDailyLog({ stepsWalked: nextVal });
                setStepsInput(nextVal.toString());
              }}
              className="flex-1 py-1 rounded-lg bg-lime-50 dark:bg-zinc-850 hover:bg-lime-100 text-lime-600 dark:text-lime-400 text-[10px] font-bold border border-lime-100/50 dark:border-zinc-700 transition active:scale-95"
              id="steps-add-1000-btn"
            >
              +1k steps
            </button>
            <button
              onClick={() => {
                const nextVal = (dailyLog.stepsWalked || 0) + 2500;
                onUpdateDailyLog({ stepsWalked: nextVal });
                setStepsInput(nextVal.toString());
              }}
              className="flex-1 py-1 rounded-lg bg-lime-50 dark:bg-zinc-850 hover:bg-lime-100 text-lime-600 dark:text-lime-400 text-[10px] font-bold border border-lime-100/50 dark:border-zinc-700 transition active:scale-95"
              id="steps-add-2500-btn"
            >
              +2.5K
            </button>
          </div>
        </div>

      </div>

      {/* 4. Active Customized Fitness / Body Shaper Workouts */}
      <div className="bg-white dark:bg-[#18181b] p-4.5 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-lime-400 tracking-wider font-mono">
              ⚡ {userProfile.targetBody.replace('_', ' ')} Workouts
            </span>
            <h3 className="text-sm font-black text-zinc-900 dark:text-white capitalize flex items-center gap-1 mt-0.5">
               Gym & Shaper Schedule
            </h3>
          </div>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-lime-950/30 dark:text-lime-400 px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-lime-900/40 font-mono">
            {completedWorkoutCount} / {workoutPlan.length} Done
          </span>
        </div>

        {/* Exercises List */}
        <div className="flex flex-col gap-2">
          {workoutPlan.map((ex) => {
            const isCompleted = dailyLog.exercisesCompleted.includes(ex.id);
            return (
              <div
                key={ex.id}
                className={`p-3 rounded-2xl border transition relative duration-200 ${
                  isCompleted
                    ? 'bg-lime-500/10 border-lime-500/25'
                    : 'bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/60'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-3">
                    <span className="text-[9px] uppercase font-bold text-zinc-400 font-mono tracking-wider block">
                      {ex.targetMuscle} • {ex.sets} Sets
                    </span>
                    <h4 className="text-xs font-black text-zinc-855 dark:text-zinc-200 mt-0.5">
                      {ex.name}
                    </h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-450 leading-tight mt-1">
                      {ex.instructions}
                    </p>
                    <div className="mt-2 text-[9px] text-[#2c5282] dark:text-lime-450 font-extrabold font-mono uppercase tracking-wider">
                      Target reps: {ex.reps} • +{ex.points} XP
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleExercise(ex.id, ex.points)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition active:scale-95 ${
                      isCompleted
                        ? 'bg-lime-404 text-lime-600 dark:text-lime-400 shadow-xs font-bold'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border border-zinc-300 dark:border-zinc-700/80'
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
      </div>

      {/* 5. Food Logger History - Logged items with Delete button */}
      <div className="bg-[#18181b] p-4.5 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">PORTION RECORD LOG</span>
          </div>
          <button
            onClick={() => onOpenFoodLogger(null)}
            className="text-[10px] font-bold text-zinc-800 dark:text-lime-400 flex items-center gap-1 bg-zinc-100 dark:bg-lime-950/20 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-lime-900/40 hover:underline transition"
            id="open-food-logger-inline-btn"
          >
            <Plus className="w-3.5 h-3.5" /> Log Custom Meal
          </button>
        </div>

        {loggedEaten.length === 0 ? (
          <div className="py-7 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-800/60 text-zinc-400 dark:text-zinc-500 text-[11px] font-medium">
            🍽️ No foods logged yet. Click any macro metric above or the button to log home-made/cooked regional foods.
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
            {loggedEaten.map((f, i) => (
              <div key={f.id || i} className="p-2.5 rounded-xl bg-zinc-50/50 dark:bg-[#0c0c0e]/50 border border-zinc-200 dark:border-zinc-800/60 flex justify-between items-center shadow-xs">
                <div className="flex-1 pr-2">
                  <h5 className="text-[11.5px] font-extrabold text-zinc-800 dark:text-zinc-200 leading-tight">
                    {f.name} <span className="text-[9px] font-mono font-normal text-zinc-500">({f.servings}x servings)</span>
                  </h5>
                  <p className="text-[9px] text-[#4a5568] dark:text-zinc-400 font-mono mt-0.5">
                    P: {f.protein}g • C: {f.carbs}g • F: {f.fat}g
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-zinc-700 dark:text-zinc-350 font-mono">
                    {f.calories} kcal
                  </span>
                  <button
                    onClick={() => handleRemoveFood(i)}
                    className="w-6 h-6 rounded bg-rose-50/60 hover:bg-rose-100 dark:bg-zinc-800 text-rose-500 flex items-center justify-center transition"
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
      <div className="bg-slate-900/10 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/70 flex flex-col gap-2 shadow-xs">
        <span className="text-[10px] font-bold uppercase text-zinc-805 dark:text-lime-404 text-slate-800 dark:text-lime-400 tracking-wider leading-none">
          {userProfile.country} Staple Nutrition Report
        </span>
        <p className="text-[11.5px] text-zinc-650 dark:text-zinc-350 leading-normal font-sans">
          {regionalFact.summary}
        </p>
        <div className="text-[10px] text-slate-850 dark:text-orange-400 font-bold leading-tight border-t border-zinc-200 dark:border-zinc-800/80 pt-2 flex items-center gap-1.5 font-sans italic">
          <span>💡 Healthy Swap rule:</span>
          <span className="font-normal text-zinc-500 dark:text-zinc-400 font-sans not-italic">{regionalFact.healthySwap}</span>
        </div>
      </div>

      {/* 7. Warm Immersive Motivation Display */}
      <div className="bg-lime-400 text-zinc-950 p-5 rounded-2xl flex flex-col justify-between min-h-[140px] shadow-md relative overflow-hidden">
        <div className="absolute right-3 bottom-0 opacity-10 text-[64px] pointer-events-none">
          ⚡
        </div>
        <div className="relative z-10 flex flex-col justify-between h-full flex-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-950/80 mb-2 block leading-none">
            MINDSET MOTIVATION
          </span>
          <h3 className="text-base font-serif italic font-bold leading-tight text-zinc-900 mb-4">
            {getMotivationQuote()}
          </h3>
          <div className="flex justify-between items-end border-t border-zinc-950/10 pt-2 text-[10px] font-bold bg-[#bfdbfe]/0">
            <span className="uppercase tracking-wider">STAY SHAPING</span>
            <span>⚡️ VIGOR</span>
          </div>
        </div>
      </div>

      {/* 8. Daily Tasks / Progress Checklist */}
      <div className="bg-white dark:bg-[#18181b] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col gap-2 justify-center">
        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
          DAILY STREAK KEY TASKS
        </span>
        <div className="flex flex-col gap-1.5 text-xs">
          
          <div className="flex items-center gap-2.5">
            <div className={`p-0.5 rounded-full ${dailyLog.waterIntake >= computedTargets.water ? 'text-lime-600 dark:text-lime-400' : 'text-zinc-300 dark:text-zinc-650'}`}>
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className={`text-[11px] font-medium ${dailyLog.waterIntake >= computedTargets.water ? 'text-zinc-400 dark:text-zinc-500 strike-through line-through' : 'text-zinc-700 dark:text-zinc-300'}`}>
              Hydration target ({dailyLog.waterIntake}/{computedTargets.water} ml)
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className={`p-0.5 rounded-full ${dailyLog.stepsWalked >= computedTargets.steps ? 'text-lime-600 dark:text-lime-400' : 'text-zinc-300 dark:text-zinc-650'}`}>
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className={`text-[11px] font-medium ${dailyLog.stepsWalked >= computedTargets.steps ? 'text-zinc-400 dark:text-zinc-500 strike-through line-through' : 'text-zinc-700 dark:text-zinc-300'}`}>
              Steps milestone ({dailyLog.stepsWalked.toLocaleString()}/{computedTargets.steps.toLocaleString()})
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className={`p-0.5 rounded-full ${isWorkoutFinished ? 'text-lime-600 dark:text-lime-400' : 'text-zinc-300 dark:text-zinc-650'}`}>
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className={`text-[11px] font-medium ${isWorkoutFinished ? 'text-zinc-400 dark:text-zinc-500 strike-through line-through' : 'text-zinc-700 dark:text-zinc-300'}`}>
              Complete daily shaper/gym workout list
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className={`p-0.5 rounded-full ${loggedNutrition.calories > 0 && loggedNutrition.calories <= computedTargets.calories + 100 ? 'text-lime-600 dark:text-lime-400' : 'text-zinc-300 dark:text-zinc-650'}`}>
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className={`text-[11px] font-medium ${loggedNutrition.calories > 0 && loggedNutrition.calories <= computedTargets.calories + 100 ? 'text-zinc-400 dark:text-zinc-500 strike-through line-through' : 'text-zinc-700 dark:text-zinc-300'}`}>
              Portions within calories ceiling ({loggedNutrition.calories}/{computedTargets.calories} kcal)
            </span>
          </div>

        </div>
      </div>

      {/* 9. Daily Improvement Changes Suggestions coaching loop */}
      <div className="bg-[#18181b] p-4.5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 flex flex-col gap-2 shadow-xs">
        <span className="text-[10px] font-bold uppercase text-slate-800 dark:text-lime-400 tracking-wider flex items-center gap-1 font-mono uppercase">
          <Award className="w-4 h-4 text-lime-500" /> Continuous Shaper Suggestions
        </span>
        <div className="flex flex-col gap-2 mt-0.5">
          {dailyAdvices.map((adv, idx) => (
            <div key={idx} className="flex gap-2 items-start text-[11px] text-zinc-600 dark:text-zinc-400 leading-tight">
              <span className="text-lime-500 dark:text-lime-400 font-extrabold mt-0.5">•</span>
              <span>{adv}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
