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
