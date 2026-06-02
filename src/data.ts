/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FoodItem, WorkoutExercise, LeaderboardUser, RewardBadge } from './types';

export const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'USA', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
];

export const ILLNESSES = [
  { id: 'none', name: 'None (Healthy / Normal Diet)', description: 'No dietary or cardiovascular restrictions.' },
  { id: 'diabetes', name: 'Diabetes', description: 'Underlines lower glycemic carbs, controlled starches, healthy fibers.' },
  { id: 'hypertension', name: 'Hypertension (High BP)', description: 'Salt-conscious, rich in potassium, heart-healthy fats.' },
  { id: 'thyroid', name: 'Thyroid', description: 'Metabolism supportive, selenium and zinc rich foods, selenium, iodine active.' },
  { id: 'joint_pain', name: 'Joint Pain (Arthritis)', description: 'Anti-inflammatory focus, excludes high impact jumping/straining.' },
  { id: 'asthma', name: 'Asthma (Respiratory)', description: 'Antioxidant and lung-health focus, progressive cardio warmth.' },
];

export const FOODS_DATABASE: FoodItem[] = [
  // --- INDIA LOCAL FOODS ---
  {
    id: 'in_paneer',
    name: 'Paneer (Tikka/Grilled)',
    protein: 18,
    fat: 20,
    carbs: 3,
    calories: 264,
    category: 'protein',
    isLocal: true,
    countries: ['IN'],
    servingSize: '100g'
  },
  {
    id: 'in_dal_tadka',
    name: 'Yellow Dal (Cooked)',
    protein: 7,
    fat: 2,
    carbs: 20,
    calories: 126,
    category: 'protein',
    isLocal: true,
    countries: ['IN'],
    servingSize: '1 cup/bowl'
  },
  {
    id: 'in_chana_masala',
    name: 'Chana Masala (Chickpeas)',
    protein: 8,
    fat: 4,
    carbs: 22,
    calories: 156,
    category: 'carbs',
    isLocal: true,
    countries: ['IN'],
    servingSize: '1 bowl'
  },
  {
    id: 'in_roti',
    name: 'Wheat Roti / Chapati',
    protein: 3,
    fat: 1,
    carbs: 15,
    calories: 81,
    category: 'carbs',
    isLocal: true,
    countries: ['IN'],
    servingSize: '1 piece'
  },
  {
    id: 'in_poha',
    name: 'Poha with Veggies',
    protein: 3,
    fat: 2,
    carbs: 38,
    calories: 182,
    category: 'carbs',
    isLocal: true,
    countries: ['IN'],
    servingSize: '1 plate'
  },
  {
    id: 'in_idli',
    name: 'Steamed Idli (Rice Cake)',
    protein: 2,
    fat: 0.2,
    carbs: 18,
    calories: 82,
    category: 'carbs',
    isLocal: true,
    countries: ['IN'],
    servingSize: '2 pieces'
  },
  {
    id: 'in_ghee',
    name: 'Pure Desi Ghee',
    protein: 0,
    fat: 11.2,
    carbs: 0,
    calories: 101,
    category: 'fat',
    isLocal: true,
    countries: ['IN'],
    servingSize: '1 tsp (5ml)'
  },
  {
    id: 'in_samosa',
    name: 'Potato Samosa',
    protein: 3.5,
    fat: 12,
    carbs: 32,
    calories: 250,
    category: 'carbs',
    isLocal: true,
    countries: ['IN'],
    servingSize: '1 medium piece'
  },
  {
    id: 'in_chicken_curry',
    name: 'Indian Chicken Curry',
    protein: 22,
    fat: 11,
    carbs: 5,
    calories: 207,
    category: 'protein',
    isLocal: true,
    countries: ['IN'],
    servingSize: '1 bowl (150g)'
  },
  {
    id: 'in_moong_cheela',
    name: 'Moong Dal Cheela / Pancake',
    protein: 9,
    fat: 3,
    carbs: 22,
    calories: 151,
    category: 'protein',
    isLocal: true,
    countries: ['IN'],
    servingSize: '1 large'
  },

  // --- USA LOCAL FOODS ---
  {
    id: 'us_chicken_breast',
    name: 'Bake Grilled Chicken Breast',
    protein: 31,
    fat: 3.6,
    carbs: 0,
    calories: 165,
    category: 'protein',
    isLocal: true,
    countries: ['US', 'CA'],
    servingSize: '100g'
  },
  {
    id: 'us_oatmeal',
    name: 'Steel Cut Oatmeal (Cooked)',
    protein: 6,
    fat: 3,
    carbs: 28,
    calories: 163,
    category: 'carbs',
    isLocal: true,
    countries: ['US', 'CA', 'GB'],
    servingSize: '1 cup cooked'
  },
  {
    id: 'us_sweet_potato',
    name: 'Baked Sweet Potato',
    protein: 2,
    fat: 0.1,
    carbs: 26,
    calories: 112,
    category: 'carbs',
    isLocal: true,
    countries: ['US', 'CA', 'AU'],
    servingSize: '1 medium (130g)'
  },
  {
    id: 'us_peanut_butter',
    name: 'Creamy Peanut Butter',
    protein: 8,
    fat: 16,
    carbs: 6,
    calories: 188,
    category: 'fat',
    isLocal: true,
    countries: ['US', 'CA', 'AU'],
    servingSize: '2 tbsp (32g)'
  },
  {
    id: 'us_avocado',
    name: 'Fresh Avocado Slice',
    protein: 2,
    fat: 15,
    carbs: 9,
    calories: 160,
    category: 'fat',
    isLocal: true,
    countries: ['US', 'MX', 'AU', 'BR'],
    servingSize: '1/2 fruit'
  },
  {
    id: 'us_burger_patty',
    name: 'Grilled Beef Burger Patty (85% Lean)',
    protein: 22,
    fat: 15,
    carbs: 0,
    calories: 223,
    category: 'protein',
    isLocal: true,
    countries: ['US', 'CA', 'AU'],
    servingSize: '1 patty (100g)'
  },
  {
    id: 'us_greek_yogurt',
    name: 'Plain Greek Yogurt (0% Fat)',
    protein: 15,
    fat: 0,
    carbs: 6,
    calories: 84,
    category: 'protein',
    isLocal: true,
    countries: ['US', 'GB'],
    servingSize: '150g cup'
  },

  // --- UK LOCAL FOODS ---
  {
    id: 'uk_salmon',
    name: 'Baked Salmon Fillet',
    protein: 22,
    fat: 13,
    carbs: 0,
    calories: 206,
    category: 'protein',
    isLocal: true,
    countries: ['GB', 'CA'],
    servingSize: '1 fillet (120g)'
  },
  {
    id: 'uk_baked_beans',
    name: 'Heinz Baked Beans',
    protein: 6,
    fat: 0.5,
    carbs: 18,
    calories: 104,
    category: 'carbs',
    isLocal: true,
    countries: ['GB'],
    servingSize: '1/2 can'
  },
  {
    id: 'uk_jacket_potato',
    name: 'Jacket Baked Potato',
    protein: 4,
    fat: 0.2,
    carbs: 38,
    calories: 170,
    category: 'carbs',
    isLocal: true,
    countries: ['GB'],
    servingSize: '1 medium (150g)'
  },
  {
    id: 'uk_cheddar',
    name: 'Mature Cheddar Cheese',
    protein: 7,
    fat: 10.5,
    carbs: 0.4,
    calories: 124,
    category: 'fat',
    isLocal: true,
    countries: ['GB', 'AU', 'CA'],
    servingSize: '30g slice'
  },
  {
    id: 'uk_shepherds_pie',
    name: 'Shepherds Pie (Lean Lamb/Veg)',
    protein: 18,
    fat: 12,
    carbs: 22,
    calories: 268,
    category: 'protein',
    isLocal: true,
    countries: ['GB'],
    servingSize: '1 portion (200g)'
  },

  // --- JAPAN LOCAL FOODS ---
  {
    id: 'jp_tofu',
    name: 'Momen Firm Tofu',
    protein: 10.5,
    fat: 5.5,
    carbs: 2.2,
    calories: 98,
    category: 'protein',
    isLocal: true,
    countries: ['JP'],
    servingSize: '150g slice'
  },
  {
    id: 'jp_salmon_shioyaki',
    name: 'Grilled Shioyaki Salmon',
    protein: 24,
    fat: 11,
    carbs: 0,
    calories: 195,
    category: 'protein',
    isLocal: true,
    countries: ['JP'],
    servingSize: '1 piece'
  },
  {
    id: 'jp_white_rice',
    name: 'Steamed Japanese Short Grain Rice',
    protein: 3.5,
    fat: 0.4,
    carbs: 42,
    calories: 186,
    category: 'carbs',
    isLocal: true,
    countries: ['JP'],
    servingSize: '1 medium bowl'
  },
  {
    id: 'jp_soba',
    name: 'Buckwheat Soba Noodles (Cooked)',
    protein: 6.2,
    fat: 0.8,
    carbs: 24,
    calories: 128,
    category: 'carbs',
    isLocal: true,
    countries: ['JP'],
    servingSize: '1 bowl'
  },
  {
    id: 'jp_natto',
    name: 'Natto Fermented Soybeans',
    protein: 8.5,
    fat: 5,
    carbs: 6,
    calories: 100,
    category: 'protein',
    isLocal: true,
    countries: ['JP'],
    servingSize: '1 pack (50g)'
  },
  {
    id: 'jp_miso_soup',
    name: 'Miso Soup with Wakame',
    protein: 2.2,
    fat: 1.2,
    carbs: 4.8,
    calories: 38,
    category: 'carbs',
    isLocal: true,
    countries: ['JP'],
    servingSize: '1 bowl (180ml)'
  },

  // --- MEXICO LOCAL FOODS ---
  {
    id: 'mx_black_beans',
    name: 'Frijoles Negros (Boiled Black Beans)',
    protein: 8,
    fat: 0.8,
    carbs: 21,
    calories: 120,
    category: 'carbs',
    isLocal: true,
    countries: ['MX'],
    servingSize: '1 cup boiled'
  },
  {
    id: 'mx_corn_tortilla',
    name: 'Corn Tortilla',
    protein: 1.4,
    fat: 0.7,
    carbs: 12,
    calories: 52,
    category: 'carbs',
    isLocal: true,
    countries: ['MX'],
    servingSize: '1 piece'
  },
  {
    id: 'mx_picadillo',
    name: 'Lean Beef Picadillo',
    protein: 19,
    fat: 8,
    carbs: 6,
    calories: 172,
    category: 'protein',
    isLocal: true,
    countries: ['MX'],
    servingSize: '150g portion'
  },
  {
    id: 'mx_queso_fresco',
    name: 'Queso Fresco (Fresh Crumble Cheese)',
    protein: 6,
    fat: 8,
    carbs: 1,
    calories: 100,
    category: 'fat',
    isLocal: true,
    countries: ['MX'],
    servingSize: '30g piece'
  },
  {
    id: 'mx_pork_carnitas',
    name: 'Pork Carnitas (Slow Cooked)',
    protein: 23,
    fat: 13,
    carbs: 0.2,
    calories: 210,
    category: 'protein',
    isLocal: true,
    countries: ['MX'],
    servingSize: '100g portion'
  },

  // --- NIGERIA LOCAL FOODS ---
  {
    id: 'ng_moin_moin',
    name: 'Moin Moin (Bean Pudding)',
    protein: 9,
    fat: 3,
    carbs: 20,
    calories: 143,
    category: 'protein',
    isLocal: true,
    countries: ['NG'],
    servingSize: '1 piece'
  },
  {
    id: 'ng_jollof_rice',
    name: 'Jollof Rice',
    protein: 4,
    fat: 5,
    carbs: 45,
    calories: 241,
    category: 'carbs',
    isLocal: true,
    countries: ['NG'],
    servingSize: '1 plate (150g)'
  },
  {
    id: 'ng_boiled_yam',
    name: 'Boiled White Yam Slice',
    protein: 2,
    fat: 0.2,
    carbs: 37,
    calories: 158,
    category: 'carbs',
    isLocal: true,
    countries: ['NG'],
    servingSize: '1 piece (100g)'
  },
  {
    id: 'ng_tilapia_soup',
    name: 'Pepper Tilapia Fish Soup',
    protein: 19,
    fat: 3.5,
    carbs: 2,
    calories: 115,
    category: 'protein',
    isLocal: true,
    countries: ['NG'],
    servingSize: '1 bowl'
  },
  {
    id: 'ng_red_oil',
    name: 'Red Palm Oil',
    protein: 0,
    fat: 13.6,
    carbs: 0,
    calories: 120,
    category: 'fat',
    isLocal: true,
    countries: ['NG'],
    servingSize: '1 tbsp (15ml)'
  },

  // --- BRAZIL LOCAL FOODS ---
  {
    id: 'br_picanha',
    name: 'Grilled Picanha (Fat trimmed)',
    protein: 26,
    fat: 12,
    carbs: 0,
    calories: 212,
    category: 'protein',
    isLocal: true,
    countries: ['BR'],
    servingSize: '100g slab'
  },
  {
    id: 'br_black_beans',
    name: 'Feijão Preto (Black Bean Soup)',
    protein: 7,
    fat: 2,
    carbs: 18,
    calories: 118,
    category: 'carbs',
    isLocal: true,
    countries: ['BR'],
    servingSize: '1 ladle'
  },
  {
    id: 'br_tapioca',
    name: 'Tapioca Crepe (Yuca Starch)',
    protein: 0.2,
    fat: 0,
    carbs: 34,
    calories: 136,
    category: 'carbs',
    isLocal: true,
    countries: ['BR'],
    servingSize: '1 medium crepe'
  },
  {
    id: 'br_pao_de_queijo',
    name: 'Pão de Queijo (Cheese Bread)',
    protein: 3,
    fat: 5,
    carbs: 18,
    calories: 129,
    category: 'carbs',
    isLocal: true,
    countries: ['BR'],
    servingSize: '1 piece'
  },

  // --- GLOBAL NON-LOCAL FALLBACKS (INTERNATIONAL COUCH/GYM STANDARDS) ---
  {
    id: 'g_whey_shake',
    name: 'Whey Protein Isolate Shake',
    protein: 25,
    fat: 1,
    carbs: 2,
    calories: 117,
    category: 'protein',
    isLocal: false,
    countries: [],
    servingSize: '1 scoop (30g)'
  },
  {
    id: 'g_boiled_egg',
    name: 'Whole Boiled Egg',
    protein: 6.3,
    fat: 5.3,
    carbs: 0.6,
    calories: 78,
    category: 'protein',
    isLocal: false,
    countries: [],
    servingSize: '1 large egg'
  },
  {
    id: 'g_egg_white',
    name: 'Pure Egg Whites',
    protein: 11,
    fat: 0.1,
    carbs: 0.7,
    calories: 52,
    category: 'protein',
    isLocal: false,
    countries: [],
    servingSize: '100ml'
  },
  {
    id: 'g_tuna',
    name: 'Canned Tuna in Water',
    protein: 26,
    fat: 1,
    carbs: 0,
    calories: 113,
    category: 'protein',
    isLocal: false,
    countries: [],
    servingSize: '100g can'
  },
  {
    id: 'g_broccoli',
    name: 'Steamed Fresh Broccoli',
    protein: 2.8,
    fat: 0.4,
    carbs: 7,
    calories: 34,
    category: 'carbs',
    isLocal: false,
    countries: [],
    servingSize: '1 cup (150g)'
  },
  {
    id: 'g_brown_rice',
    name: 'Steamed Brown Rice',
    protein: 4.5,
    fat: 1.6,
    carbs: 45,
    calories: 215,
    category: 'carbs',
    isLocal: false,
    countries: [],
    servingSize: '1 cup cooked'
  },
  {
    id: 'g_white_bread',
    name: 'Gluten-free / Normal Sliced Bread',
    protein: 3,
    fat: 1,
    carbs: 14,
    calories: 75,
    category: 'carbs',
    isLocal: false,
    countries: [],
    servingSize: '1 slice'
  },
  {
    id: 'g_chia_seed',
    name: 'Raw Chia Seeds',
    protein: 4.7,
    fat: 9,
    carbs: 12,
    calories: 138,
    category: 'fat',
    isLocal: false,
    countries: [],
    servingSize: '2 tbsp (28g)'
  },
  {
    id: 'g_almonds',
    name: 'Whole Shelled Almonds',
    protein: 6,
    fat: 14,
    carbs: 6,
    calories: 162,
    category: 'fat',
    isLocal: false,
    countries: [],
    servingSize: '1 ounce (28g/23 nuts)'
  },
  {
    id: 'g_olive_oil',
    name: 'Extra Virgin Olive Oil',
    protein: 0,
    fat: 14,
    carbs: 0,
    calories: 119,
    category: 'fat',
    isLocal: false,
    countries: [],
    servingSize: '1 tbsp (15ml)'
  },
];

// --- WORKOUT EXERCISE DATABASE ---
// Organized by Target Muscle Groups
export const EXERCISES_DATABASE: WorkoutExercise[] = [
  // --- CARDIO / MOBILITY ---
  {
    id: 'ex_brisk_walk',
    name: 'Brisk Outdoor Walk',
    sets: 1,
    reps: '20 mins',
    instructions: 'Walk fast but maintain steady nasal breathing. Focus on posture.',
    targetMuscle: 'Cardio',
    points: 15,
  },
  {
    id: 'ex_joint_star',
    name: 'Gentle Joint Rotations',
    sets: 2,
    reps: '10 reps each',
    instructions: 'Smooth, painless circular movements of wrists, neck, hips, knees.',
    targetMuscle: 'Mobility / Joints',
    points: 10,
    alternativeName: 'Warmup Wrist & Shoulder Rolls'
  },
  {
    id: 'ex_jumping_jacks',
    name: 'Speed Jumping Jacks',
    sets: 3,
    reps: '45 secs',
    instructions: 'Explosive stars, core locked. Landing softly on standard feet balls.',
    targetMuscle: 'Full body',
    points: 20,
    alternativeName: 'Low impact step jacks' // Joint pain friendly swap!
  },

  // --- CHEST & TRICEPS (PUSH) ---
  {
    id: 'ex_pushups',
    name: 'Regular Chest Pushups',
    sets: 3,
    reps: '12-15 reps',
    instructions: 'Lower body flat, chest goes to 1 inch above floor. Arms aligned 45 degrees.',
    targetMuscle: 'Chest & Triceps',
    points: 25,
    alternativeName: 'Incline Wall or Hand-rail Pushups' // Joint Pain alternative
  },
  {
    id: 'ex_dumbbell_press',
    name: 'Dumbbell Floor Chest Press',
    sets: 4,
    reps: '12 reps',
    instructions: 'Lie on floor, press dumbbells up. Squeeze chest at the top peak.',
    targetMuscle: 'Chest & Shoulders',
    points: 25,
  },
  {
    id: 'ex_bench_dips',
    name: 'Triceps Bench/Chair Dips',
    sets: 3,
    reps: '12 reps',
    instructions: 'Use edge of sturdy couch. Lower hip straight down, push using triceps.',
    targetMuscle: 'Triceps & Shoulders',
    points: 15,
    alternativeName: 'Seated Triceps overhead extension'
  },

  // --- BACK & BICEPS (PULL) ---
  {
    id: 'ex_dumbbell_rows',
    name: 'Single Arm Dumbbell Row',
    sets: 3,
    reps: '12 reps each',
    instructions: 'Trunk bent 45 degrees, support with hand, pull weight into lower rib cage.',
    targetMuscle: 'Lats & Middle Back',
    points: 20,
  },
  {
    id: 'ex_superman',
    name: 'Lying Superman Arch',
    sets: 3,
    reps: '30 secs hold',
    instructions: 'Lying flat on chest, raise chest, hands, and thighs together. Squeeze lower back.',
    targetMuscle: 'Spinal Erectors / Back',
    points: 20,
  },
  {
    id: 'ex_bicep_curl',
    name: 'Dumbbell Hammer Curl',
    sets: 3,
    reps: '15 reps',
    instructions: 'Keep elbows tucked, reverse wrist slightly. Curl up and squeeze biceps.',
    targetMuscle: 'Biceps & Forearms',
    points: 15,
  },

  // --- LEGS & CORE (SHAPER) ---
  {
    id: 'ex_squats',
    name: 'Bodyweight Shaper Squats',
    sets: 4,
    reps: '15 reps',
    instructions: 'Feet shoulder-width apart, load weight onto heels, hips backwards, spine neutral.',
    targetMuscle: 'Quads & Glutes',
    points: 25,
    alternativeName: 'High Chair Assisted Sit-to-Stands' // Joint Pain / Elderly friendly
  },
  {
    id: 'ex_glute_bridge',
    name: 'Glute Squeeze Bridges',
    sets: 3,
    reps: '15 reps',
    instructions: 'Lie on back, bend knees. Drive heels, raise hips into full tension contraction.',
    targetMuscle: 'Glutes & Hamstrings',
    points: 20,
  },
  {
    id: 'ex_plank',
    name: 'Core Forearm Plank',
    sets: 3,
    reps: '45 secs hold',
    instructions: 'Forearms flat, spine direct line, squeeze belly button to sky, lock glutes.',
    targetMuscle: 'Core Abs',
    points: 25,
    alternativeName: 'Incline Hand Plank or Bird-Dog Holds'
  },
  {
    id: 'ex_lunges',
    name: 'Reverse Core Lunges',
    sets: 3,
    reps: '10 reps each',
    instructions: 'Step back, lower your back knee to 90 degrees. Push back tall to starting position.',
    targetMuscle: 'Hamstrings & Balance',
    points: 20,
    alternativeName: 'Step Back Touchbacks (No Deep Dip)'
  }
];

// --- STATIC LEADERBOARD SIMULATORS ---
export const STATIC_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: 'Aarav Sharma', country: 'India', score: 1250, avatarUrl: '👨🏽‍💻' },
  { rank: 2, name: 'Taylor Myers', country: 'USA', score: 1120, avatarUrl: '🏃🏼‍♀️' },
  { rank: 3, name: 'Chloe Davies', country: 'United Kingdom', score: 980, avatarUrl: '🚴🏻‍♀️' },
  { rank: 4, name: 'Ren Sato', country: 'Japan', score: 910, avatarUrl: '🧘🏻‍♂️' },
  { rank: 5, name: 'Carlos Gomez', country: 'Mexico', score: 850, avatarUrl: '🏋🏾‍♂️' },
  { rank: 6, name: 'You (Goal-Crusher)', country: 'Your Country', score: 0, isCurrentUser: true, avatarUrl: '⚡️' },
  { rank: 7, name: 'Amara Okafor', country: 'Nigeria', score: 620, avatarUrl: '💃🏾' },
  { rank: 8, name: 'Fernanda Lima', country: 'Brazil', score: 580, avatarUrl: '🏄🏽‍♀️' },
  { rank: 9, name: 'Hansi Müller', country: 'Germany', score: 510, avatarUrl: '🥾' },
];

// --- BADGES ---
export const BADGES_DATABASE: RewardBadge[] = [
  {
    id: 'badge_first_log',
    title: 'Plan Activated',
    description: 'Set up your country-specific adaptive plan details.',
    iconName: 'Sparkles',
  },
  {
    id: 'badge_water_champ',
    title: 'Hydration Hero',
    description: 'Drank all scheduled daily water targets without delays.',
    iconName: 'Droplet',
  },
  {
    id: 'badge_streak_3',
    title: 'Consistency Bronze',
    description: 'Achieved a disciplined 3-day active checking streak!',
    iconName: 'Flame',
  },
  {
    id: 'badge_workout_beast',
    title: 'Body Sculptor Builder',
    description: 'Completed 100% of body-shaping workout targets.',
    iconName: 'Dumbbell',
  },
  {
    id: 'badge_tracker_pro',
    title: 'Macro Portion King',
    description: 'Logged local foods matching daily health calories target.',
    iconName: 'Search',
  },
];

// --- DYNAMIC LOCAL DIET RECOMMENDATIONS & TIP DICTIONARY ---
export const COUNTRY_NORMAL_DIET_FACTS: Record<string, { summary: string; healthySwap: string; staple: string }> = {
  IN: {
    summary: 'Traditional Indian diets are rich in grains (roti, rice), pulses (lentils, chickpeas), and dairy products (paneer, yogurt). It is highly vegetarian friendly, though sometimes low in lean proteins like chicken unless intentional, and higher in digestible carbs.',
    healthySwap: 'Swap high-fat processed oils for standard Ghee in control. Boost protein with roasted Moong Cheela or Paneer.',
    staple: 'Roti, Dal, Paneer, Rice, Poha'
  },
  US: {
    summary: 'Modern American diets emphasize meat proteins, complex breads, but contain heavy processed fast-foods, sugary drinks, high-fat oils, and low daily fiber.',
    healthySwap: 'Swap dense white bread with sweet potato or oats. Focus on grilled lean turkey breast or egg whites.',
    staple: 'Chicken Breast, Sweet Potato, Oatmeal, Avocado'
  },
  GB: {
    summary: 'British meal structures traditionally pair meat (beef, cod) with solid potato starches (chips, jacket potatoes), baked beans, and dairy cheeses.',
    healthySwap: 'Swap heavy fried chips for baked jacket potatoes with light cottage cheese or grilled salmon.',
    staple: 'Salmon, Baked Beans, Jacket Potato, Porridge'
  },
  JP: {
    summary: 'Japanese food culture is highly clean, prioritizing ocean proteins (salmon, mackerel), fermented soybeans (tofu, natto), steamed rice, and rich green tea.',
    healthySwap: 'Swap high-sodium soy sauce with mineral vegetable dashi. Pair white rice with high fiber soba buckwheat noodles.',
    staple: 'Tofu, Natto, Grilled Salmon, Soba, Miso'
  },
  MX: {
    summary: 'Mexican diets lean heavily towards corn tortillas, protein beans (black, pinto), spice peppers, fresh avocado, pork, and cheese.',
    healthySwap: 'Swap fried corn chips or heavy lard with oven-baked black bean tostadas topped with freshly made Guacamole.',
    staple: 'Black Beans, Corn Tortilla, Picadillo, Queso Fresco'
  },
  NG: {
    summary: 'West African Nigerian staples center on solid tubers (yam, cassava), high starch grain (rice, jollof), nutritious soups, and robust protein fish.',
    healthySwap: 'Moderate red palm oil portions in stews. Prioritize low calorie Tilapia fish soup paired with fiber rich boiled yam.',
    staple: 'Boiled Yam, Jollof Rice, Tilapia Pepper Soup, Moin Moin'
  },
  BR: {
    summary: 'Brazilian cuisines combine superb rotisserie grill cuts (Picanha, chicken) with white rice, black beans (Feijão), and tapioca starch crepes.',
    healthySwap: 'Enjoy clean flame-grilled picanha with the fat trim. Swap dense bread with thin tapioca crepes.',
    staple: 'Picanha, Black Beans, Tapioca Crepes'
  },
};
