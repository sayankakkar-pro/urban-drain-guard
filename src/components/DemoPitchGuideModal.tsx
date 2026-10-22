import React from 'react';
import { X, Sparkles, Play, CheckCircle2, Clock, ArrowRight, ShieldAlert, Wrench, Droplets } from 'lucide-react';
import { useDrainSystem } from '../context/DrainContext';

interface DemoPitchGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoPitchGuideModal: React.FC<DemoPitchGuideModalProps> = ({ isOpen, onClose }) => {
  const { applyScenario, setActiveTab, setSelectedDrainId, toggleDrainBlockage } = useDrainSystem();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="glass-panel-glow w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col border border-brand-200 dark:border-brand-500/40 shadow-2xl text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">5-Minute Innovation Pitch Remote & Script</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Step-by-step cue sheet for competition presentation & screen recording</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Script Content */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs text-slate-700 dark:text-slate-300">
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand-700 dark:text-brand-400 flex items-center space-x-1.5 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>0:00 - 1:00 • The Problem: Silent Urban Chokepoints</span>
              </span>
              <button
                onClick={() => {
                  applyScenario('normal');
                  setActiveTab('dashboard');
                }}
                className="px-2.5 py-1 bg-brand-100 hover:bg-brand-200 dark:bg-brand-600/30 dark:hover:bg-brand-600/50 text-brand-800 dark:text-brand-300 border border-brand-300 dark:border-brand-500/40 rounded-lg text-[11px] font-bold flex items-center space-x-1"
              >
                <Play className="w-3 h-3" />
                <span>Cue Base Demo</span>
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Script cue:</strong> <em>"Every monsoon season, modern cities suffer devastating street inundation not because our main stormwater tunnels lack capacity, but because 80% of blockages happen invisibly at localized intake grates and trash racks. Traditional municipal teams only find out when citizens call 911 about submerged cars. DrainWatch IoT flips this from reactive damage to proactive early prevention."</em>
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-700 dark:text-sky-400 flex items-center space-x-1.5 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>1:00 - 2:15 • Real-Time Hydrodynamic Telemetry</span>
              </span>
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                }}
                className="px-2.5 py-1 bg-sky-100 hover:bg-sky-200 dark:bg-sky-600/30 dark:hover:bg-sky-600/50 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-500/40 rounded-lg text-[11px] font-bold flex items-center space-x-1"
              >
                <Play className="w-3 h-3" />
                <span>Show Schematic View</span>
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Script cue:</strong> <em>"Here on our operational command center, we monitor 12 strategic culverts and curb inlets across four municipal catchment basins. Switch between our high-density GIS map and our topological pipe network schematic to see gravity-driven stormwater routing in real time."</em>
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/30 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center space-x-1.5 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>2:15 - 3:30 • The Core AI/IoT Innovation: Suspected vs Confirmed</span>
              </span>
              <button
                onClick={() => {
                  applyScenario('debris_surge');
                  setSelectedDrainId('DRN-101-MK');
                }}
                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 dark:bg-amber-600/40 dark:hover:bg-amber-600/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-500/50 rounded-lg text-[11px] font-bold flex items-center space-x-1"
              >
                <Play className="w-3 h-3" />
                <span>Trigger Market Square Clog</span>
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Script cue:</strong> <em>"Notice what just happened at Market Square North Curb (DRN-101-MK). Anyone can sound an alarm when water is high, but high water during a torrential cloudburst is NORMAL. DrainWatch's proprietary correlation engine cross-references Doppler water velocity with local precipitation. Because outflow velocity plummeted to 0.18 m/s while water depth lingered above 85% for 6 consecutive cycles, our system cleanly escalates from Suspected to Confirmed Blockage before a single puddle overflows onto the sidewalk."</em>
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/30 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center space-x-1.5 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>3:30 - 4:30 • Closed-Loop Maintenance Dispatch</span>
              </span>
              <button
                onClick={() => {
                  setActiveTab('maintenance');
                }}
                className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 dark:bg-rose-600/40 dark:hover:bg-rose-600/60 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-500/50 rounded-lg text-[11px] font-bold flex items-center space-x-1"
              >
                <Play className="w-3 h-3" />
                <span>Open Maintenance Board</span>
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Script cue:</strong> <em>"With one click, our municipal operators convert this confirmed blockage into an automated dispatch work order. Hydro-Jetting Truck Unit 4 is assigned with real-time ETA routing. Notice how our maintenance log maintains an auditable chain of custody from initial acoustic anomaly to final clearance."</em>
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/30 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center space-x-1.5 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>4:30 - 5:00 • Resolution & Verification: The Full Loop</span>
              </span>
              <button
                onClick={() => {
                  toggleDrainBlockage('DRN-101-MK');
                  setSelectedDrainId('DRN-101-MK');
                }}
                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-600/40 dark:hover:bg-emerald-600/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-500/50 rounded-lg text-[11px] font-bold flex items-center space-x-1"
              >
                <Play className="w-3 h-3" />
                <span>Verify Flow Restoration</span>
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Script cue:</strong> <em>"Once the crew clears the debris basket, the sensor automatically detects hydraulic flow returning to nominal velocity, the alert auto-resolves, and city streets remain dry, safe, and open for business. Thank you!"</em>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            Ready to Pitch
          </button>
        </div>
      </div>
    </div>
  );
};
