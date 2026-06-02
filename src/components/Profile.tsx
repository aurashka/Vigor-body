/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, ProfilePost } from '../types';
import { database, auth } from '../firebase';
import { ref, onValue, set, push } from 'firebase/database';
import { Camera, Calendar, Award, Sparkles, Plus, Image as ImageIcon, Check, Edit2, Loader2, Heart, Award as TrophyIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileProps {
  userProfile: UserProfile;
  totalPoints: number;
  onChangeProfile: (profile: UserProfile) => void;
}

const IMGBB_API_KEY = '5fd2a4346ac2e5485a916a5d734d508b';

export default function Profile({ userProfile, totalPoints, onChangeProfile }: ProfileProps) {
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  
  // Local profile edits state
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(userProfile.bio || 'Ready to shatter limits and hit target macros!');
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [currentWeight, setCurrentWeight] = useState<number>(userProfile.weight);

  // New Post state
  const [postTitle, setPostTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [postingError, setPostingError] = useState<string | null>(null);
  const [postingSuccess, setPostingSuccess] = useState(false);

  // Profile Picture state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Monthly top participation stats
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(''); // format: "June 2026"

  const uid = auth.currentUser?.uid;

  // Sync profile details if changed externally
  useEffect(() => {
    setBioText(userProfile.bio || 'Ready to shatter limits and hit target macros!');
    setCurrentWeight(userProfile.weight);
  }, [userProfile]);

  // Load user posts from real-time database
  useEffect(() => {
    if (!uid) return;
    const postsRef = ref(database, `users/${uid}/posts`);
    const unsubscribe = onValue(postsRef, (snapshot) => {
      setLoadingPosts(true);
      try {
        if (snapshot.exists()) {
          const rawData = snapshot.val();
          const parsed: ProfilePost[] = Object.keys(rawData).map((key) => ({
            id: key,
            ...rawData[key],
          }));
          // Sort newest to oldest
          parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setPosts(parsed);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoadingPosts(false);
      }
    });

    return () => unsubscribe();
  }, [uid]);

  // Calculate Level and Rank based on totalPoints (XP)
  const stats = useMemo(() => {
    const xp = totalPoints;
    let level = 1;
    let rank = 'D';
    let nextTierXp = 300;
    let rankGlowClass = 'text-zinc-400 dark:text-zinc-500 bg-zinc-150 dark:bg-zinc-800';

    if (xp < 300) {
      level = 1;
      rank = 'D';
      nextTierXp = 300;
      rankGlowClass = 'text-zinc-500 bg-zinc-100 dark:bg-zinc-900 border-zinc-200';
    } else if (xp < 600) {
      level = 2;
      rank = 'C';
      nextTierXp = 600;
      rankGlowClass = 'text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50';
    } else if (xp < 1000) {
      level = 3;
      rank = 'B';
      nextTierXp = 1000;
      rankGlowClass = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50';
    } else if (xp < 1800) {
      level = 4;
      rank = 'A';
      nextTierXp = 1800;
      rankGlowClass = 'text-pink-500 bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-900/50';
    } else if (xp < 2800) {
      level = 5;
      rank = 'S';
      nextTierXp = 2800;
      rankGlowClass = 'text-amber-500 bg-amber-50 dark:bg-amber-950/35 border-amber-300 dark:border-amber-700/50 font-black animate-pulse shadow-xs';
    } else if (xp < 4000) {
      level = 6;
      rank = 'SS';
      nextTierXp = 4000;
      rankGlowClass = 'text-lime-600 bg-lime-50 dark:bg-lime-950/35 border-lime-300 dark:border-lime-700/50 font-black animate-pulse shadow-sm';
    } else {
      level = 7 + Math.floor((xp - 4000) / 1500);
      rank = 'SSS';
      nextTierXp = xp + 1500;
      rankGlowClass = 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-600/60 font-black animate-bounce shadow-md';
    }

    const progressPercentage = Math.min(100, Math.round((xp / nextTierXp) * 100));

    return { level, rank, progressPercentage, nextTierXp, rankGlowClass };
  }, [totalPoints]);

  // Handle Monthly participation list (Unique Month-Years from posts list plus current month)
  const monthYears = useMemo(() => {
    const list: string[] = [];
    
    // Always include current month
    const now = new Date();
    const currentMY = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    list.push(currentMY);

    posts.forEach((post) => {
      const pDate = new Date(post.createdAt || post.date);
      if (!isNaN(pDate.getTime())) {
        const my = pDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        if (!list.includes(my)) {
          list.push(my);
        }
      }
    });

    return list;
  }, [posts]);

  // Default select current Month Year
  useEffect(() => {
    if (monthYears.length > 0 && !selectedMonthYear) {
      setSelectedMonthYear(monthYears[0]);
    }
  }, [monthYears, selectedMonthYear]);

  // Compute posts filtered by selected Month-Year
  const filteredPosts = useMemo(() => {
    if (!selectedMonthYear) return posts;
    return posts.filter((post) => {
      const pDate = new Date(post.createdAt || post.date);
      if (isNaN(pDate.getTime())) return false;
      const my = pDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      return my === selectedMonthYear;
    });
  }, [posts, selectedMonthYear]);

  // Check if user has already posted today
  const hasPostedToday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return posts.some((post) => post.date === todayStr);
  }, [posts]);

  // Upload Avatar handler using IMGBB
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uid) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('ImgBB Upload failed');

      const data = await response.json();
      if (data?.data?.url) {
        const newAvatarUrl = data.data.url;
        const updatedProfile = { ...userProfile, avatarUrl: newAvatarUrl };
        onChangeProfile(updatedProfile);
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      alert('Failed to upload profile picture. Please try again!');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Image post preview handler
  const handlePostImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image and create post on Firebase RTDB
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostingError(null);
    setPostingSuccess(false);

    if (!uid) return;
    if (hasPostedToday) {
      setPostingError('Daily limit reached! You can only post one image per day to stay consistent.');
      return;
    }
    if (!postTitle.trim()) {
      setPostingError('Please add a motivating fitness caption/title first!');
      return;
    }
    if (!selectedFile) {
      setPostingError('Please choose or snap a gym photo to upload!');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Post image upload failed on ImgBB');

      const imgRes = await response.json();
      const imageUrl = imgRes?.data?.url;

      if (!imageUrl) throw new Error('No image URL returned from ImgBB');

      const todayStr = new Date().toISOString().split('T')[0];
      const newPost: Omit<ProfilePost, 'id'> = {
        title: postTitle.trim(),
        imageUrl,
        date: todayStr,
        createdAt: new Date().toISOString(),
      };

      const postsRef = ref(database, `users/${uid}/posts`);
      await push(postsRef, newPost);

      // Clean form state
      setPostTitle('');
      setSelectedFile(null);
      setImagePreview(null);
      setPostingSuccess(true);
      setTimeout(() => setPostingSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error creating post:', err);
      setPostingError(err?.message || 'Failed to publish post. Try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save editable states
  const handleSaveBio = () => {
    if (!uid) return;
    const updated = { ...userProfile, bio: bioText };
    onChangeProfile(updated);
    setIsEditingBio(false);
  };

  const handleSaveWeight = () => {
    if (!uid) return;
    const updated = { ...userProfile, weight: Math.max(25, Math.min(250, currentWeight)) };
    onChangeProfile(updated);
    setIsEditingWeight(false);
  };

  return (
    <div className="flex-1 flex flex-col gap-5 p-4 pb-12 font-sans bg-zinc-50 dark:bg-zinc-950">
      
      {/* 1. Header Profile Identity Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-5 shadow-xs flex flex-col items-center relative overflow-hidden">
        
        {/* Absolute Glowing Rank Badge */}
        <div className={`absolute top-4 right-4 border text-[11px] px-2.5 py-1 rounded-full font-black tracking-wider shadow-xs flex items-center gap-1 uppercase ${stats.rankGlowClass}`}>
          <TrophyIcon className="w-3.5 h-3.5" />
          Rank {stats.rank}
        </div>

        {/* Profile Avatar with ImgBB Uploader */}
        <div className="relative mt-2">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-lime-500/20 dark:border-lime-400/35 bg-zinc-100 dark:bg-zinc-855 flex items-center justify-center relative">
            {userProfile.avatarUrl ? (
              <img 
                src={userProfile.avatarUrl} 
                alt={userProfile.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-3xl text-zinc-400 font-bold capitalize">
                {userProfile.name.charAt(0)}
              </span>
            )}

            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-lime-400 animate-spin" />
              </div>
            )}
          </div>

          {/* Quick upload camera overlay trigger */}
          <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-lime-500 hover:bg-lime-600 border border-white text-zinc-950 flex items-center justify-center cursor-pointer shadow-md transition duration-150">
            <Camera className="w-4 h-4" />
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarFileChange}
              disabled={uploadingAvatar}
            />
          </label>
        </div>

        {/* User identification meta */}
        <div className="text-center mt-3 w-full">
          <h2 className="text-base font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
            {userProfile.name}
          </h2>
          
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">
              LEVEL {stats.level} • {totalPoints} XP
            </span>
          </div>

          {/* Inline Bio Section with Edit Controls */}
          <div className="mt-3.5 px-4">
            {isEditingBio ? (
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-855 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs font-semibold focus:outline-none"
                  maxLength={100}
                />
                <button 
                  onClick={handleSaveBio}
                  className="p-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="group flex justify-center items-center gap-1.5 cursor-pointer" onClick={() => setIsEditingBio(true)}>
                <p className="text-[11px] text-zinc-500 italic font-medium leading-relaxed max-w-[280px]">
                  "{bioText}"
                </p>
                <Edit2 className="w-3 h-3 text-zinc-400 group-hover:text-lime-500 transition" />
              </div>
            )}
          </div>
        </div>

        {/* Dynamic XP target visual bar */}
        <div className="w-full mt-4 bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-500"
            style={{ width: `${stats.progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between w-full mt-1.5 text-[9px] font-bold text-zinc-400 tracking-wider font-mono">
          <span>PROGRESS</span>
          <span>{stats.progressPercentage}% TO LVL {stats.level + 1}</span>
        </div>

      </div>

      {/* 2. Primary Metrics Row Display */}
      <div className="grid grid-cols-4 gap-2.5">
        
        {/* Metric Height */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-3 rounded-2xl flex flex-col justify-center items-center">
          <span className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase">Height</span>
          <span className="text-sm font-black font-mono text-zinc-800 dark:text-zinc-200 mt-1">{userProfile.height} <span className="text-[9px] font-bold text-zinc-400">cm</span></span>
        </div>

        {/* Metric Weight (with quick editing) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-3 rounded-2xl flex flex-col justify-center items-center relative group">
          <span className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase flex items-center gap-1">
            Weight
          </span>
          {isEditingWeight ? (
            <div className="flex items-center gap-1 mt-1">
              <input
                type="number"
                step="0.1"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(parseFloat(e.target.value) || 0)}
                className="w-12 text-center bg-zinc-50 dark:bg-zinc-800 border rounded font-mono text-xs p-0.5 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
              <button 
                onClick={handleSaveWeight}
                className="bg-emerald-600 p-0.5 text-white rounded"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 cursor-pointer mt-1" onClick={() => setIsEditingWeight(true)}>
              <span className="text-sm font-black font-mono text-zinc-800 dark:text-zinc-200">{userProfile.weight} <span className="text-[9px] font-bold text-zinc-400">kg</span></span>
              <Edit2 className="w-2.5 h-2.5 text-zinc-400 group-hover:text-lime-500 transition" />
            </div>
          )}
        </div>

        {/* Metric Age */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-3 rounded-2xl flex flex-col justify-center items-center">
          <span className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase">Age</span>
          <span className="text-sm font-black font-mono text-zinc-800 dark:text-zinc-200 mt-1">{userProfile.age} <span className="text-[9px] font-bold text-zinc-400">yrs</span></span>
        </div>

        {/* Goal Indicator */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-3 rounded-2xl flex flex-col justify-center items-center">
          <span className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase">Target</span>
          <span className="text-[10px] font-extrabold text-zinc-700 dark:text-zinc-300 capitalize text-center mt-1 truncate max-w-full">
            {userProfile.targetBody.replace('_', ' ')}
          </span>
        </div>

      </div>

      {/* 3. Daily Gym Image Progress Posting Portal */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-4 shadow-xs">
        <h3 className="text-xs font-black uppercase text-zinc-400 tracking-widest flex items-center gap-1.5 mb-3">
          <Sparkles className="w-4 h-4 text-lime-500 animate-pulse" />
          Publish Daily Gym Post
        </h3>

        {hasPostedToday ? (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl text-center">
            <Check className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
            <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-400 block uppercase tracking-wider">
              Today's Workout Image Published
            </span>
            <p className="text-[10px] text-zinc-400 leading-normal max-w-[280px] mx-auto mt-0.5">
              Awesome work logging your progress! High fidelity post live below. Return tomorrow to snap & share the next milestone checkin.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreatePost} className="flex flex-col gap-3.5">
            {/* Post caption text fields */}
            <div className="flex flex-col gap-1">
              <label htmlFor="postTitleInput" className="text-[10px] uppercase font-bold text-zinc-400">Gym Session Caption / Title</label>
              <input
                id="postTitleInput"
                type="text"
                placeholder="e.g., Hit 50kg chest press or Fasted cardio 5km!"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-150 dark:border-zinc-800 focus:outline-none"
              />
            </div>

            {/* Photo Picker drop area */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Snap Gym Picture</span>
              
              <div className="flex gap-3 items-center">
                <label className="flex-1 flex flex-col justify-center items-center py-4 border border-dashed border-zinc-250 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-855 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition">
                  <ImageIcon className="w-5 h-5 text-zinc-400 mb-1" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                    {selectedFile ? selectedFile.name : 'Choose or Take Photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePostImageChange}
                  />
                </label>

                {imagePreview && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border bg-zinc-100">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Print Posting errors */}
            {postingError && (
              <span className="text-[10px] font-bold text-red-650 bg-red-50 dark:bg-red-950/20 px-3 py-1.5 rounded-lg border border-red-200">
                ⚠️ {postingError}
              </span>
            )}

            {postingSuccess && (
              <span className="text-[10px] font-bold text-emerald-750 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg border border-emerald-200">
                🎉 Dynamic progress post successfully published!
              </span>
            )}

            {/* Push Post button */}
            <button
              type="submit"
              disabled={uploadingImage || hasPostedToday}
              className="w-full bg-lime-500 hover:bg-lime-600 text-zinc-950 rounded-2xl py-2.5 font-bold text-xs uppercase tracking-wider flex justify-center items-center gap-1.5 shadow-md cursor-pointer"
            >
              {uploadingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading details to ImgBB...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Publish Daily Gym Post (+100 XP)
                </>
              )}
            </button>
          </form>
        )}

      </div>

      {/* 4. Display Feed: Photos grid grouped / separated by Month & Year */}
      <div className="flex flex-col gap-3">
        
        {/* Dynamic Month/Year Target Filter Tabs */}
        <div className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 px-4 py-3 rounded-2xl">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">MONTHLY TOP PARTICIPATION</span>
            <span className="text-xs font-black uppercase text-zinc-800 dark:text-zinc-200 mt-0.5">
              {selectedMonthYear || 'History Feed'}
            </span>
          </div>

          {/* Month selector dropdown */}
          <select
            value={selectedMonthYear}
            onChange={(e) => setSelectedMonthYear(e.target.value)}
            className="text-[11px] font-black uppercase bg-zinc-50 dark:bg-zinc-850 py-1.5 px-3.5 rounded-xl border border-zinc-150 dark:border-zinc-800 focus:outline-none cursor-pointer"
          >
            {monthYears.map((my) => (
              <option key={my} value={my}>
                {my}
              </option>
            ))}
          </select>
        </div>

        {/* Photos grid list feed */}
        {loadingPosts ? (
          <div className="py-12 flex flex-col items-center justify-center text-zinc-400 gap-2">
            <Loader2 className="w-6 h-6 text-lime-500 dark:text-lime-400 animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Reading timeline...</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-8 text-center text-zinc-400">
            <ImageIcon className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <h4 className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">No pictures for this month</h4>
            <p className="text-[10px] text-zinc-400 leading-normal max-w-[240px] mx-auto mt-1">
              Select other months from the filter or post your daily gym photograph to build your visual calendar log!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs relative"
              >
                {/* Header display containing Title and Date */}
                <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800/80 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/60">
                  <h4 className="text-xs font-black text-zinc-900 dark:text-white leading-tight uppercase max-w-[70%] truncate">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-zinc-450 dark:text-zinc-550" />
                    <span>{post.date}</span>
                  </div>
                </div>

                {/* Published visual */}
                <div className="aspect-square bg-zinc-950 overflow-hidden flex items-center justify-center relative">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </div>

                {/* Footer details */}
                <div className="px-4 py-3 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-lime-700 dark:text-lime-400 font-mono tracking-widest uppercase">
                    PROVEN WORKOUT PROGRESS
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-black text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                    🔥 SUCCESS
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
