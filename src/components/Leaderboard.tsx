/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { LeaderboardUser } from '../types';
import { COUNTRIES } from '../data';
import { Trophy, Medal, Flame, Search, Sparkles, Heart, Calendar, Award as TrophyIcon } from 'lucide-react';
import { database, auth } from '../firebase';
import { ref, onValue, set } from 'firebase/database';
import { motion } from 'motion/react';
import { calculateUserRankAndLevel } from '../utils';

interface LeaderboardProps {
  currentUserScore: number;
  currentUserCountry: string;
}

export default function Leaderboard({ currentUserScore, currentUserCountry }: LeaderboardProps) {
  const [competitors, setCompetitors] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState<LeaderboardUser | null>(null);
  const [selectedVisitorPost, setSelectedVisitorPost] = useState<any | null>(null);

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

            const postsRaw = userData.posts || {};
            const parsedPosts = Object.keys(postsRaw).map((postId) => ({
              id: postId,
              ...postsRaw[postId],
            })).sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());

            return {
              rank: 0,
              uid,
              name,
              country: `${countryFlag} ${countryName}`,
              score,
              isCurrentUser: uid === auth.currentUser?.uid,
              avatarUrl,
              profile,
              posts: parsedPosts,
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
                  onClick={() => setSelectedVisitor(player)}
                  className={`flex justify-between items-center px-3.5 py-3 rounded-2xl border transition duration-200 cursor-pointer hover:scale-[1.01] active:scale-[0.99] select-none ${
                    isSelf
                      ? 'border-lime-500 bg-lime-50/20 dark:bg-zinc-850 dark:border-lime-500 shadow-xs'
                      : 'border-zinc-100 dark:border-zinc-800/40 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
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

      {/* 2. Overlaid Competitor Visitor Profile Modal Sheet */}
      {selectedVisitor && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-[2000] flex flex-col justify-end" onClick={() => setSelectedVisitor(null)}>
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="bg-zinc-50 dark:bg-zinc-950 max-h-[90vh] overflow-y-auto rounded-t-[32px] border-t border-zinc-200 dark:border-zinc-800 p-5 pb-12 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top exit trigger bar */}
            <div className="flex justify-between items-center mb-4 pl-1">
              <span className="text-[10px] uppercase font-black text-zinc-400 tracking-wider font-mono">
                Competitor Profile Visited
              </span>
              <button 
                onClick={() => setSelectedVisitor(null)}
                className="bg-zinc-250 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full px-3.5 py-1 font-extrabold text-xs cursor-pointer focus:outline-none"
              >
                Close
              </button>
            </div>

            {/* Profile Summary Card */}
            {(() => {
              const visitorStats = calculateUserRankAndLevel(selectedVisitor.score);
              const visitorProfile = selectedVisitor.profile || {};
              const targetBodyText = visitorProfile.targetBody ? visitorProfile.targetBody.replace('_', ' ') : 'shaping model';

              return (
                <div className="flex flex-col gap-4">
                  {/* Avatar & Key Rank Header */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-4.5 rounded-3xl flex flex-col items-center relative overflow-hidden shadow-xs">
                    
                    {/* Glowing XP Badge */}
                    <div className={`absolute top-4 right-4 border text-[9px] px-2.5 py-1 rounded-full font-black tracking-wider uppercase ${visitorStats.rankGlowClass}`}>
                      Rank {visitorStats.rank}
                    </div>

                    {/* Avatar Bubble */}
                    <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-850 flex items-center justify-center text-3xl border border-zinc-200 mt-2">
                      {selectedVisitor.avatarUrl || '🧑🏼'}
                    </div>

                    <h3 className="text-sm font-black text-zinc-900 dark:text-white mt-3 flex items-center gap-1">
                      {selectedVisitor.name}
                    </h3>
                    <span className="text-[10px] text-zinc-400 font-sans mt-0.5 uppercase tracking-wide">
                      {selectedVisitor.country}
                    </span>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center max-w-xs mt-3 leading-relaxed font-semibold italic">
                      "{visitorProfile.bio || 'This competitor is charging hard in the Vigor Gym arena to set maximum macro limits!'}"
                    </p>

                    {/* Quick Core Indicators */}
                    <div className="grid grid-cols-3 gap-2.5 w-full mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800/60 text-center">
                      <div>
                        <span className="text-[8px] font-bold text-zinc-400 uppercase block">Points</span>
                        <span className="text-xs font-black font-mono text-lime-600 dark:text-lime-400 mt-1 block">{selectedVisitor.score} XP</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-zinc-400 uppercase block">Level</span>
                        <span className="text-xs font-black font-mono text-zinc-800 dark:text-zinc-200 mt-1 block">Level {visitorStats.level}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-zinc-400 uppercase block">Target</span>
                        <span className="text-[10px] font-black text-zinc-700 dark:text-zinc-300 capitalize truncate block mt-1">{targetBodyText}</span>
                      </div>
                    </div>

                  </div>

                  {/* Competitor Posts Grid */}
                  <div>
                    <h4 className="text-[10px] uppercase font-black text-zinc-400 tracking-wider mb-2.5 px-1.5 flex items-center justify-between">
                      <span>Timeline Visual Progress</span>
                      <span className="text-zinc-500 font-bold">({selectedVisitor.posts?.length || 0} Posts)</span>
                    </h4>

                    {!selectedVisitor.posts || selectedVisitor.posts.length === 0 ? (
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-8 rounded-3xl text-center text-zinc-400">
                        <span className="text-2xl block mb-1">📷</span>
                        <h5 className="text-[11px] font-black uppercase text-zinc-700 dark:text-zinc-300">No photos published yet</h5>
                        <p className="text-[9px] text-zinc-400 max-w-[200px] mx-auto mt-0.5 leading-normal">
                          When this competitor uploads daily checked progress images, they will appear right here.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-1.5 rounded-2xl shadow-xs">
                        {selectedVisitor.posts.map((post) => {
                          const cheerCount = post.cheers ? Object.keys(post.cheers).length : 0;
                          return (
                            <div
                              key={post.id}
                              onClick={() => setSelectedVisitorPost(post)}
                              className="aspect-square bg-zinc-950 overflow-hidden relative rounded-xl border border-zinc-100 dark:border-zinc-800/40 cursor-pointer group"
                            >
                              <img
                                src={post.imageUrl}
                                alt={post.title}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              {/* Cheer indicator count badge - ALWAYS visible bottom right layout */}
                              <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded-md flex items-center gap-0.5 text-white text-[9px] font-black font-mono">
                                <Heart className="w-2.5 h-2.5 fill-lime-400 text-lime-400" />
                                <span>{cheerCount}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              );
            })()}
          </motion.div>
        </div>
      )}

      {/* 3. Overlaid clicked competitor's post detail sheet (Liking / "Cheer Up") */}
      {selectedVisitorPost && selectedVisitor && (
        <div 
          className="fixed inset-0 bg-black/90 z-[3000] flex flex-col justify-between p-4"
          onClick={() => setSelectedVisitorPost(null)}
        >
          <div className="flex justify-between items-center w-full z-10 p-2" onClick={(e) => e.stopPropagation()}>
            <span className="text-[10px] uppercase font-black text-lime-400 tracking-widest bg-lime-950/45 px-2.5 py-1 rounded border border-lime-800/45">
              COMPETITOR GYM CHECKIN
            </span>
            <button 
              onClick={() => setSelectedVisitorPost(null)}
              className="text-white bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer leading-none text-xs"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-2" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedVisitorPost.imageUrl}
              alt={selectedVisitorPost.title}
              className="max-h-[60vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
              referrerPolicy="no-referrer"
            />
          </div>

          <div 
            className="bg-zinc-900/95 backdrop-blur-md text-white p-5 rounded-3xl border border-white/10 max-w-md mx-auto w-full z-10 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] uppercase font-black text-zinc-400 tracking-wider font-mono">
                BY {selectedVisitor.name} • {selectedVisitorPost.date}
              </span>
            </div>
            
            <h3 className="text-sm font-black uppercase text-lime-400 leading-tight tracking-tight mt-1">
              {selectedVisitorPost.title}
            </h3>
            
            {selectedVisitorPost.description ? (
              <p className="text-xs text-zinc-350 leading-relaxed mt-2.5 bg-black/30 p-3 rounded-xl border border-white/5 font-medium">
                {selectedVisitorPost.description}
              </p>
            ) : (
              <p className="text-xs italic text-zinc-550 mt-1 font-medium font-sans">
                No session details added.
              </p>
            )}

            <div className="flex justify-between items-center mt-4 pt-3.5 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <Heart className="w-5 h-5 fill-lime-400 text-lime-400 animate-pulse" />
                <span className="text-xs font-extrabold font-mono text-zinc-200">
                  {selectedVisitorPost.cheers ? Object.keys(selectedVisitorPost.cheers).length : 0} Cheer Ups
                </span>
              </div>
              
              {(() => {
                const myUid = auth.currentUser?.uid;
                const hasCheered = myUid && selectedVisitorPost.cheers?.hasOwnProperty(myUid);
                return (
                  <button
                    onClick={() => {
                      if (!myUid || !selectedVisitor.uid) return;
                      const postRef = ref(database, `users/${selectedVisitor.uid}/posts/${selectedVisitorPost.id}/cheers/${myUid}`);
                      set(postRef, hasCheered ? null : true);

                      // Optimistically update the submodal selectedVisitorPost state
                      const updatedCheers = { ...(selectedVisitorPost.cheers || {}) };
                      if (hasCheered) {
                        delete updatedCheers[myUid];
                      } else {
                        updatedCheers[myUid] = true;
                      }
                      const updatedPost = { ...selectedVisitorPost, cheers: updatedCheers };
                      setSelectedVisitorPost(updatedPost);

                      // Update selectedVisitor underlying posts as well so the grid matches!
                      if (selectedVisitor.posts) {
                        const updatedPosts = selectedVisitor.posts.map(p => p.id === selectedVisitorPost.id ? updatedPost : p);
                        setSelectedVisitor({
                          ...selectedVisitor,
                          posts: updatedPosts
                        });
                      }
                    }}
                    className={`font-black text-[11px] uppercase tracking-wide py-1.5 px-4 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 border-transparent ${
                      hasCheered 
                        ? 'bg-zinc-800 text-lime-400 border border-lime-500/20' 
                        : 'bg-lime-500 hover:bg-lime-600 text-zinc-950'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${hasCheered ? 'fill-current' : 'fill-current'}`} />
                    {hasCheered ? 'Cheered!' : 'Cheer Up'}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
