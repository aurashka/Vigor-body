/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Smartphone, Wifi, Battery, Signal, Maximize2, Minimize2, Settings } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  theme: 'light' | 'dark';
}

export default function AndroidFrame({ children, theme }: AndroidFrameProps) {
  const [currentTime, setCurrentTime] = useState('12:00 PM');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const borderClass = theme === 'dark' ? 'border-zinc-800 bg-zinc-950 text-zinc-100' : 'border-zinc-200 bg-zinc-50 text-zinc-900';

  if (isFullscreen) {
    return (
      <div className={`w-full min-h-screen relative transition-all duration-300 ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
        {/* Absolute header bar to simulate fullscreen android top on desktop preview */}
        <div className="flex justify-between items-center px-4 py-2 text-xs select-none bg-zinc-900 text-zinc-300 font-mono tracking-wider">
          <div className="flex items-center gap-1">
            <span>9:41</span>
            <span className="text-emerald-400 font-bold">• Diet & Gym Guider Web App</span>
          </div>
          <div className="flex items-center gap-2">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 text-emerald-400" />
            <button
              onClick={() => setIsFullscreen(false)}
              className="ml-3 hover:text-white px-2 py-0.5 rounded bg-zinc-800 transition text-[10px]"
              title="Return to Phone Frame View"
              id="exit-fullscreen-btn"
            >
              Exit Fullscreen
            </button>
          </div>
        </div>
        <div className="w-full max-w-lg mx-auto min-h-[calc(100vh-32px)] flex flex-col">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-2 transition-all duration-300 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-slate-100'}`}>
      
      {/* Upper Control Bar For Desktop Observers */}
      <div className="hidden sm:flex gap-4 mb-3 items-center justify-between w-full max-w-[400px] px-2 font-sans">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Target Screen</span>
          <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-primary" /> Android Mobile Port
          </span>
        </div>
        <button
          onClick={() => setIsFullscreen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 font-sans px-3 py-1.5 rounded-full transition shadow-md"
          title="See Full Window Fit"
          id="enter-fullscreen-btn"
        >
          <Maximize2 className="w-3 h-3" /> Full Fit
        </button>
      </div>

      {/* Actual Physical Smartphone Frame Mockup */}
      <div 
        id="android-phone-hardware"
        className={`relative w-[385px] h-[785px] border-[12px] ${theme === 'dark' ? 'border-zinc-950 bg-zinc-950' : 'border-zinc-800 bg-zinc-800'} rounded-[42px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col`}
      >
        {/* Dynamic Punchhole notch */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-black rounded-full z-50 flex items-center justify-between px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-950 border border-zinc-800"></div>
          <div className="w-12 h-1.5 rounded-full bg-zinc-800"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-900"></div>
        </div>

        {/* Smartphone Virtual Screen Container */}
        <div className={`flex-1 flex flex-col relative overflow-hidden select-none font-sans rounded-[30px] ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900'}`}>
          
          {/* Internal Android Status Bar */}
          <div className={`h-8 pt-2.5 px-6 flex justify-between items-center text-[11px] font-semibold tracking-wide select-none z-40 ${theme === 'dark' ? 'bg-zinc-950 text-zinc-300' : 'bg-white text-zinc-600'}`}>
            <span>{currentTime}</span>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-1">
                <span>92%</span>
                <Battery className={`w-4 h-4 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
            </div>
          </div>

          {/* Core Content Container inside screen */}
          <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative h-full">
            {children}
          </div>

          {/* Android Virtual Bottom Pills Navigation Segment */}
          <div className={`h-6 flex items-center justify-center pb-2 z-40 ${theme === 'dark' ? 'bg-zinc-950/80' : 'bg-white/85'}`}>
            <div className="w-28 h-1.5 rounded-full bg-zinc-400/50 hover:bg-zinc-500 transition cursor-pointer"></div>
          </div>

        </div>
      </div>

      {/* Tiny foot guidance note */}
      <span className="text-[10px] text-zinc-400 mt-2.5 select-none font-mono text-center">
        Interactive Mobile Simulation • Full Touch & Drag Support
      </span>
      
    </div>
  );
}
