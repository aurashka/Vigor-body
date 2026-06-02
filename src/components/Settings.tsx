/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { UserProfile, TargetBody, DietPreference, ExerciseLevel, Gender } from '../types';
import { COUNTRIES, ILLNESSES } from '../data';
import { 
  Settings as SettingsIcon, Moon, Sun, RefreshCw, Save, 
  HelpCircle, Shield, AlertTriangle, Check, Sliders
} from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsProps {
  userProfile: UserProfile;
  onChangeProfile: (profile: UserProfile) => void;
  theme: 'light' | 'dark';
  onChangeTheme: (mode: 'light' | 'dark') => void;
  onResetSystemTargetsOnly: () => void;
}

export default function Settings({
  userProfile,
  onChangeProfile,
  theme,
  onChangeTheme,
  onResetSystemTargetsOnly,
}: SettingsProps) {
  
  // Local state form buffers for profile fields
  const [name, setName] = useState(userProfile.name);
  const [age, setAge] = useState(userProfile.age);
  const [gender, setGender] = useState<Gender>(userProfile.gender);
  const [height, setHeight] = useState(userProfile.height);
  const [weight, setWeight] = useState(userProfile.weight);
  const [exerciseLevel, setExerciseLevel] = useState<ExerciseLevel>(userProfile.exerciseLevel);
  const [dietPreference, setDietPreference] = useState<DietPreference>(userProfile.dietPreference);
  const [country, setCountry] = useState(userProfile.country);
  const [targetBody, setTargetBody] = useState<TargetBody>(userProfile.targetBody);
  const [illness, setIllness] = useState(userProfile.illness);

  // Custom Macro Target Overrides state buffers
  const [customCal, setCustomCal] = useState(userProfile.caloriesTargetCustom?.toString() || '');
  const [customProt, setCustomProt] = useState(userProfile.proteinTargetCustom?.toString() || '');
  const [customCarb, setCustomCarb] = useState(userProfile.carbsTargetCustom?.toString() || '');
  const [customWater, setCustomWater] = useState(userProfile.waterTargetCustom?.toString() || '');
  const [customSteps, setCustomSteps] = useState(userProfile.stepsTargetCustom?.toString() || '');

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Deep update profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: UserProfile = {
      name: name.trim() || 'Champion',
      age: Math.max(12, Math.min(100, age)),
      gender,
      height: Math.max(80, Math.min(250, height)),
      weight: Math.max(25, Math.min(250, weight)),
      exerciseLevel,
      dietPreference,
      country,
      targetBody,
      illness,
      // Parse custom numeric targets if they are entered
      caloriesTargetCustom: customCal ? parseInt(customCal) : undefined,
      proteinTargetCustom: customProt ? parseInt(customProt) : undefined,
      carbsTargetCustom: customCarb ? parseInt(customCarb) : undefined,
      waterTargetCustom: customWater ? parseInt(customWater) : undefined,
      stepsTargetCustom: customSteps ? parseInt(customSteps) : undefined,
    };

    onChangeProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Trigger system clearing but keep logs
  const handleTriggerReset = () => {
    // Clear overriding custom states
    setCustomCal('');
    setCustomProt('');
    setCustomCarb('');
    setCustomWater('');
    setCustomSteps('');

    onResetSystemTargetsOnly();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col gap-5 p-4 pb-12 font-sans bg-zinc-50 dark:bg-zinc-950">
      
      {/* 1. Dark/Light Theme Settings Card */}
      <div className="bg-white dark:bg-zinc-900 p-4.5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 leading-none">
          Visual Interface Mode
        </h3>
        <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800 p-2.5 rounded-2xl">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Set Core Theme Mode</span>
          <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-100 dark:border-zinc-700">
            <button
              onClick={() => onChangeTheme('light')}
              className={`p-2 rounded-lg flex items-center justify-center transition ${
                theme === 'light' ? 'bg-indigo-600 text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-600'
              }`}
              id="theme-light-btn"
            >
              <Sun className="w-4 h-4 cursor-pointer" />
            </button>
            <button
              onClick={() => onChangeTheme('dark')}
              className={`p-2 rounded-lg flex items-center justify-center transition ${
                theme === 'dark' ? 'bg-indigo-600 text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-600'
              }`}
              id="theme-dark-btn"
            >
              <Moon className="w-4 h-4 cursor-pointer" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Custom Target Macros Overrides Section */}
      <div className="bg-white dark:bg-zinc-900 p-4.5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
            <Sliders className="w-4 h-4 text-indigo-500" /> Target Portions Overrides
          </h3>
        </div>
        <p className="text-[10px] text-zinc-400 mb-3 leading-tight">
          Manually enter targets if you have a clinician prescription. Leave blank to let the adaptive system compute targets.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-605" htmlFor="input-override-calories">Calories (kcal)</label>
            <input
              id="input-override-calories"
              type="number"
              placeholder="e.g. 1850"
              value={customCal}
              onChange={(e) => setCustomCal(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-850"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-605" htmlFor="input-override-protein">Protein Goal (g)</label>
            <input
              id="input-override-protein"
              type="number"
              placeholder="e.g. 130"
              value={customProt}
              onChange={(e) => setCustomProt(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-850"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-605" htmlFor="input-override-carbs">Carbs (g)</label>
            <input
              id="input-override-carbs"
              type="number"
              placeholder="e.g. 210"
              value={customCarb}
              onChange={(e) => setCustomCarb(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-850"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-605" htmlFor="input-override-water">Water Target (ml)</label>
            <input
              id="input-override-water"
              type="number"
              placeholder="e.g. 3200"
              value={customWater}
              onChange={(e) => setCustomWater(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-850"
            />
          </div>
          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-[10px] font-bold text-zinc-605" htmlFor="input-override-steps">Daily Walk Steps Milestone</label>
            <input
              id="input-override-steps"
              type="number"
              placeholder="e.g. 9000"
              value={customSteps}
              onChange={(e) => setCustomSteps(e.target.value)}
              className="px-3 text-xs py-2 font-semibold rounded-xl border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-850 w-full"
            />
          </div>
        </div>
      </div>

      {/* 3. Comprehensive Form Settings Field update */}
      <form onSubmit={handleSaveProfile} className="bg-white dark:bg-zinc-900 p-4.5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col gap-4">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest leading-none">
          Update Profile Metrics & Country
        </h3>

        {/* Name input */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300" htmlFor="settings-name">Name</label>
          <input
            id="settings-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-855"
          />
        </div>

        {/* Secondary metric selections split row */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-505" htmlFor="settings-age">Age (yrs)</label>
            <input
              id="settings-age"
              type="number"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value) || 24)}
              className="px-3 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-850 text-xs font-semibold"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-505" htmlFor="settings-gender">Biological Gender</label>
            <select
              id="settings-gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="px-3 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-850 text-xs font-semibold cursor-pointer"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non_binary">Non-binary</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-505" htmlFor="settings-height">Height (cm)</label>
            <input
              id="settings-height"
              type="number"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value) || 170)}
              className="px-3 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-850 text-xs font-semibold"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-505" htmlFor="settings-weight">Weight (kg)</label>
            <input
              id="settings-weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(parseInt(e.target.value) || 68)}
              className="px-3 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-850 text-xs font-semibold"
            />
          </div>
        </div>

        {/* Level Activity */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-zinc-505" htmlFor="settings-level">Daily Activity Level</label>
          <select
            id="settings-level"
            value={exerciseLevel}
            onChange={(e) => setExerciseLevel(e.target.value as ExerciseLevel)}
            className="px-3 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-850 text-xs font-semibold cursor-pointer"
          >
            <option value="beginner">Beginner (Mostly walking)</option>
            <option value="intermediate">Intermediate (Gym workout 3-4 days)</option>
            <option value="advanced">Advanced (Heavy training 5+ days)</option>
          </select>
        </div>

        {/* Selected Country and Habits */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1 text-xs">
            <label className="text-[10px] font-bold text-zinc-505" htmlFor="settings-country">Live Country Region</label>
            <select
              id="settings-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="px-3 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-850 text-xs font-semibold cursor-pointer"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <label className="text-[10px] font-bold text-zinc-505" htmlFor="settings-diet-pref">Dietary Preference</label>
            <select
              id="settings-diet-pref"
              value={dietPreference}
              onChange={(e) => setDietPreference(e.target.value as DietPreference)}
              className="px-3 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-850 text-xs font-semibold cursor-pointer"
            >
              <option value="veg">🥦 Veg</option>
              <option value="non_veg">🍗 Non-Veg</option>
              <option value="vegan">🌱 Vegan</option>
            </select>
          </div>
        </div>

        {/* Goal Body Target */}
        <div className="flex flex-col gap-1 text-xs">
          <label className="text-[10px] font-bold text-zinc-505" htmlFor="settings-target-body">Core Fit Target</label>
          <select
            id="settings-target-body"
            value={targetBody}
            onChange={(e) => setTargetBody(e.target.value as TargetBody)}
            className="px-3 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-850 text-xs font-semibold cursor-pointer"
          >
            <option value="fat_loss">🔥 Fat Loss / Deficit</option>
            <option value="muscle_gain">💪 Muscle Gain / Bulk</option>
            <option value="tone_shape">⏳ Shape & Tone Body</option>
            <option value="strength_building">🏋🏼 Strength Builder</option>
          </select>
        </div>

        {/* Illness guard */}
        <div className="flex flex-col gap-1 text-xs">
          <label className="text-[10px] font-bold text-zinc-505" htmlFor="settings-illness">Illness Adaptability</label>
          <select
            id="settings-illness"
            value={illness}
            onChange={(e) => setIllness(e.target.value)}
            className="px-3 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-850 text-xs font-semibold cursor-pointer"
          >
            {ILLNESSES.map((ill) => (
              <option key={ill.id} value={ill.id}>
                {ill.name}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons submission panel row */}
        <div className="flex gap-2 mt-2">
          <input type="submit" style={{display: 'none'}} />
          <button
            type="submit"
            onClick={handleSaveProfile}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
            id="settings-save-profile-btn"
          >
            <Check className="w-4 h-4 animate-bounce" /> Update Adaptive Plan
          </button>
        </div>

      </form>

      {/* 4. Critical System Configuration Clean resetting buttons */}
      <div className="bg-red-500/5 dark:bg-red-950/20 p-4.5 rounded-3xl border border-red-500/10 flex flex-col gap-3">
        <div>
          <span className="text-[10px] uppercase font-black text-rose-600 tracking-wider flex items-center gap-1 leading-none">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Dangerous Controls Center
          </span>
          <p className="text-[10px] text-zinc-400 mt-1 max-w-[280px] leading-tight">
            Clear all target overrides and restore dynamically computed values based on biometric formulas. Crucially, your completed logs, daily check-ins, and streaks remain 100% untouched.
          </p>
        </div>

        <button
          onClick={handleTriggerReset}
          className="w-full py-2.5 border border-red-200 hover:bg-rose-100/20 dark:border-rose-950 dark:hover:bg-rose-950/40 text-red-650 dark:text-red-400 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
          id="clear-overrides-reset-btn"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Clear target overrides (Keep streaks history)
        </button>
      </div>

      {/* Success saving Toast */}
      {saveSuccess && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-800 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 animate-bounce z-50">
          <Check className="w-4 h-4 text-emerald-400" /> Settings updated successfully!
        </div>
      )}

    </div>
  );
}
