/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface AndroidFrameProps {
  children: React.ReactNode;
  theme: 'light' | 'dark';
}

export default function AndroidFrame({ children, theme }: AndroidFrameProps) {
  return (
    // Outer responsive viewport centering the core app container
    <div className={`w-full min-h-screen flex justify-center transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-[#09090b] text-zinc-100' 
        : 'bg-zinc-100 text-zinc-900'
    }`}>
      
      {/* 
        Centered vertical workspace column representing our vertical phone port layout.
        - max-w-[440px] is the beautiful sweet spot for vertical layouts on desktop viewports.
        - w-full ensures it becomes full-screen fluidly on standard smartphones.
        - border-x adds premium division borders on wide screens.
      */}
      <div className={`w-full max-w-[440px] min-h-screen flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.06)] dark:shadow-[0_0_60px_rgba(0,0,0,0.4)] border-x border-zinc-200/50 dark:border-zinc-800/80 bg-white dark:bg-[#09090b] relative`}>
        {children}
      </div>

    </div>
  );
}
