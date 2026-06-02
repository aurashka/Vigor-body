/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, DailyLog, WorkoutExercise, FoodItem } from './types';
import { EXERCISES_DATABASE } from './data';

export interface ComputedTargets {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  water: number; // ml
  steps: number;
  caloriesBurn: number; // active sport burn goal
}

/**
 * Mifflin-St Jeor formula + exercise multiplier + goal additions
 */
export function calculateProfileTargets(profile: UserProfile): ComputedTargets {
  // 1. Calculate BMR
  let bmr = 0;
  if (profile.gender === 'male') {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  } else if (profile.gender === 'female') {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  } else {
    // average
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 78;
  }

  // 2. Multiply by exercise level factor
  let multiplier = 1.2;
  if (profile.exerciseLevel === 'intermediate') multiplier = 1.375;
  if (profile.exerciseLevel === 'advanced') multiplier = 1.55;

  let maintenanceCalories = Math.round(bmr * multiplier);

  // 3. Adjust based on target goal
  let targetCalories = maintenanceCalories;
  if (profile.targetBody === 'fat_loss') {
    targetCalories = Math.max(1200, Math.round(maintenanceCalories - 450));
  } else if (profile.targetBody === 'muscle_gain') {
    targetCalories = Math.round(maintenanceCalories + 300);
  } else if (profile.targetBody === 'strength_building') {
    targetCalories = Math.round(maintenanceCalories + 150);
  }

  // Allow custom override
  if (profile.caloriesTargetCustom) {
    targetCalories = profile.caloriesTargetCustom;
  }

  // 4. Portion ratios (Protein, Fat, Carbs) based on Target & Illness
  // Normal split: protein = 25%, fat = 25%, carbs = 50%
  // Diabetes: protein = 30%, fat = 30%, carbs = 40% (low glycemic index carbs focus)
  // Muscle Gain: protein = 30%, fat = 22%, carbs = 48%
  // Strength: protein = 28%, fat = 25%, carbs = 47%
  // Fat loss: protein = 32%, fat = 23%, carbs = 45% (retains muscle on deficit)
  let pPct = 0.25;
  let fPct = 0.25;
  let cPct = 0.50;

  if (profile.targetBody === 'muscle_gain') {
    pPct = 0.30; fPct = 0.22; cPct = 0.48;
  } else if (profile.targetBody === 'fat_loss') {
    pPct = 0.32; fPct = 0.23; cPct = 0.45;
  } else if (profile.targetBody === 'strength_building') {
    pPct = 0.28; fPct = 0.25; cPct = 0.47;
  }

  // Illness specific modifications
  if (profile.illness === 'diabetes') {
    pPct = 0.30;
    fPct = 0.30;
    cPct = 0.40; // Controlled insulin-conscious carbs
  } else if (profile.illness === 'hypertension') {
    fPct = 0.25; // Healthy fats ceiling
  }

  const calProtein = Math.round((targetCalories * pPct) / 4);
  const calFat = Math.round((targetCalories * fPct) / 9);
  const calCarbs = Math.round((targetCalories * cPct) / 4);

  // 5. Steps targets
  let steps = 7000;
  if (profile.exerciseLevel === 'intermediate') steps = 8500;
  if (profile.exerciseLevel === 'advanced') steps = 11000;

  if (profile.illness === 'joint_pain') {
    steps = Math.min(6500, steps - 1500); // lower impact walking constraints
  }

  // 6. Water target
  // base is weight (kg) * 35ml
  let water = Math.round(profile.weight * 35);
  if (profile.exerciseLevel === 'intermediate') water += 500;
  if (profile.exerciseLevel === 'advanced') water += 1000;
  // heart or renal indicators (e.g. general high BP is helped by healthy constant water)
  if (profile.illness === 'hypertension') {
    water += 300; // hydrate to decrease direct arterial loading
  }

  // 7. Active Calories Burn target
  let caloriesBurn = 250;
  if (profile.exerciseLevel === 'intermediate') caloriesBurn = 400;
  if (profile.exerciseLevel === 'advanced') caloriesBurn = 600;
  if (profile.illness === 'joint_pain') {
    caloriesBurn = Math.max(180, caloriesBurn - 100);
  }

  return {
    calories: targetCalories,
    protein: profile.proteinTargetCustom || calProtein,
    fat: profile.fatTargetCustom || calFat,
    carbs: profile.carbsTargetCustom || calCarbs,
    water: profile.waterTargetCustom || water,
    steps: profile.stepsTargetCustom || steps,
    caloriesBurn,
  };
}

/**
 * Filter exercises matching profile goal & illness
 */
export function generateWorkoutPlan(profile: UserProfile): WorkoutExercise[] {
  let matched: WorkoutExercise[] = [];

  // Filter based on body target focus
  if (profile.targetBody === 'fat_loss') {
    // higher reps, energetic movements
    matched = EXERCISES_DATABASE.filter(ex => 
      ['ex_brisk_walk', 'ex_jumping_jacks', 'ex_squats', 'ex_pushups', 'ex_plank', 'ex_glute_bridge'].includes(ex.id)
    );
  } else if (profile.targetBody === 'muscle_gain' || profile.targetBody === 'strength_building') {
    // solid hypertrophs
    matched = EXERCISES_DATABASE.filter(ex => 
      ['ex_joint_star', 'ex_squats', 'ex_pushups', 'ex_dumbbell_press', 'ex_dumbbell_rows', 'ex_bicep_curl', 'ex_lunges'].includes(ex.id)
    );
  } else {
    // tone & shape
    matched = EXERCISES_DATABASE.filter(ex => 
      ['ex_joint_star', 'ex_brisk_walk', 'ex_squats', 'ex_superman', 'ex_plank', 'ex_bench_dips', 'ex_glute_bridge'].includes(ex.id)
    );
  }

  // Adapt for joint pain or asthma
  return matched.map(ex => {
    if (profile.illness === 'joint_pain' && ex.alternativeName) {
      return {
        ...ex,
        name: ex.alternativeName,
        instructions: `JOINT-SAFE ALTERNATIVE: ${ex.instructions}. Perform gently inside pain-free range.`,
        reps: ex.reps.includes('mins') ? ex.reps : '10-12 reps (low force)',
      };
    }
    if (profile.illness === 'asthma' && ex.name === 'Speed Jumping Jacks') {
      return {
        ...ex,
        name: 'Steady-Pace Warmup Rotations',
        instructions: 'Paced walking movements to prevent asthma bronchospasms.',
        reps: '1 min smooth',
      };
    }
    return ex;
  });
}

/**
 * Format date key helper
 */
export function getTodayDateKey(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

/**
 * Dummy generator for country food queries
 */
export function searchFoodItems(query: string, countryCode: string, database: FoodItem[]): FoodItem[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) {
    // return default list sorting local foods first
    return [...database].sort((a, b) => {
      const aLocal = a.countries.includes(countryCode);
      const bLocal = b.countries.includes(countryCode);
      if (aLocal && !bLocal) return -1;
      if (!aLocal && bLocal) return 1;
      return 0;
    });
  }

  return database.filter(item => 
    item.name.toLowerCase().includes(normalizedQuery) ||
    item.category.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Returns dynamic advice based on daily intakes vs targets
 */
export function getImprovementAdvice(
  calories: number, targetCal: number,
  protein: number, targetProt: number,
  carbs: number, targetCarb: number,
  fat: number, targetFat: number,
  water: number, targetWater: number,
  steps: number, targetSteps: number,
  illness: string
): string[] {
  const advices: string[] = [];

  // Calorie advice
  if (calories > targetCal + 200) {
    advices.push(`Calories are currently over target by ${Math.round(calories - targetCal)} kcal. Consider reducing high density carbs or fats.`);
  } else if (calories < targetCal - 300) {
    advices.push(`You have a significant calorie deficit today. Add low-fat, high-protein local foods to retain active muscle tissue.`);
  }

  // Protein advice
  if (protein < targetProt - 15) {
    advices.push(`Protein intake is low. Focus on local protein options (e.g. Paneer, Tofu, Grilled Fish, or Egg Whites) to support shaper exercises.`);
  }

  // Carbs / Illness warnings
  if (illness === 'diabetes' && carbs > targetCarbsCheckLimit(targetCarb)) {
    advices.push(`🚨 Diabetes Warning: Your carbohydrate intake is quite high. Try substituting simple cooked rice or bread with steamed broccoli, high fiber yellow dal, or green salads.`);
  }

  // Water advice
  if (water < targetWater * 0.7) {
    advices.push(`Hydration is low. Drink 2 additional cups of water immediately to boost metabolic rate.`);
  }

  // Steps advice
  if (steps < targetSteps * 0.6) {
    advices.push(`Increase your steps walked to improve circulation. A quick 10-minute active stroll around the yard helps reach your milestone!`);
  }

  // Fallback
  if (advices.length === 0) {
    advices.push(`🌟 You are perfectly on track! Your portions and physical targets align beautifully with computed limits.`);
  }

  return advices;
}

function targetCarbsCheckLimit(target: number): number {
  return target + 20;
}

export interface RankLevelNode {
  level: number;
  rank: string;
  name: string;
  xp: number;
  xpMax: number;
  badge: string;
  intensity: string;
  unlocks: string;
  desc: string;
  rankGlowClass: string;
}

export const ALL_RANKS_MILESTONES: RankLevelNode[] = [
  {
    level: 1,
    rank: 'D-',
    name: 'Warmup Initiate',
    xp: 0,
    xpMax: 500,
    badge: '🌱',
    intensity: 'Gentle Pacing Warmup (1-2 Sets)',
    unlocks: 'Walking & Joint Mobility moves',
    desc: 'Focus on posture, simple mobility and muscle waking.',
    rankGlowClass: 'text-zinc-500 bg-zinc-100 dark:bg-zinc-900 border-zinc-200'
  },
  {
    level: 2,
    rank: 'D',
    name: 'Conditioning Prospect',
    xp: 501,
    xpMax: 2000,
    badge: '🤸🏼‍♀️',
    intensity: 'Moderate Stability (3 Sets, Base Reps)',
    unlocks: 'Squats, Pushups, Core Planks, Glute Bridges',
    desc: 'Introducing baseline calisthenics and core stabilizers.',
    rankGlowClass: 'text-zinc-700 dark:text-zinc-350 bg-zinc-200 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700'
  },
  {
    level: 3,
    rank: 'D+',
    name: 'Kinetic Trooper',
    xp: 2001,
    xpMax: 5000,
    badge: '🦾',
    intensity: 'Target Enduring (3 Sets, 12-15 reps)',
    unlocks: 'Dumbbell Rows, Bench Dips, Superman Back extension',
    desc: 'Muscular endurance expansion and structural alignment.',
    rankGlowClass: 'text-lime-600 dark:text-lime-400 bg-lime-50/50 dark:bg-lime-950/20 border-lime-300 dark:border-lime-700/50'
  },
  {
    level: 4,
    rank: 'C-',
    name: 'Vigor Cadet',
    xp: 5001,
    xpMax: 9000,
    badge: '🏋️',
    intensity: 'Hypertrophy Force (4 Sets)',
    unlocks: 'Floor Chest Press, Bicep Hammer curls & Lunges',
    desc: 'Targeted hypertrophic stimulation & active load increase.',
    rankGlowClass: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50'
  },
  {
    level: 5,
    rank: 'C',
    name: 'Iron Aspirant',
    xp: 9001,
    xpMax: 14000,
    badge: '🔥',
    intensity: 'Steady Conditioning (4 Sets, 45s Rest)',
    unlocks: 'Steady-paced conditioning work and custom meal limits',
    desc: 'Establishing high-performance muscle capacity.',
    rankGlowClass: 'text-blue-600 bg-blue-100 dark:bg-blue-950/45 border-blue-400'
  },
  {
    level: 6,
    rank: 'C+',
    name: 'Power Shaper',
    xp: 14001,
    xpMax: 20000,
    badge: '⚡',
    intensity: 'Advanced Intensity (4 Sets, 30s Rest)',
    unlocks: 'Schedules loaded with explosive fat-burn sets',
    desc: 'Boosting aerobic thresholds and recovery speed.',
    rankGlowClass: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 border-cyan-300'
  },
  {
    level: 7,
    rank: 'B-',
    name: 'Velocity Rookie',
    xp: 20001,
    xpMax: 28000,
    badge: '🏆',
    intensity: 'Dynamic Acceleration (4-5 Sets)',
    unlocks: 'Multi-joint compound dynamic actions',
    desc: 'Refining biomechanical speed and lean muscle mass.',
    rankGlowClass: 'text-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/40'
  },
  {
    level: 8,
    rank: 'B',
    name: 'Titanium Centurion',
    xp: 28001,
    xpMax: 38000,
    badge: '🛡️',
    intensity: 'Fatigue Resistance (5 Sets)',
    unlocks: 'Short rest hypertrophy giant sets',
    desc: 'High-fatigue stability supersets for metabolic conditioning.',
    rankGlowClass: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/45 border-emerald-400'
  },
  {
    level: 9,
    rank: 'B+',
    name: 'Stamina Harbinger',
    xp: 38001,
    xpMax: 50000,
    badge: '🎖️',
    intensity: 'Hyper-Volume Exhaustion (5 Sets)',
    unlocks: 'Peak glycogen depletion circuits',
    desc: 'Muscular endurance and peak performance acceleration.',
    rankGlowClass: 'text-green-500 bg-green-50 dark:bg-green-950/35 border-green-300'
  },
  {
    level: 10,
    rank: 'A-',
    name: 'Dynamic Dynamo',
    xp: 50001,
    xpMax: 64000,
    badge: '🌠',
    intensity: 'Elite Superload (5 Sets, 25s Rest)',
    unlocks: 'Continuous heart-rate metabolic burn sets',
    desc: 'Elite hypertrophy training regimes.',
    rankGlowClass: 'text-pink-550 dark:text-pink-400 bg-pink-50/50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-900/50'
  },
  {
    level: 11,
    rank: 'A',
    name: 'Apex Overload',
    xp: 64001,
    xpMax: 80000,
    badge: '🌋',
    intensity: 'Max Volumetric Resistance (5 Sets)',
    unlocks: 'Progressive load overload patterns',
    desc: 'Breaking strength plateaus with high-density intervals.',
    rankGlowClass: 'text-pink-600 bg-pink-100 border-pink-400 dark:bg-pink-950/40'
  },
  {
    level: 12,
    rank: 'A+',
    name: 'Shatter Overlord',
    xp: 80001,
    xpMax: 98000,
    badge: '☄️',
    intensity: 'Apex Hypertrophy (5-6 Sets)',
    unlocks: 'Custom dynamic meal macros adaptation',
    desc: 'Perfect portioning and maximum physical stamina.',
    rankGlowClass: 'text-rose-500 bg-rose-50 border-rose-300 dark:bg-rose-950/30'
  },
  {
    level: 13,
    rank: 'S',
    name: 'Gladiator Sovereign',
    xp: 98001,
    xpMax: 120000,
    badge: '🧬',
    intensity: 'Peak Gladiator (Giant Combos)',
    unlocks: 'Peak homeostatic metabolic schedules',
    desc: 'Peak championship physical endurance and power.',
    rankGlowClass: 'text-amber-500 bg-amber-50 dark:bg-amber-950/35 border-amber-300 dark:border-amber-700/50 font-black animate-pulse'
  },
  {
    level: 14,
    rank: 'SS',
    name: 'Vigor Demigod',
    xp: 120001,
    xpMax: 150000,
    badge: '🌌',
    intensity: 'God Tier Exhaustion (No Rest supersets)',
    unlocks: 'Infinite stamina calisthenics overrides',
    desc: 'Ultimate metabolic flexibility and peak strength.',
    rankGlowClass: 'text-violet-600 bg-violet-50 dark:bg-violet-950/35 border-violet-300 dark:border-violet-700/50 font-black animate-pulse'
  },
  {
    level: 15,
    rank: 'SSS',
    name: 'Ascended Vigor Deity',
    xp: 150001,
    xpMax: 9999999,
    badge: '👑',
    intensity: 'Supreme Sovereign Pacing (Infinite Sets)',
    unlocks: 'Legendary prestige tier and community recognition',
    desc: 'You have reached the ultimate pinnacle of physical fitness.',
    rankGlowClass: 'text-orange-500 bg-orange-50 dark:bg-orange-950/35 border-orange-300 dark:border-orange-600/60 font-black animate-bounce shadow-md'
  }
];

export interface LevelDetails {
  level: number;
  rank: string;
  title: string;
  desc: string;
  intensity: string;
  badge: string;
  xpRequired: number;
  nextXp: number;
  rankGlowClass: string;
  unlockedExercises: string[];
  previewNext: { name: string; xpReq: number } | null;
  progressPercentage: number;
}

export function calculateUserRankAndLevel(xp: number): LevelDetails {
  let currentNode = ALL_RANKS_MILESTONES[0];
  for (let i = 0; i < ALL_RANKS_MILESTONES.length; i++) {
    const node = ALL_RANKS_MILESTONES[i];
    if (xp <= node.xpMax) {
      currentNode = node;
      break;
    }
    if (i === ALL_RANKS_MILESTONES.length - 1) {
      currentNode = node;
    }
  }

  const idx = ALL_RANKS_MILESTONES.indexOf(currentNode);
  const prevNode = idx > 0 ? ALL_RANKS_MILESTONES[idx - 1] : null;
  const xpRequired = prevNode ? prevNode.xpMax : 0;
  const nextXp = currentNode.xpMax;

  let progressPercentage = 0;
  if (currentNode.rank === 'SSS') {
    progressPercentage = 100;
  } else {
    progressPercentage = Math.min(100, Math.max(0, Math.round(((xp - xpRequired) / (nextXp - xpRequired)) * 100)));
  }

  let unlockedExercises: string[] = [];
  if (currentNode.level === 1) {
    unlockedExercises = ['ex_brisk_walk', 'ex_joint_star'];
  } else if (currentNode.level === 2) {
    unlockedExercises = ['ex_brisk_walk', 'ex_joint_star', 'ex_squats', 'ex_pushups', 'ex_plank', 'ex_glute_bridge'];
  } else if (currentNode.level === 3) {
    unlockedExercises = ['ex_brisk_walk', 'ex_joint_star', 'ex_squats', 'ex_pushups', 'ex_plank', 'ex_glute_bridge', 'ex_dumbbell_rows', 'ex_bench_dips', 'ex_superman'];
  } else {
    unlockedExercises = [
      'ex_brisk_walk', 'ex_joint_star', 'ex_squats', 'ex_pushups', 'ex_plank', 'ex_glute_bridge',
      'ex_dumbbell_rows', 'ex_bench_dips', 'ex_superman', 'ex_dumbbell_press', 'ex_bicep_curl', 'ex_lunges', 'ex_jumping_jacks'
    ];
  }

  const nextNode = idx < ALL_RANKS_MILESTONES.length - 1 ? ALL_RANKS_MILESTONES[idx + 1] : null;
  const previewNext = nextNode ? { name: nextNode.name + ' (' + nextNode.rank + ')', xpReq: nextNode.xp } : null;

  return {
    level: currentNode.level,
    rank: currentNode.rank,
    title: currentNode.name,
    desc: currentNode.desc,
    intensity: currentNode.intensity,
    badge: currentNode.badge,
    xpRequired,
    nextXp,
    rankGlowClass: currentNode.rankGlowClass,
    unlockedExercises,
    previewNext,
    progressPercentage
  };
}
