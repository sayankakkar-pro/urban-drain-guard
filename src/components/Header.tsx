import React from 'react';
import { 
  Waves, 
  Play, 
  Pause, 
  FastForward, 
  CloudRain, 
  Clock, 
  Sliders, 
  RefreshCw, 
  ShieldAlert, 
  Wrench, 
  BarChart3, 
  LayoutDashboard, 
  Grid,
  Sun,
  Moon
} from 'lucide-react';
import { useDrainSystem } from '../context/DrainContext';

interface HeaderProps {
  onOpenThresholds: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenThresholds }) => {
  const {
    weather,
    isSimulationRunning,
    simulationSpeed,
    lastUpdatedTimestamp,
    activeTab,
    alerts,
    workOrders,
    theme,
    toggleTheme,
    setActiveTab,
    toggleSimulation,
    setSimulationSpeed,
    triggerManualReadingCycle
  } = useDrainSystem();

  const activeAlertsCount = alerts.filter(a => a.status === 'active' || a.status === 'in_progress').length;
  const activeWorkOrdersCount = workOrders.filter(w => w.status !== 'resolved').length;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & City Dept Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-black/5 dark:ring-white/20">
              <Waves className="w-6 h-6 text-white animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
                  DrainWatch <span className="text-brand-600 dark:text-brand-400 font-mono text-sm ml-1.5 px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20">IoT</span>
                </span>
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="hidden sm:inline-block text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                  Live Catchment
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Municipal Stormwater & Intake Blockage Early Warning System
              </p>
            </div>
          </div>

          {/* Environmental Telemetry & Controls */}
          <div className="flex items-center space-x-2.5">
            {/* Live Rain & Weather Badge */}
            <div className="hidden lg:flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs">
              <CloudRain className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] leading-tight">Precipitation</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{weather.rainfallMmH} mm/h</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ml-1.5 ${
                weather.rainfallMmH > 35 ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300' :
                weather.rainfallMmH > 15 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' :
                'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
              }`}>
                {weather.condition}
              </span>
            </div>

            {/* Last updated indicator */}
            <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono px-1">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>{lastUpdatedTimestamp.toLocaleTimeString()}</span>
            </div>

            {/* Simulation Controller Toolbar */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-1 rounded-lg">
              <button
                onClick={toggleSimulation}
                className={`p-1.5 rounded-md transition-colors ${
                  isSimulationRunning 
                    ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300 hover:bg-amber-500/20' 
                    : 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 hover:bg-emerald-500/20'
                }`}
                title={isSimulationRunning ? 'Pause Live Simulation' : 'Resume Simulation'}
              >
                {isSimulationRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  const nextSpeed = simulationSpeed === 1 ? 2 : simulationSpeed === 2 ? 4 : 1;
                  setSimulationSpeed(nextSpeed);
                }}
                className="px-1.5 py-1 text-xs font-mono font-semibold rounded text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center space-x-0.5"
                title="Simulation Speed Multiplier"
              >
                <FastForward className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                <span>{simulationSpeed}x</span>
              </button>

              <button
                onClick={triggerManualReadingCycle}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                title="Trigger Immediate Telemetry Tick"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Theme Toggle Button (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Threshold Settings button */}
            <button
              onClick={onOpenThresholds}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
              title="Configure Alert Thresholds & Persistence Logic"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-200/80 dark:border-slate-800/80 text-xs font-medium no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-brand-50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-500/30 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Overview & Network</span>
          </button>

          <button
            onClick={() => setActiveTab('drains')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'drains'
                ? 'bg-brand-50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-500/30 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Monitored Inlets</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'alerts'
                ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-500/30 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
            <span>Early Warning Alerts</span>
            {activeAlertsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold text-[10px]">
                {activeAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'maintenance'
                ? 'bg-amber-50 dark:bg-brand-500/20 text-amber-800 dark:text-brand-300 font-semibold border border-amber-200 dark:border-brand-500/30 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Maintenance Dispatch</span>
            {activeWorkOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-500/30 text-amber-700 dark:text-amber-300 font-mono text-[10px] border border-amber-300 dark:border-amber-500/40">
                {activeWorkOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-sky-50 dark:bg-brand-500/20 text-sky-700 dark:text-brand-300 font-semibold border border-sky-200 dark:border-brand-500/30 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            <span>Hydraulic Analytics</span>
          </button>
        </div>
      </div>
    </header>
  );
};
