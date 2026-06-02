/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { LeaderboardUser } from '../types';
import { COUNTRIES } from '../data';
import { Trophy, Medal, Flame, Search, Sparkles } from 'lucide-react';
import { database, auth } from '../firebase';
import { ref, onValue } from 'firebase/database';

interface LeaderboardProps {
  currentUserScore: number;
  currentUserCountry: string;
}

export default function Leaderboard({ currentUserScore, currentUserCountry }: LeaderboardProps) {
  const [competitors, setCompetitors] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync / Listen to all users from Realtime Database to extract real players
  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      setIsLoading(true);
      try {
        if (snapshot.exists()) {
          const allUsersRaw = snapshot.val();
          const parsed: LeaderboardUser[] = Object.keys(allUsersRaw).map((uid) => {
            const userData = allUsersRaw[uid];
            const profile = userData.profile || {};
            const name = profile.name || 'Anonymous Champion';
            const countryCode = profile.country || 'IN';
            const countryObj = COUNTRIES.find((c) => c.code === countryCode);
            const countryName = countryObj ? countryObj.name : 'Unknown';
            const countryFlag = countryObj ? countryObj.flag : '🌍';
            const score = userData.totalPoints !== undefined ? userData.totalPoints : 50;
            const gender = profile.gender || 'male';
            const avatarUrl = gender === 'female' ? '👧🏻' : gender === 'non_binary' ? '🧑🏼' : '👦🏻';

            return {
              rank: 0,
              name,
              country: `${countryFlag} ${countryName}`,
              score,
              isCurrentUser: uid === auth.currentUser?.uid,
              avatarUrl,
            };
          });

          // Sort by score in descending order and compute rank position
          const sorted = parsed
            .sort((a, b) => b.score - a.score)
            .map((player, idx) => ({
              ...player,
              rank: idx + 1,
            }));

          setCompetitors(sorted);
        } else {
          // Fallback to current real player if database has no records
          const myCountryObj = COUNTRIES.find((c) => c.code === currentUserCountry);
          setCompetitors([
            {
              rank: 1,
              name: 'You',
              country: `${myCountryObj?.flag || '🌍'} ${myCountryObj?.name || 'Your Country'}`,
              score: currentUserScore,
              isCurrentUser: true,
              avatarUrl: '👦🏻',
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching real players:', err);
      } finally {
        setIsLoading(false);
      }
    }, (error) => {
      console.error('Realtime Database listener error inside Leaderboard:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserScore, currentUserCountry]);

  // Use memoization for current user ranking
  const currentUser = useMemo(() => competitors.find((p) => p.isCurrentUser), [competitors]);

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 pb-12 font-sans bg-zinc-50 dark:bg-zinc-950">
      
      {/* Visual Trophy Header Card */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-5 rounded-3xl text-white shadow-md relative overflow-hidden flex flex-col justify-center">
        <div className="absolute right-3 bottom-0 opacity-15 text-[80px] pointer-events-none">
          🏆
        </div>
        <div className="relative z-10 flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-widest text-amber-100 bg-white/10 px-2.5 py-0.5 rounded-full w-max leading-none">
            Dynamic Motivation Arena
          </span>
          <h2 className="text-lg font-black tracking-tight mt-2 flex items-center gap-1.5 leading-none">
            Competitive Leaderboard <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </h2>
          <p className="text-[10px] text-amber-100 leading-normal mt-1 max-w-[280px]">
            Earn XP points by checking in metrics, walking target steps, eating clean regional foods, and completing your workouts!
          </p>
        </div>

        {/* User's Current Standing banner */}
        {!isLoading && currentUser && (
          <div className="mt-4 p-2 bg-black/15 rounded-xl border border-white/10 flex justify-between items-center text-xs">
            <span className="font-extrabold text-amber-200">Your Standing:</span>
            <span className="font-black font-mono animate-pulse">Rank #{currentUser.rank} • {currentUser.score} XP</span>
          </div>
        )}
      </div>

      {/* Leaderboard Competitors list */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden p-3.5">
        <span className="text-[10px] uppercase font-black text-zinc-400 tracking-wider mb-3.5 block px-1.5">
          Global & Regional Competitors Standings
        </span>

        <div className="flex flex-col gap-2">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-zinc-400 gap-2">
              <div className="w-7 h-7 border-2 border-lime-500/20 border-t-lime-500 dark:border-lime-500/20 dark:border-t-lime-400 animate-spin rounded-full"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider">Syncing Arena...</span>
            </div>
          ) : competitors.length === 0 ? (
            <div className="py-12 text-center text-[11px] text-zinc-400 font-medium">
              No competitors joined the arena yet. Share your app to invite real gym players!
            </div>
          ) : (
            competitors.map((player) => {
              const isSelf = player.isCurrentUser;
              const rankLabel = player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`;
              
              return (
                <div
                  key={player.rank}
                  className={`flex justify-between items-center px-3.5 py-3 rounded-2xl border transition duration-200 ${
                    isSelf
                      ? 'border-lime-500 bg-lime-50/20 dark:bg-zinc-850 dark:border-lime-500 shadow-xs'
                      : 'border-zinc-100 dark:border-zinc-800/40 bg-zinc-50 dark:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <span className={`w-8 text-center text-xs font-black font-mono text-zinc-500 ${
                      player.rank <= 3 ? 'text-lg' : ''
                    }`}>
                      {rankLabel}
                    </span>

                    {/* Competitor Avatar Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      isSelf ? 'bg-lime-100 border border-lime-200 dark:bg-lime-950/40 dark:border-lime-900/40' : 'bg-zinc-200/50'
                    }`}>
                      {player.avatarUrl || '🧑🏼'}
                    </div>

                    {/* Name and geographic region */}
                    <div>
                      <h4 className={`text-xs font-black leading-tight ${
                        isSelf ? 'text-lime-700 dark:text-lime-400 font-extrabold' : 'text-zinc-800 dark:text-zinc-200'
                      }`}>
                        {player.name} {isSelf && '(You)'}
                      </h4>
                      <span className="text-[9px] text-zinc-400 block font-sans">
                        {player.country}
                      </span>
                    </div>
                  </div>

                  {/* Score XP */}
                  <div className="text-right">
                    <span className={`text-xs font-black font-mono ${
                      isSelf ? 'text-lime-600 dark:text-lime-400' : 'text-zinc-700 dark:text-zinc-300'
                    }`}>
                      {player.score} <span className="text-[9px] font-bold text-zinc-400 font-sans">XP</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Arena motivation tips */}
      <div className="p-3.5 bg-lime-50/20 dark:bg-lime-950/20 rounded-2xl border border-lime-200/30 text-center">
        <Medal className="w-5 h-5 text-lime-500 mx-auto mb-1.5" />
        <span className="text-[11px] font-extrabold text-lime-700 dark:text-lime-400 block uppercase tracking-wider">
          Next Tier Reward at 1000 XP
        </span>
        <p className="text-[10px] text-zinc-400 leading-normal max-w-[280px] mx-auto mt-0.5">
          Hit your daily portions within macros limit for an instant +150 XP bonus reward before midnight lock.
        </p>
      </div>

    </div>
  );
}
