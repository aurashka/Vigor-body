/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Sparkles, Trophy, Flame, HelpCircle, Dumbbell, Star, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { ALL_RANKS_MILESTONES } from '../utils';

export default function Guide() {
  return (
    <div className="flex-1 flex flex-col gap-5 p-4 pb-12 font-sans bg-zinc-50 dark:bg-zinc-950 overflow-y-auto">
      
      {/* Header Splash Card */}
      <div className="bg-gradient-to-r from-lime-500/10 via-emerald-500/15 to-transparent border border-zinc-150 dark:border-zinc-800 rounded-3xl p-5 relative overflow-hidden">
        <div className="absolute top-4 right-4 text-lime-500 animate-pulse">
          <BookOpen className="w-8 h-8" />
        </div>
        <span className="text-[10px] font-black uppercase text-lime-700 dark:text-lime-400 tracking-wider bg-lime-500/10 px-2 py-0.5 rounded">
          SYSTEM REFERENCE
        </span>
        <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mt-2.5">
          VIGOR ACADEMY MANUAL
        </h2>
        <p className="text-[11px] text-zinc-400 leading-relaxed mt-1.5 max-w-[280px]">
          Master your workouts, climb the competitive leaderboard arena, and scale your evolutionary title from Rank D- to SSS.
        </p>
      </div>

      {/* Interactive FAQ Tabs */}
      <div className="flex flex-col gap-4">

        {/* Section 1: How to Track Exercises */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-4.5"
        >
          <h3 className="text-xs font-black uppercase text-zinc-800 dark:text-zinc-200 flex items-center gap-2 mb-2.5">
            <span className="w-5 h-5 bg-lime-500/15 text-lime-650 dark:text-lime-400 rounded-lg flex items-center justify-center text-[10px] font-extrabold">1</span>
            How to Log & Perform Exercises
          </h3>
          <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
            Your home dashboard generates a <strong className="text-zinc-700 dark:text-zinc-300">Progressive Overload Workout Plan</strong> customized to your specific body target (e.g., muscle Gain, general fitness, health shaping). 
          </p>
          <ul className="text-[10.5px] text-zinc-400 mt-2.5 space-y-2 pl-1.5 list-none">
            <li className="flex gap-2">
              <span className="text-lime-500 font-extrabold">➔</span>
              <span><strong>Mark Reps & Sets:</strong> Tick checkboxes as you complete your daily fitness targets. Each completed target rewards you with instant experience points (XP).</span>
            </li>
            <li className="flex gap-2">
              <span className="text-lime-500 font-extrabold">➔</span>
              <span><strong>Calorie targets:</strong> Customize your target within settings to see real-time calorie deficits and water thresholds.</span>
            </li>
          </ul>
        </motion.div>

        {/* Section 2: Daily Gym Photo Upload */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-4.5"
        >
          <h3 className="text-xs font-black uppercase text-zinc-800 dark:text-zinc-200 flex items-center gap-2 mb-2.5">
            <span className="w-5 h-5 bg-lime-500/15 text-lime-650 dark:text-lime-400 rounded-lg flex items-center justify-center text-[10px] font-extrabold">2</span>
            Daily Gym Upload Rules
          </h3>
          <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
            Visual proof is the ultimate driver of discipline. Uploading daily selfies/photos helps you track your body change in a neat calendar grid.
          </p>
          <div className="bg-zinc-50 dark:bg-zinc-855 rounded-2xl p-3 border border-zinc-150 dark:border-zinc-800/85 mt-3">
            <span className="text-[9px] uppercase font-black text-lime-600 dark:text-lime-400 block tracking-wider font-mono">⚠️ 1 Post Per Day Restriction</span>
            <p className="text-[10px] text-zinc-400 leading-relaxed mt-1 font-medium">
              To keep check-ins real and prevent spam, our system enforces a strict one check-in post per day limit. Take your high-fidelity photo block every morning to log your journey.
            </p>
          </div>
        </motion.div>

        {/* Section 3: Arena & Cheer Ups */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-4.5"
        >
          <h3 className="text-xs font-black uppercase text-zinc-800 dark:text-zinc-200 flex items-center gap-2 mb-2.5">
            <span className="w-5 h-5 bg-lime-500/15 text-lime-650 dark:text-lime-400 rounded-lg flex items-center justify-center text-[10px] font-extrabold">3</span>
            Arena Leaderboard & Cheer Ups
          </h3>
          <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
            Our global fitness Arena syncs real competitors across the globe in real-time. 
          </p>
          <ul className="text-[10.5px] text-zinc-400 mt-2.5 space-y-2.5 pl-1.5 list-none">
            <li className="flex gap-2">
              <span className="text-lime-500 font-extrabold">➔</span>
              <span><strong>Visit Profiles:</strong> Tap on any competitor's name in the Arena table to pull open their full custom profile view showing weight, bmi tracker, bio and photo progression.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-lime-500 font-extrabold">➔</span>
              <span><strong>Cheer Up Actions:</strong> Click on any photo inside a competitor's timeline to view it full screen and hit the <strong>Cheer Up (!)</strong> button to like and support their grind! Likes persist dynamically across Firebase.</span>
            </li>
          </ul>
        </motion.div>

        {/* Section 4: Evolutionary Rank Scale (Tree Chart) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-4.5"
        >
          <h3 className="text-xs font-black uppercase text-zinc-800 dark:text-zinc-200 flex items-center gap-2 mb-1.5">
            <span className="w-5 h-5 bg-lime-500/15 text-lime-650 dark:text-lime-400 rounded-lg flex items-center justify-center text-[10px] font-extrabold">4</span>
            The Rank Evolution Tree Chart
          </h3>
          <p className="text-[10.5px] text-zinc-400 leading-relaxed font-medium mb-4">
            Earn titles and unlock higher tiers. Every milestone represents a major step towards elite physical fitness. Each rank features dynamic color signatures:
          </p>

          <div className="flex flex-col gap-1.5 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-2xl border border-zinc-150 dark:border-zinc-850 max-h-[300px] overflow-y-auto">
            {ALL_RANKS_MILESTONES.map((milestone) => (
              <div 
                key={milestone.rank}
                className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-150/40 dark:border-zinc-800/60 p-2.5 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${milestone.rankGlowClass}`}>
                    {milestone.rank}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wide">
                    Level {milestone.level}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black font-mono text-zinc-800 dark:text-zinc-200">
                    {milestone.xp.toLocaleString()} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* Footer Motivation Banner */}
      <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl text-center">
        <Sparkles className="w-5 h-5 text-lime-500 mx-auto mb-1.5" />
        <span className="text-[10px] font-black uppercase text-zinc-700 dark:text-zinc-300 block tracking-widest">
          LEVEL UP SUCCESS PLAN
        </span>
        <p className="text-[9.5px] text-zinc-400 leading-relaxed mt-1 max-w-[280px] mx-auto">
          "Consistency beats talent every single day. Log your targets, earn your XP milestones, and write your progress on the Arena list!"
        </p>
      </div>

    </div>
  );
}
