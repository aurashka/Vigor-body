/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, TargetBody, DietPreference, ExerciseLevel, Gender } from '../types';
import { COUNTRIES, ILLNESSES } from '../data';
import { Check, ArrowRight, ArrowLeft,Sparkles, Dumbbell, Activity, HeartCrack } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(24);
  const [gender, setGender] = useState<Gender>('male');
  const [height, setHeight] = useState<number>(170); // cm
  const [weight, setWeight] = useState<number>(68); // kg
  const [exerciseLevel, setExerciseLevel] = useState<ExerciseLevel>('intermediate');
  const [dietPreference, setDietPreference] = useState<DietPreference>('veg');
  const [country, setCountry] = useState('IN');
  const [targetBody, setTargetBody] = useState<TargetBody>('tone_shape');
  const [illness, setIllness] = useState('none');

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete({
        name: name.trim() || 'Champion',
        age,
        gender,
        height,
        weight,
        exerciseLevel,
        dietPreference,
        country,
        targetBody,
        illness,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const isNameValid = name.trim().length > 0;

  return (
    <div className="flex-1 flex flex-col justify-between p-5 bg-gradient-to-b from-lime-50/30 to-white dark:from-zinc-900/60 dark:to-zinc-950 font-sans h-full overflow-y-auto">
      
      {/* Top Banner & Multi-step indicator */}
      <div className="flex flex-col gap-2 pt-2">
        <div className="flex justify-between items-center text-xs font-semibold text-lime-700 dark:text-lime-400">
          <span className="uppercase tracking-widest font-mono">Plan Calibration</span>
          <span>Step {step} of 4</span>
        </div>
        <div className="flex gap-1.5 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div className="bg-lime-500 dark:bg-lime-400 rounded-full transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>
      </div>

      {/* Dynamic onboarding steps */}
      <div className="flex-1 my-6 flex flex-col justify-start">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-1.5">
                <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                  Welcome to Vigor Gym <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Let us build a customized daily diet and body-shaping workout plan tailored exactly to you.
                </p>
              </div>

              {/* Name Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider" htmlFor="input-name">
                  What should we call you? *
                </label>
                <input
                  id="input-name"
                  type="text"
                  placeholder="Enter your name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-lime-500/50 text-sm font-semibold transition"
                />
              </div>

              {/* Age Picker */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider" htmlFor="input-age">
                    Your Age
                  </label>
                  <span className="text-sm font-extrabold text-lime-700 dark:text-lime-400">{age} years</span>
                </div>
                <input
                  id="input-age"
                  type="range"
                  min="12"
                  max="85"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value))}
                  className="w-full accent-lime-500"
                />
                <div className="flex justify-between text-[10px] font-semibold text-zinc-400 font-mono">
                  <span>12 yrs</span>
                  <span>50 yrs</span>
                  <span>85 yrs</span>
                </div>
              </div>

              {/* Gender Radio */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">
                  Select Biological Gender
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['male', 'female', 'non_binary'] as Gender[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-3 rounded-xl border text-xs font-extrabold tracking-wide uppercase transition flex flex-col items-center gap-1.5 ${
                        gender === g
                          ? 'border-lime-500 bg-lime-50/20 dark:bg-lime-950/20 text-lime-700 dark:text-lime-400 dark:border-lime-400 shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400'
                      }`}
                      id={`gender-btn-${g}`}
                    >
                      <span>{g === 'male' ? 'Male (He)' : g === 'female' ? 'Female (She)' : 'Non-Binary'}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                  Metrics & Exercise <Dumbbell className="w-5 h-5 text-lime-600 dark:text-lime-400" />
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Calibrate your physical composition to derive safe active calories.
                </p>
              </div>

              {/* Height Input */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">Height (cm)</span>
                  <span className="font-mono font-extrabold text-lime-700 dark:text-lime-400">{height} cm</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="220"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="w-full accent-lime-500"
                  id="height-slider"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>100 cm</span>
                  <span>160 cm</span>
                  <span>220 cm</span>
                </div>
              </div>

              {/* Weight Input */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">Weight (kg)</span>
                  <span className="font-mono font-extrabold text-lime-700 dark:text-lime-400">{weight} kg</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="150"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value))}
                  className="w-full accent-lime-500"
                  id="weight-slider"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>35 kg</span>
                  <span>90 kg</span>
                  <span>150 kg</span>
                </div>
              </div>

              {/* Exercise Level Selector */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">Daily Activity Level</span>
                <div className="flex flex-col gap-2">
                  {(['beginner', 'intermediate', 'advanced'] as ExerciseLevel[]).map((level) => {
                    const desc = 
                      level === 'beginner' ? 'Light exercise, mostly walking or minimal sports.' :
                      level === 'intermediate' ? 'Gym/Home workouts 3-4 days a week with active hobbies.' :
                      'Rigorous lifting or intensive training/body shaping 5+ days a week.';
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setExerciseLevel(level)}
                        className={`p-3.5 rounded-xl border text-left transition ${
                          exerciseLevel === level
                            ? 'border-lime-500 bg-lime-50/20 dark:bg-lime-950/20 dark:border-lime-400 shadow-sm'
                            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                        }`}
                        id={`exercise-level-${level}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-extrabold uppercase tracking-wide text-zinc-900 dark:text-white">
                            {level}
                          </span>
                          {exerciseLevel === level && <Check className="w-4 h-4 text-lime-600 dark:text-lime-400 font-bold" />}
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-normal">{desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                  Country & Preference <Activity className="w-5 h-5 text-lime-600 dark:text-lime-400" />
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  We use your location to offer exact day-to-day traditional nutrition & localized meals.
                </p>
              </div>

              {/* Country Picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider" htmlFor="select-country">
                  Select Country
                </label>
                <div className="relative">
                  <select
                    id="select-country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-lime-500/50 transition appearance-none cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code} className="py-2">
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                    ▼
                  </div>
                </div>
              </div>

              {/* Diet Preference */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">
                  Diet preference (Food habits)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['veg', 'non_veg', 'vegan'] as DietPreference[]).map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => setDietPreference(pref)}
                      className={`py-3.5 rounded-xl border text-xs font-extrabold tracking-wide uppercase transition ${
                        dietPreference === pref
                          ? 'border-lime-500 bg-lime-50/20 dark:bg-lime-950/20 dark:border-lime-400 text-lime-700 dark:text-lime-400 shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400'
                      }`}
                      id={`diet-pref-${pref}`}
                    >
                      {pref === 'veg' ? '🥦 Veg' : pref === 'non_veg' ? '🍗 Non-Veg' : '🌱 Vegan'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Body Goal */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">
                  Core Body Target Goal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['fat_loss', 'muscle_gain', 'tone_shape', 'strength_building'] as TargetBody[]).map((target) => {
                    const icon = 
                      target === 'fat_loss' ? '🔥' :
                      target === 'muscle_gain' ? '💪' :
                      target === 'tone_shape' ? '⏳' : '🏋🏼';
                    const title = 
                      target === 'fat_loss' ? 'Fat Loss / Deficit' :
                      target === 'muscle_gain' ? 'Muscle Gain / Bulk' :
                      target === 'tone_shape' ? 'Shape & Tone body' : 'Strength Builder';
                    return (
                      <button
                        key={target}
                        type="button"
                        onClick={() => setTargetBody(target)}
                        className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                          targetBody === target
                            ? 'border-lime-500 bg-lime-50/20 dark:bg-lime-950/20 dark:border-lime-400 text-lime-700 dark:text-lime-400 shadow-sm'
                            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400'
                        }`}
                        id={`target-body-${target}`}
                      >
                        <span className="text-lg">{icon}</span>
                        <span className="text-[10px] font-extrabold uppercase tracking-wide leading-tight">{title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                  Safe Medical Guard <HeartCrack className="w-5 h-5 text-red-500" />
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Select chronic illnesses or physical constraints to adjust exercise impacts.
                </p>
              </div>

              {/* Illness Selector */}
              <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
                {ILLNESSES.map((ill) => (
                  <button
                    key={ill.id}
                    type="button"
                    onClick={() => setIllness(ill.id)}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                      illness === ill.id
                        ? 'border-red-500 bg-red-50/40 dark:bg-red-950/20 dark:border-red-500 shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                    }`}
                    id={`illness-item-${ill.id}`}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      illness === ill.id ? 'border-red-500 bg-red-500 text-white' : 'border-zinc-300 dark:border-zinc-700'
                    }`}>
                      {illness === ill.id && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white">{ill.name}</span>
                      <p className="text-[10px] text-zinc-400 leading-tight">{ill.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Pre-Disclaimer */}
              <div className="p-3 bg-amber-500/10 dark:bg-amber-500/5 rounded-xl border border-amber-500/20 flex gap-2">
                <span className="text-amber-500 font-extrabold text-sm mt-0.5">⚠️</span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 leading-tight font-medium">
                  We modify your exercises (e.g. low-impact if Joint Pain) but the guide is informational. Advise with your clinician before executing new lifting routines.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Button Controls Footer */}
      <div className="flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-xs border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition"
            id="onboarding-back-btn"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}

        <button
          onClick={handleNext}
          disabled={step === 1 && !isNameValid}
          className={`flex-2 flex items-center justify-center gap-1.5 py-3 rounded-xl font-extrabold text-xs text-zinc-950 transition shadow-md ${
            step === 1 && !isNameValid
              ? 'bg-zinc-300 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none'
              : 'bg-lime-500 hover:bg-lime-600 dark:bg-lime-400 dark:hover:bg-lime-500'
          }`}
          id="onboarding-next-btn"
        >
          {step === 4 ? 'Build Custom Plan' : 'Continue'} 
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
