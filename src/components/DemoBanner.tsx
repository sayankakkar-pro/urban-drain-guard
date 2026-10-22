import React, { useState } from 'react';
import { AlertCircle, HelpCircle, Activity, Sparkles, ChevronDown, ChevronUp, Radio } from 'lucide-react';
import { useDrainSystem } from '../context/DrainContext';

interface DemoBannerProps {
  onOpenPitchGuide: () => void;
  onOpenThresholds: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onOpenPitchGuide, onOpenThresholds }) => {
  const { simulationPreset, applyScenario } = useDrainSystem();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-indigo-500/10 border-b border-amber-300/60 dark:border-amber-500/30 text-xs text-slate-700 dark:text-slate-300 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Main Indicator Pill */}
          <div className="flex items-center space-x-2.5">
            <span className="flex items-center px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 font-bold tracking-wide uppercase text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
              Competition Demo Mode
            </span>
            <span className="text-slate-700 dark:text-slate-300 font-medium hidden sm:inline">
              Simulated Telemetry Active — Synthetic hydrodynamic sensors (No live municipal hardware connected).
            </span>
          </div>

          {/* Quick Scenario & Controls */}
          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-center space-x-1.5 bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] mr-1">Pitch Scenario:</span>
              <button
                onClick={() => applyScenario('normal')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  simulationPreset === 'normal' 
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 font-semibold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                1. Clear
              </button>
              <button
                onClick={() => applyScenario('flash_storm')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  simulationPreset === 'flash_storm' 
                    ? 'bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-500/40 font-semibold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                2. Storm Surge
              </button>
              <button
                onClick={() => applyScenario('debris_surge')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  simulationPreset === 'debris_surge' 
                    ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 font-semibold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                3. Market Clog
              </button>
              <button
                onClick={() => applyScenario('severe_gridlock')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  simulationPreset === 'severe_gridlock' 
                    ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 font-semibold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                4. Critical Gridlock
              </button>
            </div>

            <button
              onClick={onOpenPitchGuide}
              className="flex items-center space-x-1 px-2.5 py-1 bg-brand-50 dark:bg-brand-500/20 hover:bg-brand-100 dark:hover:bg-brand-500/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/40 rounded-lg font-semibold transition-all shadow-xs"
              title="Open 5-Minute Pitch Script & Cues"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>5-Min Pitch Guide</span>
            </button>

            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 p-1 rounded"
              aria-label="Toggle details"
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expandable Explanation Details */}
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] text-slate-600 dark:text-slate-400">
            <div className="flex items-start space-x-2">
              <Activity className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-slate-200 font-semibold">Kinematic Sensor Simulation:</strong> Ultrasonic depth, Doppler water velocity, and virtual rain gauges calculate discharge efficiency continuously.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-slate-200 font-semibold">Suspected vs Confirmed Logic:</strong> Differentiates normal storm high-water from trash/sediment blockage by cross-referencing rainfall decline with discharge rate deficits.
              </div>
            </div>
            <div className="flex items-start space-x-2 justify-between">
              <div className="flex items-start space-x-2">
                <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200 font-semibold">Interactive Toggles:</strong> Click any drain card to simulate trash accumulation or dispatch emergency jetting units in real time.
                </div>
              </div>
              <button 
                onClick={onOpenThresholds} 
                className="text-brand-600 dark:text-brand-400 hover:underline shrink-0 ml-2 font-medium"
              >
                Config Rules →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
