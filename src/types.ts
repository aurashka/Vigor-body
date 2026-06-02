/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TargetBody = 'fat_loss' | 'muscle_gain' | 'tone_shape' | 'strength_building';
export type DietPreference = 'veg' | 'non_veg' | 'vegan';
export type ExerciseLevel = 'beginner' | 'intermediate' | 'advanced';
export type Gender = 'male' | 'female' | 'non_binary';

export interface UserProfile {
  name: string;
  height: number; // in cm
  weight: number; // in kg
  age: number;
  illness: string; // "none" | "diabetes" | "hypertension" | "thyroid" | "joint_pain" | "asthma" | "other"
  targetBody: TargetBody;
  country: string;
  dietPreference: DietPreference;
  gender: Gender;
  exerciseLevel: ExerciseLevel;
  waterTargetCustom?: number;
  stepsTargetCustom?: number;
  caloriesTargetCustom?: number;
  proteinTargetCustom?: number;
  carbsTargetCustom?: number;
  fatTargetCustom?: number;
  avatarUrl?: string;
  bio?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  protein: number; // grams per serving
  fat: number; // grams per serving
  carbs: number; // grams per serving
  calories: number; // kcal per serving
  category: 'protein' | 'carbs' | 'fat' | 'vegetable_fruit';
  isLocal: boolean;
  countries: string[]; // countries where this is local
  servingSize: string; // e.g. "1 bowl", "100g", "2 pieces"
}

export interface FoodEaten {
  id: string;
  foodId: string;
  name: string;
  protein: number;
  fat: number;
  carbs: number;
  calories: number;
  servings: number;
  loggedAt: string; // ISO string or timestamp
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // e.g. "12 reps", "45 secs"
  instructions: string;
  targetMuscle: string;
  points: number;
  alternativeName?: string; // friendly alternative for joint pain/illness
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  waterIntake: number; // in ml
  stepsWalked: number;
  exercisesCompleted: string[]; // exercise exerciseIds completed
  foodsEaten: FoodEaten[];
  caloriesBurned: number; // general activity logs/edits
}

export interface HistoryRecord {
  date: string;
  waterIntake: number;
  stepsWalked: number;
  caloriesBurned: number;
  targetCalories: number;
  proteinIntake: number;
  fatIntake: number;
  carbsIntake: number;
  waterTarget: number;
  stepsTarget: number;
  workoutCompletedPercentage: number;
  streakCount: number;
  score: number;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  country: string;
  score: number;
  isCurrentUser?: boolean;
  avatarUrl?: string;
}

export interface RewardBadge {
  id: string;
  title: string;
  description: string;
  unlockedAt?: string;
  iconName: string;
}

export interface ProfilePost {
  id: string;
  title: string;
  imageUrl: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO string
}
