/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { FoodItem, FoodEaten } from '../types';
import { FOODS_DATABASE } from '../data';
import { Search, X, Plus, Minus, Check, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface FoodLoggerModalProps {
  userCountry: string;
  userDietPref: 'veg' | 'non_veg' | 'vegan';
  illness: string;
  isOpen: boolean;
  onClose: () => void;
  onAddFood: (food: Omit<FoodEaten, 'id' | 'loggedAt'>) => void;
  initialCategory?: 'protein' | 'carbs' | 'fat' | null;
}

export default function FoodLoggerModal({
  userCountry,
  userDietPref,
  illness,
  isOpen,
  onClose,
  onAddFood,
  initialCategory = null,
}: FoodLoggerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'protein' | 'carbs' | 'fat'>(
    initialCategory || 'all'
  );
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState<number>(1);

  // Sync category if initially passed
  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const filteredFoods = useMemo(() => {
    let list = FOODS_DATABASE;

    // Filter by Diet Habit
    if (userDietPref === 'vegan') {
      // Must not be animal based. In our DB we filter elements (e.g. eggs, chicken, pork, beef, salmon, ghee, cheese, whey)
      list = list.filter(
        (f) =>
          !f.name.toLowerCase().includes('chicken') &&
          !f.name.toLowerCase().includes('pork') &&
          !f.name.toLowerCase().includes('beef') &&
          !f.name.toLowerCase().includes('salmon') &&
          !f.name.toLowerCase().includes('egg') &&
          !f.name.toLowerCase().includes('paneer') &&
          !f.name.toLowerCase().includes('ghee') &&
          !f.name.toLowerCase().includes('cheese') &&
          !f.name.toLowerCase().includes('whey') &&
          !f.name.toLowerCase().includes('mackerel')
      );
    } else if (userDietPref === 'veg') {
      // Dairy allowed, no meat/fish
      list = list.filter(
        (f) =>
          !f.name.toLowerCase().includes('chicken') &&
          !f.name.toLowerCase().includes('pork') &&
          !f.name.toLowerCase().includes('beef') &&
          !f.name.toLowerCase().includes('salmon') &&
          !f.name.toLowerCase().includes('tuna') &&
          !f.name.toLowerCase().includes('mackerel') &&
          !f.name.toLowerCase().includes('carnitas') &&
          !f.name.toLowerCase().includes('picadillo') &&
          !f.name.toLowerCase().includes('patty')
      );
    }

    // Filter by Nutrition Category Tabs
    if (selectedCategory !== 'all') {
      list = list.filter((f) => f.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [userDietPref, selectedCategory, searchQuery]);

  // Split into Local and International options
  const { localFoods, internationalFoods } = useMemo(() => {
    const local = filteredFoods.filter((f) => f.countries.includes(userCountry));
    const international = filteredFoods.filter((f) => !f.countries.includes(userCountry));
    return { localFoods: local, internationalFoods: international };
  }, [filteredFoods, userCountry]);

  if (!isOpen) return null;

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setServings(1);
  };

  const handleLog = () => {
    if (!selectedFood) return;
    onAddFood({
      foodId: selectedFood.id,
      name: selectedFood.name,
      protein: parseFloat((selectedFood.protein * servings).toFixed(1)),
      fat: parseFloat((selectedFood.fat * servings).toFixed(1)),
      carbs: parseFloat((selectedFood.carbs * servings).toFixed(1)),
      calories: Math.round(selectedFood.calories * servings),
      servings,
    });
    setSelectedFood(null);
    setServings(1);
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-end justify-center z-50 animate-fade-in font-sans">
      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 200, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 rounded-t-[32px] max-h-[92%] flex flex-col shadow-2xl relative"
      >
        {/* Top Handle bar */}
        <div className="w-12 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto my-3 cursor-pointer" onClick={onClose}></div>

        {/* Header Section */}
        <div className="px-5 pb-3 flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
              Log Nutritious Foods <Sparkles className="w-4 h-4 text-amber-500" />
            </h3>
            <p className="text-[10px] text-zinc-400">Add local staples to hit daily macro targets</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
            id="close-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Custom food configure panel (If food item is actively selected) */}
        {selectedFood ? (
          <div className="p-5 flex flex-col gap-4 bg-indigo-50/20 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-400">
                  {selectedFood.category}
                </span>
                <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white mt-1">{selectedFood.name}</h4>
                <p className="text-[11px] text-zinc-400">Serving size: {selectedFood.servingSize}</p>
              </div>

              {/* Servings counter */}
              <div className="flex items-center gap-3 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-100 dark:border-zinc-700">
                <button
                  onClick={() => setServings(Math.max(0.5, servings - 0.5))}
                  className="w-6 h-6 rounded-md bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center active:scale-95 text-zinc-600 dark:text-zinc-300"
                  id="dec-servings-btn"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-black min-w-8 text-center text-zinc-800 dark:text-white">{servings}x</span>
                <button
                  onClick={() => setServings(servings + 0.5)}
                  className="w-6 h-6 rounded-md bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center active:scale-95 text-zinc-600 dark:text-zinc-300"
                  id="inc-servings-btn"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Simulated nutrition facts card */}
            <div className="grid grid-cols-4 gap-2 bg-white dark:bg-zinc-800/80 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-700 text-center shadow-xs">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Calories</span>
                <p className="text-xs font-black text-zinc-800 dark:text-white">
                  {Math.round(selectedFood.calories * servings)} <span className="text-[9px] font-normal">kcal</span>
                </p>
              </div>
              <div>
                <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-mono">Protein</span>
                <p className="text-xs font-black text-zinc-800 dark:text-white">
                  {parseFloat((selectedFood.protein * servings).toFixed(1))}g
                </p>
              </div>
              <div>
                <span className="text-[10px] text-amber-500 uppercase tracking-widest font-mono font-sans">Carbs</span>
                <p className="text-xs font-black text-zinc-800 dark:text-white">
                  {parseFloat((selectedFood.carbs * servings).toFixed(1))}g
                </p>
              </div>
              <div>
                <span className="text-[10px] text-indigo-500 uppercase tracking-widest font-mono">Fats</span>
                <p className="text-xs font-black text-zinc-800 dark:text-white">
                  {parseFloat((selectedFood.fat * servings).toFixed(1))}g
                </p>
              </div>
            </div>

            {/* Medical warning if diabetes or asthma */}
            {illness === 'diabetes' && selectedFood.category === 'carbs' && selectedFood.calories > 150 && (
              <div className="p-2 py-1.5 bg-rose-50 dark:bg-red-950/20 rounded-xl border border-rose-100 dark:border-rose-900 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <span className="text-[9px] text-rose-700 dark:text-rose-400 font-bold leading-tight">
                  Contains dense carbohydrates. Monitor portions closely.
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFood(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-300 transition"
                id="cancel-log-btn"
              >
                Re-select
              </button>
              <button
                onClick={handleLog}
                className="flex-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition shadow-sm"
                id="confirm-log-btn"
              >
                <Check className="w-4 h-4" /> Add to Day Log
              </button>
            </div>
          </div>
        ) : null}

        {/* Search and Category Toggle Tabs */}
        <div className="px-5 pt-3 pb-2 flex flex-col gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search local or international food items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-zinc-800 dark:text-white transition"
              id="food-search-input"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 relative z-10 scrollbar-none">
            {['all', 'protein', 'carbs', 'fat'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as any)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all flex-shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-zinc-900 text-white dark:bg-indigo-600 dark:text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200'
                }`}
                id={`cat-filter-btn-${cat}`}
              >
                {cat === 'all' ? '🍽️ All' : cat === 'protein' ? '🥩 Protein' : cat === 'carbs' ? '🍞 Carbs' : '🥑 Fats'}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable food results listing */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          
          {/* 1. Local Foods Section */}
          {localFoods.length > 0 && (
            <div className="mb-4">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#dd6b20] flex items-center gap-1.5 mb-2.5">
                 Local Traditional Food Targets
              </span>
              <div className="flex flex-col gap-2">
                {localFoods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    className="p-3 w-full rounded-2xl bg-orange-50/30 dark:bg-zinc-800/40 border border-orange-100/50 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-zinc-700 ease-out transition flex justify-between items-center text-left"
                    id={`food-local-item-${food.id}`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-zinc-700 dark:text-zinc-200 leading-tight">
                          {food.name}
                        </span>
                        <span className="text-[9px] font-extrabold tracking-widest uppercase bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-400 px-1.5 py-0.5 rounded-md">
                          Local
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                        {food.servingSize} • P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-orange-600 dark:text-orange-400 font-mono">
                        {food.calories} kcal
                      </span>
                      <div className="w-7 h-7 rounded-full bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white flex items-center justify-center transition">
                        <Plus className="w-4 h-4 cursor-pointer" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Global Foods Section */}
          {internationalFoods.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400 flex items-center gap-1.5 mb-2.5">
                🌍 Non-Local / International Foods
              </span>
              <div className="grid grid-cols-1 gap-2">
                {internationalFoods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    className="p-3 w-full rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/40 hover:border-zinc-200 dark:hover:border-zinc-700 transition flex justify-between items-center text-left"
                    id={`food-int-item-${food.id}`}
                  >
                    <div>
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-100 block leading-tight">
                        {food.name}
                      </span>
                      <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                        {food.servingSize} • P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-zinc-500 dark:text-zinc-400 font-mono">
                        {food.calories} kcal
                      </span>
                      <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center transition">
                        <Plus className="w-3.5 h-3.5 cursor-pointer" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Zero results state */}
          {filteredFoods.length === 0 && (
            <div className="py-12 text-center text-zinc-400 flex flex-col items-center gap-2">
              <span className="text-3xl">🔍</span>
              <p className="text-xs font-semibold">No food items match your filters.</p>
              <p className="text-[10px] text-zinc-400">Try changing habits or search queries.</p>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
