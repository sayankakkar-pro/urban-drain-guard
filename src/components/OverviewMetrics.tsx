import React from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Gauge, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Droplets
} from 'lucide-react';
import { useDrainSystem } from '../context/DrainContext';

export const OverviewMetrics: React.FC = () => {
  const { drains, setActiveTab, setFilterRisk } = useDrainSystem();

  const totalDrains = drains.length;
  const normalDrains = drains.filter(d => d.clearanceStatus === 'clear' && d.riskLevel === 'low').length;
  const warningDrains = drains.filter(d => d.riskLevel === 'moderate' || d.clearanceStatus === 'suspected_blockage').length;
  const criticalDrains = drains.filter(d => d.riskLevel === 'critical' || d.clearanceStatus === 'confirmed_blockage').length;

  const avgCapacity = Math.round(drains.reduce((sum, d) => sum + d.capacityPercent, 0) / (totalDrains || 1));
  const totalDischargeRate = drains.reduce((sum, d) => {
    const reading = d.history[d.history.length - 1];
    return sum + (reading?.dischargeRateLs || 0);
  }, 0);

  const handleCardClick = (riskFilter: string, targetTab: 'drains' | 'alerts' = 'drains') => {
    setFilterRisk(riskFilter);
    setActiveTab(targetTab);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {/* 1. Total Monitored Inlets */}
      <div 
        onClick={() => handleCardClick('all', 'drains')}
        className="glass-panel p-4 rounded-xl border border-slate-200/90 dark:border-slate-800/80 hover:border-brand-400 dark:hover:border-brand-500/40 transition-all cursor-pointer group shadow-xs"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Monitored Inlets</span>
          <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline space-x-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{totalDrains}</span>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">100% Online</span>
        </div>
        <div className="mt-2 flex items-center text-[11px] text-slate-500 dark:text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
          <span>LoRaWAN Mesh Active</span>
        </div>
      </div>

      {/* 2. Normal Locations */}
      <div 
        onClick={() => handleCardClick('normal', 'drains')}
        className="glass-panel p-4 rounded-xl border border-slate-200/90 dark:border-slate-800/80 hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-all cursor-pointer group shadow-xs"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Normal / Free Flow</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline space-x-2">
          <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{normalDrains}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">of {totalDrains}</span>
        </div>
        <div className="mt-2 flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
          <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 text-emerald-500" />
          <span>Optimal Discharge</span>
        </div>
      </div>

      {/* 3. Warning / Suspected Locations */}
      <div 
        onClick={() => handleCardClick('suspected', 'drains')}
        className={`glass-panel p-4 rounded-xl border transition-all cursor-pointer group shadow-xs ${
          warningDrains > 0 
            ? 'border-amber-300 dark:border-amber-500/30 hover:border-amber-500 bg-amber-50/50 dark:bg-amber-500/5' 
            : 'border-slate-200/90 dark:border-slate-800/80 hover:border-amber-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Suspected Blockage</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline space-x-2">
          <span className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{warningDrains}</span>
          <span className="text-[11px] font-mono text-amber-700 dark:text-amber-300/80 font-semibold">Flow Deficit</span>
        </div>
        <div className="mt-2 flex items-center text-[11px] text-amber-600 dark:text-amber-400 font-medium">
          <TrendingUp className="w-3.5 h-3.5 mr-1" />
          <span>Debris Accumulation</span>
        </div>
      </div>

      {/* 4. Critical Alerts (Confirmed) */}
      <div 
        onClick={() => handleCardClick('critical', 'alerts')}
        className={`glass-panel p-4 rounded-xl border transition-all cursor-pointer group shadow-xs ${
          criticalDrains > 0 
            ? 'border-rose-300 dark:border-rose-500/50 hover:border-rose-500 bg-rose-50/60 dark:bg-rose-500/10 shadow-md shadow-rose-500/5' 
            : 'border-slate-200/90 dark:border-slate-800/80 hover:border-rose-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Critical / Confirmed</span>
          <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <AlertOctagon className="w-4 h-4 animate-pulse" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline space-x-2">
          <span className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">{criticalDrains}</span>
          <span className="text-[11px] font-mono text-rose-700 dark:text-rose-300 font-semibold">Overflow Threat</span>
        </div>
        <div className="mt-2 flex items-center text-[11px] text-rose-600 dark:text-rose-300 font-semibold">
          <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 text-rose-500" />
          <span>Dispatch Required</span>
        </div>
      </div>

      {/* 5. Network Catchment Discharge */}
      <div 
        onClick={() => setActiveTab('analytics')}
        className="glass-panel p-4 rounded-xl border border-slate-200/90 dark:border-slate-800/80 hover:border-sky-400 dark:hover:border-sky-500/40 transition-all cursor-pointer group col-span-2 md:col-span-1 shadow-xs"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Network Capacity</span>
          <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Gauge className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline space-x-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{avgCapacity}%</span>
          <span className="text-[11px] font-mono text-sky-600 dark:text-sky-400 font-semibold">{totalDischargeRate} L/s flow</span>
        </div>
        {/* Visual Mini Progress Bar */}
        <div className="mt-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              avgCapacity > 75 ? 'bg-rose-500' :
              avgCapacity > 55 ? 'bg-amber-500' :
              'bg-brand-500'
            }`}
            style={{ width: `${Math.min(100, avgCapacity)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
