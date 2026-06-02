/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { auth, database } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { ref, set, get, child } from 'firebase/database';
import { Lock, Mail, User, Sparkles, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthScreenProps {
  onAuthSuccess: (uid: string, loadedData: any | null) => void;
  theme: 'light' | 'dark';
}

export default function AuthScreen({ onAuthSuccess, theme }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrim = email.trim();
    const nameTrim = name.trim();

    if (!emailTrim || !password) {
      setError('Please fill in all standard secure fields.');
      return;
    }

    if (!validateEmail(emailTrim)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (isSignUp && !nameTrim) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Create user with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, emailTrim, password);
        const user = userCredential.user;

        // Set Display Name in Firebase Auth
        await updateProfile(user, { displayName: nameTrim });

        // Build default values for the fresh user with "user" role
        const initialUserData = {
          role: 'user',
          profile: null, // Left null so user can onboard custom metrics
          dailyLogs: {},
          streakCount: 1,
          totalPoints: 50,
          updatedAt: new Date().toISOString(),
        };

        // Save to Firebase Realtime Database
        await set(ref(database, `users/${user.uid}`), initialUserData);

        // Success trigger
        onAuthSuccess(user.uid, initialUserData);
      } else {
        // Sign In
        const userCredential = await signInWithEmailAndPassword(auth, emailTrim, password);
        const user = userCredential.user;

        // Fetch existing user data
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `users/${user.uid}`));
        
        let loadedData = null;
        if (snapshot.exists()) {
          loadedData = snapshot.val();
        } else {
          // Fallback if record is missing in db for some reason
          loadedData = {
            role: 'user',
            profile: {
              name: user.displayName || 'Champion',
              email: user.email || '',
              height: 170,
              weight: 68,
              age: 24,
              illness: 'none',
              targetBody: 'tone_shape',
              country: 'IN',
              dietPreference: 'veg',
              gender: 'male',
              exerciseLevel: 'intermediate',
            },
            dailyLogs: {},
            streakCount: 1,
            totalPoints: 50,
            updatedAt: new Date().toISOString(),
          };
          await set(ref(database, `users/${user.uid}`), loadedData);
        }

        onAuthSuccess(user.uid, loadedData);
      }
    } catch (err: any) {
      console.error('Authentication Error:', err);
      let friendlyMessage = 'Failed to connect. Please check internet conditions.';
      if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = 'This email address is already in use.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        friendlyMessage = 'Incorrect password or email credentials.';
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = 'The selected password is too weak.';
      } else if (err.message) {
        friendlyMessage = err.message;
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-8 bg-[#f8fafc] dark:bg-[#09090b] font-sans h-full overflow-y-auto">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
        
        {/* Hero Branding Section */}
        <div className="text-center flex flex-col items-center gap-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-14 h-14 rounded-2xl bg-lime-500 dark:bg-lime-400 flex items-center justify-center text-zinc-950 shadow-lg shadow-lime-500/20"
          >
            <Sparkles className="w-7 h-7" />
          </motion.div>
          
          <div className="mt-2.5">
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase font-sans">
              V vigor Body
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {isSignUp ? 'Create a secure cloud account to sync data' : 'Log back in to load your custom fitness logs'}
            </p>
          </div>
        </div>

        {/* Error Notification Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 bg-rose-50/80 dark:bg-red-950/20 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-rose-700 dark:text-rose-400 font-semibold leading-tight">
              {error}
            </span>
          </motion.div>
        )}

        {/* Main Auth Form Box */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Form Name - Signup only */}
          {isSignUp && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748b] dark:text-zinc-500" htmlFor="auth-name">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-405 dark:text-zinc-500" />
                <input
                  id="auth-name"
                  type="text"
                  placeholder="Enter your name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 text-xs font-semibold rounded-xl text-zinc-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500/50 transition duration-150"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          {/* Form Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748b] dark:text-zinc-500" htmlFor="auth-email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-405 dark:text-zinc-500" />
              <input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 text-xs font-semibold rounded-xl text-zinc-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500/50 transition duration-150"
                required
              />
            </div>
          </div>

          {/* Form Password (obscured/hidden fields indicator) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-widest text-[#64748b] dark:text-zinc-500">
              <label htmlFor="auth-password">Password</label>
              <span>Min. 6 chars</span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-405 dark:text-zinc-500" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 text-xs font-semibold rounded-xl text-zinc-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500/50 transition duration-150"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-450 hover:text-zinc-700 dark:hover:text-zinc-300 bg-transparent border-none appearance-none"
                id="auth-toggle-password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-2 bg-lime-500 hover:bg-lime-600 dark:bg-lime-400 dark:hover:bg-lime-500 text-zinc-950 rounded-xl text-xs font-extrabold transition-all duration-150 flex items-center justify-center gap-1 shadow-md cursor-pointer ${
              loading ? 'opacity-80 cursor-wait' : 'active:scale-98'
            }`}
            id="auth-submit-btn"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            ) : isSignUp ? (
              'Create Vigor Account'
            ) : (
              'Sign In securely'
            )}
          </button>

        </form>

        {/* View Switch Button Link */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-zinc-400">
            {isSignUp ? "Already have an account?" : "Don't have an offline plan backup yet?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-xs font-extrabold text-lime-605 dark:text-lime-400 hover:underline bg-transparent border-none py-0.5"
              id="auth-switch-mode-btn"
            >
              {isSignUp ? 'Sign In' : 'Create Free Account'}
            </button>
          </p>
        </div>

        {/* Informative visual guide banner */}
        <p className="text-[9px] text-zinc-400 dark:text-zinc-650 font-mono text-center leading-normal">
          🔒 Secured by Google Firebase Auth & Realtime Database.<br/>
          Your diet, exercises, and streaks are backed up dynamically in real time.
        </p>

      </div>
    </div>
  );
}
