import React from 'react';
import { 
  ArrowUpRight, 
  ArrowRight, 
  ArrowDownRight, 
  Droplet, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  Battery, 
  Radio, 
  Wrench, 
  Activity,
  Layers
} from 'lucide-react';
import { DrainNode } from '../types/drain';
import { useDrainSystem } from '../context/DrainContext';

interface DrainCardProps {
  drain: DrainNode;
}

export const DrainCard: React.FC<DrainCardProps> = ({ drain }) => {
  const { 
    setSelectedDrainId, 
    toggleDrainBlockage, 
    thresholds,
    weather
  } = useDrainSystem();

  const isCritical = drain.clearanceStatus === 'confirmed_blockage';
  const isSuspected = drain.clearanceStatus === 'suspected_blockage';
  const isWarning = drain.riskLevel === 'moderate';

  const cardBorderClass = isCritical
    ? 'border-rose-300 dark:border-rose-500/60 bg-rose-50/40 dark:bg-gradient-to-b dark:from-rose-500/10 dark:via-slate-900/90 dark:to-slate-900 shadow-md shadow-rose-500/5'
    : isSuspected
    ? 'border-orange-300 dark:border-orange-500/50 bg-orange-50/40 dark:bg-gradient-to-b dark:from-orange-500/10 dark:via-slate-900/90 dark:to-slate-900 shadow-sm'
    : isWarning
    ? 'border-amber-200 dark:border-amber-500/40 bg-amber-50/20 dark:bg-gradient-to-b dark:from-amber-500/5 dark:via-slate-900/90 dark:to-slate-900'
    : 'border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 hover:border-brand-400 dark:hover:border-slate-700 shadow-xs';

  const getTrendIcon = () => {
    switch (drain.waterTrend) {
      case 'rising_fast':
        return <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 font-bold" />;
      case 'rising':
        return <ArrowUpRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'falling':
        return <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <ArrowRight className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getClearanceBadge = () => {
    if (isCritical) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse"></span>
          Confirmed Blockage
        </span>
      );
    }
    if (isSuspected) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5"></span>
          Suspected Blockage
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
        Clear / Free Flow
      </span>
    );
  };

  return (
    <div className={`rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between ${cardBorderClass}`}>
      {/* Header Row: ID, Type, Clearance Badge */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {drain.id}
            </span>
            <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 font-semibold">
              {drain.type.replace('_', ' ')}
            </span>
          </div>
          {getClearanceBadge()}
        </div>

        {/* Location & Catchment Zone */}
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight hover:text-brand-600 dark:hover:text-brand-300 transition-colors cursor-pointer"
            onClick={() => setSelectedDrainId(drain.id)}>
          {drain.name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-3 flex items-center justify-between">
          <span className="truncate pr-2">{drain.street}</span>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0 font-medium">{drain.zone}</span>
        </p>

        {/* Core Gauge Container: Vertical Mini-Tank & Live Stats */}
        <div className="grid grid-cols-12 gap-3 bg-slate-50 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 mb-3 shadow-inner">
          {/* Vertical Water Column Graphic */}
          <div className="col-span-3 flex flex-col items-center justify-between">
            <div className="w-8 h-20 bg-slate-200 dark:bg-slate-900 rounded-lg p-0.5 border border-slate-300 dark:border-slate-700/80 flex flex-col justify-end overflow-hidden relative shadow-inner">
              {/* Overflow warning line at 80% */}
              <div className="absolute top-[20%] left-0 right-0 border-t border-dashed border-rose-500/70 z-10"></div>
              
              {/* Dynamic Water Volume */}
              <div
                className={`w-full rounded transition-all duration-700 ${
                  isCritical ? 'bg-gradient-to-t from-rose-600 to-rose-400' :
                  isSuspected ? 'bg-gradient-to-t from-orange-600 to-amber-400' :
                  'bg-gradient-to-t from-brand-600 to-sky-400'
                }`}
                style={{ height: `${Math.min(100, Math.max(5, drain.capacityPercent))}%` }}
              >
                <div className="w-full h-1 bg-white/50 animate-pulse"></div>
              </div>
            </div>
            <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 mt-1 font-medium">Gauged Depth</span>
          </div>

          {/* Metric Figures */}
          <div className="col-span-9 flex flex-col justify-between">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Water Depth</span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">{drain.currentWaterLevelCm}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">/ {drain.maxDepthCm} cm</span>
                </div>
              </div>

              {/* Trend Pill */}
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono shadow-xs">
                {getTrendIcon()}
                <span className="text-[10px] text-slate-700 dark:text-slate-300 font-medium capitalize">{drain.waterTrend.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Capacity & Discharge Velocity */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 mt-1">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Capacity</span>
                <span className={`text-xs font-bold font-mono ${
                  drain.capacityPercent > 80 ? 'text-rose-600 dark:text-rose-400' :
                  drain.capacityPercent > 60 ? 'text-amber-600 dark:text-amber-400' :
                  'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {drain.capacityPercent}%
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Flow Velocity</span>
                <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                  {drain.flowVelocityMs} m/s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Context: Discharge Efficiency & Rainfall Correlation */}
        <div className="space-y-1.5 text-[11px] mb-3 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/50">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 flex items-center font-medium">
              <Droplet className="w-3 h-3 text-sky-500 dark:text-sky-400 mr-1" />
              Catchment Rain Correlation
            </span>
            <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{weather.rainfallMmH} mm/h</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 flex items-center font-medium">
              <Activity className="w-3 h-3 text-brand-600 dark:text-brand-400 mr-1" />
              Hydraulic Discharge
            </span>
            <span className={`font-mono font-bold ${
              drain.drainageEfficiencyPercent < 40 ? 'text-rose-600 dark:text-rose-400' :
              drain.drainageEfficiencyPercent < 70 ? 'text-amber-600 dark:text-amber-400' :
              'text-emerald-600 dark:text-emerald-400'
            }`}>
              {drain.drainageEfficiencyPercent}% of nominal
            </span>
          </div>

          {/* Anomaly Persistence Indicator */}
          {drain.persistentAbnormalCycles > 0 && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800/60 text-amber-700 dark:text-amber-300">
              <span className="flex items-center text-[10px] font-medium">
                <AlertTriangle className="w-3 h-3 text-amber-500 mr-1" />
                Persistent Abnormal Reads:
              </span>
              <span className="font-mono font-bold text-[10px]">
                {drain.persistentAbnormalCycles} cycles
                {drain.persistentAbnormalCycles >= thresholds.confirmedPersistenceCycles && ' (BREACH)'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Hardware Status & Quick Actions */}
      <div>
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono mb-3 px-1">
          <div className="flex items-center space-x-2">
            <span className="flex items-center">
              <Battery className="w-3 h-3 text-slate-400 mr-0.5" />
              {drain.batteryLevel}%
            </span>
            <span className="flex items-center">
              <Radio className="w-3 h-3 text-slate-400 mr-0.5" />
              {drain.signalStrengthDbm} dBm
            </span>
          </div>
          <span>Updated {drain.lastUpdated}</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSelectedDrainId(drain.id)}
            className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center space-x-1 shadow-2xs"
          >
            <Activity className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Telemetry</span>
          </button>

          <button
            onClick={() => toggleDrainBlockage(drain.id)}
            className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center space-x-1 shadow-2xs ${
              drain.simulatedBlockage
                ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40 hover:bg-rose-200'
                : 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/30 hover:bg-brand-100'
            }`}
            title="Inject or Clear simulated physical blockage"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{drain.simulatedBlockage ? 'Clear Block' : 'Clog Drain'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
