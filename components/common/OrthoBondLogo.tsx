'use client';

import React from 'react';

interface OrthoBondMarkProps {
  size?: number;
  className?: string;
  variant?: 'badge' | 'glyph';
  theme?: 'navy' | 'blue' | 'light' | 'monochrome';
}

/**
 * OrthoBondMark — Custom Orthodontic Technology Brand Mark
 * 
 * Concept: Orthodontic Bracket + Tooth/Arch Silhouette + Precision AI Connection
 * - Outer geometry: Stylized anatomical dental crown & arch contour
 * - Center geometry: Orthodontic bracket with dual tie-wings and central archwire slot
 * - Precision detail: Guided archwire path with central calibration/alignment node
 * 
 * Clinical, minimal, recognizable at 24px-48px.
 */
export function OrthoBondMark({
  size = 36,
  className = '',
  variant = 'badge',
  theme = 'navy',
}: OrthoBondMarkProps) {
  // Glyph colors based on theme
  let bgColor = 'bg-slate-900';
  let toothStroke = '#93C5FD'; // blue-300
  let bracketFill = '#FFFFFF';
  let wireColor = '#60A5FA';   // blue-400
  let nodeColor = '#38BDF8';   // sky-400

  if (theme === 'blue') {
    bgColor = 'bg-blue-600';
    toothStroke = '#BFDBFE'; // blue-200
    bracketFill = '#FFFFFF';
    wireColor = '#93C5FD';   // blue-300
    nodeColor = '#FFFFFF';
  } else if (theme === 'light') {
    bgColor = 'bg-white border border-slate-200';
    toothStroke = '#1E293B'; // slate-800
    bracketFill = '#2563EB'; // blue-600
    wireColor = '#3B82F6';   // blue-500
    nodeColor = '#0F172A';   // slate-900
  } else if (theme === 'monochrome') {
    bgColor = 'bg-slate-900';
    toothStroke = '#E2E8F0';
    bracketFill = '#FFFFFF';
    wireColor = '#94A3B8';
    nodeColor = '#FFFFFF';
  }

  const svgContent = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="OrthoBond AI Brand Mark"
      className="shrink-0"
    >
      {/* 1. Geometric Tooth / Dental Arch Silhouette */}
      <path
        d="M 12 11.5 C 14.8 13.2 17.5 13.8 20 13.8 C 22.5 13.8 25.2 13.2 28 11.5 C 31.8 11.8 33.5 15.5 33 20.8 C 32.4 26.8 28.5 32.2 20 34.5 C 11.5 32.2 7.6 26.8 7 20.8 C 6.5 15.5 8.2 11.8 12 11.5 Z"
        stroke={toothStroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />

      {/* 2. Precision Archwire (Horizontal Guideline spanning across the arch) */}
      <path
        d="M 5 21.5 C 10 20.8 15 20.5 20 20.5 C 25 20.5 30 20.8 35 21.5"
        stroke={wireColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* 3. Orthodontic Bracket with Precision Tie-Wings */}
      {/* Upper-Left Wing */}
      <rect x="14.5" y="15.5" width="4" height="3.5" rx="0.8" fill={bracketFill} />
      {/* Upper-Right Wing */}
      <rect x="21.5" y="15.5" width="4" height="3.5" rx="0.8" fill={bracketFill} />
      {/* Lower-Left Wing */}
      <rect x="14.5" y="24" width="4" height="3.5" rx="0.8" fill={bracketFill} />
      {/* Lower-Right Wing */}
      <rect x="21.5" y="24" width="4" height="3.5" rx="0.8" fill={bracketFill} />

      {/* Bracket Central Base Pad */}
      <rect
        x="15.5"
        y="18.5"
        width="9"
        height="6"
        rx="0.8"
        fill={bracketFill}
        opacity="0.95"
      />

      {/* Archwire Slot (horizontal cutout in bracket) */}
      <rect x="14.5" y="20.5" width="11" height="2" fill={bgColor.includes('blue') ? '#1D4ED8' : '#0F172A'} />

      {/* 4. AI Precision Alignment Node (Center calibration anchor) */}
      <circle cx="20" cy="21.5" r="1.4" fill={nodeColor} />
      <circle cx="20" cy="21.5" r="3" stroke={nodeColor} strokeWidth="0.8" opacity="0.6" />
    </svg>
  );

  if (variant === 'glyph') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{svgContent}</div>;
  }

  // Default: Clinical rounded badge container
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-xl flex items-center justify-center shadow-xs shrink-0 ${bgColor} ${className}`}
    >
      <div style={{ transform: 'scale(0.85)', transformOrigin: 'center' }}>
        {svgContent}
      </div>
    </div>
  );
}

interface OrthoBondLogoProps {
  size?: number;
  showSubtitle?: boolean;
  theme?: 'navy' | 'blue' | 'light';
  subtitleText?: string;
  className?: string;
}

/**
 * OrthoBondLogo — Complete Brand Header with Mark and Clinical Wordmark
 */
export function OrthoBondLogo({
  size = 38,
  showSubtitle = true,
  theme = 'navy',
  subtitleText = 'Orthodontic Visual Review & Patient Monitoring Platform',
  className = '',
}: OrthoBondLogoProps) {
  return (
    <div className={`flex items-center gap-3 shrink-0 ${className}`}>
      <OrthoBondMark size={size} theme={theme} />
      <div>
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-none">
            OrthoBond <span className="text-blue-600">AI</span>
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[10px] text-slate-500 hidden md:block font-medium mt-1 leading-tight">
            {subtitleText}
          </p>
        )}
      </div>
    </div>
  );
}
