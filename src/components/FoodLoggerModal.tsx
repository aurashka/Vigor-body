/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { FoodItem, FoodEaten } from '../types';
import { FOODS_DATABASE, COUNTRIES } from '../data';
import { Search, X, Plus, Minus, Check, Sparkles, AlertCircle, MapPin, Globe, Utensils, Award, Flame } from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('vegetable_fruit');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState<number>(1);

  // Custom Food custom form state
  const [customName, setCustomName] = useState('');
  const [customWeight, setCustomWeight] = useState('100g');
  const [customProtein, setCustomProtein] = useState('10');
  const [customCarbs, setCustomCarbs] = useState('15');
  const [customFat, setCustomFat] = useState('2');
  const [customError, setCustomError] = useState<string | null>(null);

  // Sync category if clicked from macro panel on dashboard
  useEffect(() => {
    if (initialCategory) {
      if (initialCategory === 'protein' && userDietPref === 'non_veg') {
        setSelectedCategory('meat_only');
      } else {
        setSelectedCategory('vegetable_fruit');
      }
    } else {
      setSelectedCategory('vegetable_fruit');
    }
  }, [initialCategory, isOpen, userDietPref]);

  // Simpler category tab definition (Veggies & Fruits, Meat & Poultry, and Custom Portions)
  const categoryTabs = useMemo(() => {
    return [
      { id: 'vegetable_fruit', label: '🥦 Veg & Fruits' },
      { id: 'meat_only', label: '🥩 Meats & Poultry' },
      { id: 'custom_portion', label: '➕ Custom Portion' },
    ];
  }, []);

  // Helper check for animal items
  const isFoodNonVeg = (food: FoodItem) => {
    const name = food.name.toLowerCase();
    return (
      name.includes('chicken') ||
      name.includes('pork') ||
      name.includes('beef') ||
      name.includes('salmon') ||
      name.includes('tuna') ||
      name.includes('mackerel') ||
      name.includes('picadillo') ||
      name.includes('carnitas') ||
      name.includes('burger patty') ||
      name.includes('lamb') ||
      name.includes('kebab') ||
      name.includes('meat') ||
      name.includes('shredded chicken')
    );
  };

  const filteredFoods = useMemo(() => {
    let list = FOODS_DATABASE;

    // Apply strict non_veg/vegan filter in general lists if selected
    if (userDietPref === 'vegan') {
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
          !f.name.toLowerCase().includes('mackerel') &&
          !f.name.toLowerCase().includes('tuna') &&
          !f.name.toLowerCase().includes('carnitas') &&
          !f.name.toLowerCase().includes('picadillo') &&
          !f.name.toLowerCase().includes('patty') &&
          !f.name.toLowerCase().includes('lamb')
      );
    } else if (userDietPref === 'veg') {
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
          !f.name.toLowerCase().includes('patty') &&
          !f.name.toLowerCase().includes('lamb')
      );
    }

    // Filter by simplified tabs
    if (selectedCategory === 'vegetable_fruit') {
      list = list.filter((f) => f.category === 'vegetable_fruit');
    } else if (selectedCategory === 'meat_only') {
      list = list.filter((f) => isFoodNonVeg(f));
    }

    // Apply search filter if query is typed
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((f) => f.name.toLowerCase().includes(q));
    }

    return list;
  }, [userDietPref, selectedCategory, searchQuery]);

  // Split into Local and International lists
  const { localFoods, internationalFoods } = useMemo(() => {
    const local = filteredFoods.filter((f) => f.countries.includes(userCountry));
    const international = filteredFoods.filter((f) => !f.countries.includes(userCountry));
    return { localFoods: local, internationalFoods: international };
  }, [filteredFoods, userCountry]);

  const activeCountryObj = useMemo(() => {
    return COUNTRIES.find((c) => c.code === userCountry);
  }, [userCountry]);

  // Dynamic automatic calculation of Custom Portion calories
  const customCalculatedCalories = useMemo(() => {
    const p = parseFloat(customProtein) || 0;
    const c = parseFloat(customCarbs) || 0;
    const f = parseFloat(customFat) || 0;
    return Math.round(p * 4 + c * 4 + f * 9);
  }, [customProtein, customCarbs, customFat]);

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

  const handleLogCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);

    const nameTrimmed = customName.trim();
    if (!nameTrimmed) {
      setCustomError('Please provide a name of the portion food.');
      return;
    }

    const weightTrimmed = customWeight.trim() || '105g';
    const pVal = parseFloat(customProtein) || 0;
    const cVal = parseFloat(customCarbs) || 0;
    const fVal = parseFloat(customFat) || 0;

    if (pVal < 0 || cVal < 0 || fVal < 0) {
      setCustomError('Macronutrients value cannot be negative.');
      return;
    }

    onAddFood({
      foodId: 'custom_' + Date.now(),
      name: `${nameTrimmed} (${weightTrimmed})`,
      protein: parseFloat(pVal.toFixed(1)),
      carbs: parseFloat(cVal.toFixed(1)),
      fat: parseFloat(fVal.toFixed(1)),
      calories: customCalculatedCalories,
      servings: 1,
    });

    // Reset Form fields
    setCustomName('');
    setCustomWeight('100g');
    setCustomProtein('10');
    setCustomCarbs('15');
    setCustomFat('2');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-end justify-center z-50 animate-fade-in font-sans px-0">
      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 200, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-[440px] bg-white dark:bg-[#18181b] border-t border-zinc-200 dark:border-zinc-800 rounded-t-[32px] max-h-[94%] flex flex-col shadow-2xl relative"
      >
        {/* Top Handle drag bar */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto my-3 cursor-pointer" onClick={onClose}></div>

        {/* Header Section */}
        <div className="px-5 pb-3 flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/80">
          <div>
            <h3 className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5 uppercase font-mono">
              Log Balanced Meals <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Focusing purely on organic greens, fresh fruits, and protein meats</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
            id="close-modal-btn"
          >
            <X className="w-4 h-4 text-zinc-500 dark:text-zinc-405" />
          </button>
        </div>

        {/* Selected standard item overlay calculator details */}
        {selectedFood ? (
          <div className="p-5 flex flex-col gap-4 bg-lime-50/20 dark:bg-lime-950/20 border-b border-lime-100 dark:border-lime-900/45">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-250 dark:border-zinc-700">
                  {selectedFood.category === 'vegetable_fruit' ? '🥦 Fresh Produce' : '🍖 Meat Protein'}
                </span>
                <h4 className="text-sm font-black text-zinc-900 dark:text-white mt-1.5 leading-tight">{selectedFood.name}</h4>
                <p className="text-[10px] text-zinc-400 mt-1">One Portion Serving size: {selectedFood.servingSize}</p>
              </div>

              {/* Servings counter */}
              <div className="flex items-center gap-3 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-xs">
                <button
                  onClick={() => setServings(Math.max(0.5, servings - 0.5))}
                  className="w-6 h-6 rounded-md bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center active:scale-95 text-zinc-600 dark:text-zinc-350 hover:bg-zinc-100"
                  id="dec-servings-btn"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-black min-w-8 text-center text-zinc-800 dark:text-white font-mono">{servings}x</span>
                <button
                  onClick={() => setServings(servings + 0.5)}
                  className="w-6 h-6 rounded-md bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center active:scale-95 text-zinc-600 dark:text-zinc-350 hover:bg-zinc-100"
                  id="inc-servings-btn"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Simulated Nutrition Plate */}
            <div className="grid grid-cols-4 gap-2 bg-white dark:bg-zinc-800 p-3 rounded-2xl border border-zinc-150 dark:border-zinc-700 text-center shadow-sm">
              <div>
                <span className="text-[10px] text-zinc-405 uppercase tracking-widest font-mono block">Energy</span>
                <p className="text-xs font-black text-zinc-850 dark:text-white mt-0.5 font-mono">
                  {Math.round(selectedFood.calories * servings)} <span className="text-[9px] font-normal">kcal</span>
                </p>
              </div>
              <div>
                <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-mono block">Protein</span>
                <p className="text-xs font-black text-zinc-850 dark:text-white mt-0.5 font-mono">
                  {parseFloat((selectedFood.protein * servings).toFixed(1))}g
                </p>
              </div>
              <div>
                <span className="text-[10px] text-amber-500 uppercase tracking-widest font-mono block">Carbs</span>
                <p className="text-xs font-black text-zinc-850 dark:text-white mt-0.5 font-mono">
                  {parseFloat((selectedFood.carbs * servings).toFixed(1))}g
                </p>
              </div>
              <div>
                <span className="text-[10px] text-lime-600 dark:text-lime-400 uppercase tracking-widest font-mono block">Fats</span>
                <p className="text-xs font-black text-zinc-850 dark:text-white mt-0.5 font-mono">
                  {parseFloat((selectedFood.fat * servings).toFixed(1))}g
                </p>
              </div>
            </div>

            {/* Medical illness warning */}
            {illness === 'diabetes' && selectedFood.category === 'carbs' && (
              <div className="p-2 py-1.5 bg-rose-50 dark:bg-red-950/25 rounded-xl border border-rose-100 dark:border-rose-900/40 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <span className="text-[9px] text-rose-700 dark:text-rose-400 font-bold leading-tight">
                  🚨 Diabetes Watch: Active glucose-balanced check advised.
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFood(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-300 transition cursor-pointer"
                id="cancel-log-btn"
              >
                Go Back
              </button>
              <button
                onClick={handleLog}
                className="flex-2 py-2.5 bg-lime-500 hover:bg-lime-600 dark:bg-lime-400 dark:hover:bg-lime-500 text-zinc-950 dark:text-zinc-950 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                id="confirm-log-btn"
              >
                <Check className="w-4 h-4" /> Log Day Record
              </button>
            </div>
          </div>
        ) : null}

        {/* Tab Selection Filter Panel */}
        <div className="px-5 pt-3.5 pb-2 flex flex-col gap-2 relative z-10">
          
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedCategory(tab.id);
                  setCustomError(null);
                }}
                className={`px-4 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-widest transition-all duration-150 flex-shrink-0 cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-zinc-900 text-white dark:bg-lime-400 dark:text-zinc-950 shadow-md'
                    : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
                id={`cat-filter-btn-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Standard search bar - only shown for listing vegetables and meats */}
          {selectedCategory !== 'custom_portion' && (
            <div className="relative mt-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder={`Search whole ${selectedCategory === 'vegetable_fruit' ? 'veggies & fruits' : 'meat products'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-lime-500/50 text-zinc-800 dark:text-white transition"
                id="food-search-input"
              />
            </div>
          )}
        </div>

        {/* Tab Body contents */}
        {selectedCategory === 'custom_portion' ? (
          
          /* Custom Portion Form Maker */
          <div className="flex-1 overflow-y-auto px-5 pb-8">
            <form onSubmit={handleLogCustomItem} className="flex flex-col gap-3.5 pt-2 bg-transparent">
              
              {customError && (
                <div className="p-3 bg-rose-50/80 dark:bg-red-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="text-[10px] text-rose-700 dark:text-rose-450 font-bold leading-tight">{customError}</span>
                </div>
              )}

              {/* Name field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  Homemade Food / Meal Name
                </label>
                <div className="relative">
                  <Utensils className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Boiled Potato, Cooked Mutton Curry, Apple Pie"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold rounded-xl text-zinc-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500/50"
                  />
                </div>
              </div>

              {/* Grid: Weight/Portion and Fats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    Weight (Portion)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 150g, 1 bowl, 2 pieces"
                    value={customWeight}
                    onChange={(e) => setCustomWeight(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold rounded-xl text-zinc-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#4c51bf] dark:text-blue-400">
                    Fat Amount (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-mono font-bold rounded-xl text-zinc-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500/50"
                  />
                </div>
              </div>

              {/* Grid: Proteins and Carbs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#2f855a] dark:text-emerald-400">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-mono font-bold rounded-xl text-zinc-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#c05621] dark:text-orange-400">
                    Carbohydrate (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-mono font-bold rounded-xl text-zinc-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500/50"
                  />
                </div>
              </div>

              {/* High-contrast automatic live calorie computation preview card */}
              <div className="bg-[#0c0c0e] border border-zinc-800 text-white rounded-2xl p-4 mt-1 flex justify-between items-center shadow-md">
                <div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 font-mono">
                    PORTION CALORIES REPORT
                  </span>
                  <div className="text-xl font-black text-lime-400 font-mono mt-0.5">
                    {customCalculatedCalories} <span className="text-xs font-normal text-white">kcal</span>
                  </div>
                  <p className="text-[9px] text-zinc-500 mt-1">Calculated via metabolic index: (4xP + 4xC + 9xF)</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800/60 border border-slate-700 flex items-center justify-center text-lg shadow-inner">
                  🔥
                </div>
              </div>

              {/* Submit custom food */}
              <button
                type="submit"
                className="w-full py-3 bg-lime-500 hover:bg-lime-600 dark:bg-lime-450 dark:hover:bg-lime-500 text-zinc-950 font-extrabold tracking-wider uppercase transition cursor-pointer shadow-md select-none flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" /> Save & Log Custom Portion
              </button>

            </form>
          </div>
        ) : (
          
          /* Vegetables and Meats listing and results */
          <div className="flex-1 overflow-y-auto px-5 pb-6">
            
            {/* 1. LOCAL TRADITIONAL FOODS SECTION */}
            {(localFoods.length > 0 || selectedCategory === 'vegetable_fruit') && (
              <div className="mb-4">
                <span className="text-[9px] uppercase font-black tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-2.5 font-mono">
                   <MapPin className="w-3 h-3 text-amber-500" /> {activeCountryObj ? `${activeCountryObj.flag} ${activeCountryObj.name} Staple Diet` : 'Local Regional Staples'}
                </span>
                <div className="flex flex-col gap-2">
                  {localFoods.length === 0 && selectedCategory === 'vegetable_fruit' ? (
                    filteredFoods.slice(0, 15).map((food) => (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => handleSelectFood(food)}
                        className="p-3 w-full rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-150 dark:border-zinc-800/40 hover:border-lime-500 dark:hover:border-lime-400 ease-out transition flex justify-between items-center text-left cursor-pointer"
                        id={`food-local-item-${food.id}`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-zinc-850 dark:text-zinc-150 leading-tight">
                              {food.name}
                            </span>
                            <span className="text-[8px] font-black tracking-widest uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 px-1.5 py-0.5 rounded-md">
                              Fresh
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-405 dark:text-zinc-400 mt-1 font-mono">
                            {food.servingSize} • P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            {food.calories} kcal
                          </span>
                          <div className="w-6.5 h-6.5 rounded-full bg-emerald-500/10 text-emerald-650 flex items-center justify-center">
                            <Plus className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    localFoods.map((food) => {
                      const nonVegTag = isFoodNonVeg(food);
                      return (
                        <button
                          key={food.id}
                          type="button"
                          onClick={() => handleSelectFood(food)}
                          className="p-3 w-full rounded-2xl bg-amber-50/20 dark:bg-zinc-800/30 border border-amber-100/50 dark:border-zinc-800/80 hover:border-amber-400 dark:hover:border-zinc-700 ease-out transition flex justify-between items-center text-left cursor-pointer"
                          id={`food-local-item-${food.id}`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-extrabold text-zinc-850 dark:text-zinc-150 leading-tight">
                                {food.name}
                              </span>
                              <span className="text-[8px] font-black tracking-widest uppercase bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 px-1.5 py-0.5 rounded-md">
                                Local
                              </span>
                              {nonVegTag && (
                                <span className="text-[8px] font-black tracking-widest uppercase bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 px-1.5 py-0.5 rounded-md font-mono">
                                  Meat
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-405 dark:text-zinc-405 mt-1 font-mono">
                              {food.servingSize} • P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">
                              {food.calories} kcal
                            </span>
                            <div className="w-6.5 h-6.5 rounded-full bg-amber-500/10 text-amber-650 flex items-center justify-center">
                              <Plus className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* 2. INTERNATIONAL SELECTIONS SECTION */}
            {internationalFoods.length > 0 && !(selectedCategory === 'vegetable_fruit' && localFoods.length === 0) && (
              <div>
                <span className="text-[9px] uppercase font-black tracking-widest text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 mb-2.5 font-mono animate-pulse">
                  <Globe className="w-3 h-3 text-zinc-400" /> Global Requisites & Classics
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {internationalFoods.map((food) => {
                    const nonVegTag = isFoodNonVeg(food);
                    return (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => handleSelectFood(food)}
                        className="p-3 w-full rounded-2xl bg-zinc-50 dark:bg-zinc-800/10 border border-zinc-150 dark:border-zinc-800/30 hover:border-zinc-300 dark:hover:border-zinc-700 transition flex justify-between items-center text-left cursor-pointer"
                        id={`food-int-item-${food.id}`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-zinc-850 dark:text-zinc-150 block leading-tight">
                              {food.name}
                            </span>
                            {nonVegTag && (
                              <span className="text-[8px] font-black tracking-widest uppercase bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-450 px-1.5 py-0.5 rounded-md font-mono">
                                Meat
                              </span>
                            )}
                            {food.category === 'vegetable_fruit' && (
                              <span className="text-[8px] font-black tracking-widest uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 px-1.5 py-0.5 rounded-md font-mono">
                                Produce
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-405 dark:text-zinc-405 mt-1 font-mono">
                            {food.servingSize} • P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-zinc-500 dark:text-zinc-405 font-mono">
                            {food.calories} kcal
                          </span>
                          <div className="w-6.5 h-6.5 rounded-full bg-zinc-200/50 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center transition hover:bg-lime-400 hover:text-zinc-950">
                            <Plus className="w-3.5 h-3.5 animate-pulse" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Vegetarian info warning notice */}
            {selectedCategory === 'meat_only' && (userDietPref === 'veg' || userDietPref === 'vegan') && (
              <div className="p-4 bg-amber-50/40 dark:bg-amber-950/15 border border-dashed border-amber-200 dark:border-amber-900/60 rounded-2xl text-center">
                <p className="text-xs font-extrabold text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1.5">
                  🛡️ Diet Limitation Applied
                </p>
                <p className="text-[10.5px] text-zinc-500 mt-1 leading-normal">
                  Your dietary habit is set to <strong>{userDietPref === 'veg' ? 'Vegetarian' : 'Vegan'}</strong>, so standard animal meat lists are hidden. Switch to the <strong>Custom Portion</strong> tab to write or set other custom foods!
                </p>
              </div>
            )}

            {/* Empty results container */}
            {filteredFoods.length === 0 && !(selectedCategory === 'meat_only' && (userDietPref === 'veg' || userDietPref === 'vegan')) && (
              <div className="py-12 text-center text-zinc-400 flex flex-col items-center gap-2 font-sans">
                <span className="text-3xl">🥦</span>
                <p className="text-xs font-semibold">No whole foods matching your criteria.</p>
                <p className="text-[10px] text-zinc-500">Go to the Custom Portion tab to set exactly what you ate!</p>
              </div>
            )}

          </div>
        )}

      </motion.div>
    </div>
  );
}
