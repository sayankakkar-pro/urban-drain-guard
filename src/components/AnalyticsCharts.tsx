import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { BarChart3, TrendingUp, Droplets, Gauge, AlertTriangle, GitCompare } from 'lucide-react';
import { useDrainSystem } from '../context/DrainContext';

export const AnalyticsCharts: React.FC = () => {
  const { drains, weather, theme } = useDrainSystem();

  const isDark = theme === 'dark';
  const [compareDrainA, setCompareDrainA] = useState<string>('DRN-101-MK'); // Confirmed Blocked
  const [compareDrainB, setCompareDrainB] = useState<string>('DRN-103-GH'); // Free flow

  const drainA = drains.find(d => d.id === compareDrainA) || drains[0];
  const drainB = drains.find(d => d.id === compareDrainB) || drains[1];

  // Capacity comparison data
  const capacityBarData = drains.map(d => ({
    id: d.id,
    name: d.name.length > 14 ? d.name.substring(0, 12) + '...' : d.name,
    capacity: d.capacityPercent,
    depth: d.currentWaterLevelCm,
    maxDepth: d.maxDepthCm,
    isBlocked: d.simulatedBlockage,
    zone: d.zone
  }));

  // Combined timeseries for comparison
  const comparisonTimeseries = (drainA?.history || []).map((readingA, index) => {
    const readingB = drainB?.history?.[index];
    return {
      timeLabel: readingA.timeLabel,
      drainA_depth: readingA.waterLevelCm,
      drainA_efficiency: Math.round(readingA.flowVelocityMs * 45),
      drainB_depth: readingB ? readingB.waterLevelCm : 0,
      drainB_efficiency: readingB ? Math.round(readingB.flowVelocityMs * 45) : 0,
      rainfall: readingA.rainfallMmH,
    };
  });

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Total Network Surcharge</span>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {Math.round(drains.reduce((acc, d) => acc + d.capacityPercent, 0) / drains.length)}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Mean Volume</span>
          </div>
          <span className="text-[11px] text-brand-600 dark:text-brand-400 mt-1 block font-medium">Active Inflow: {weather.rainfallMmH} mm/h</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Estimated Outflow Rate</span>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold font-mono text-sky-600 dark:text-sky-400">
              {drains.reduce((acc, d) => acc + Math.round(d.flowVelocityMs * 40 * (d.drainageEfficiencyPercent / 100)), 0)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Liters/sec</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Across 12 monitored conduits</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Severe Obstruction Deficit</span>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {drains.filter(d => d.drainageEfficiencyPercent < 40).length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Critical Points</span>
          </div>
          <span className="text-[11px] text-rose-600 dark:text-rose-300 mt-1 block font-medium">Requiring immediate jet-vac</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Hydro-Model Accuracy</span>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">99.4%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sensor Confidence</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">Doppler-Acoustic cross-check</span>
        </div>
      </div>

      {/* City-Wide Drain Surcharge Capacity Bar Chart */}
      <div className="glass-panel p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Conduit Capacity & Surcharge Distribution</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Catchment basin surcharge percentage across all 12 monitored urban locations. Red bars denote persistent threshold breaches.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono font-medium">
            <span className="flex items-center text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 mr-1.5"></span>
              Free Flow
            </span>
            <span className="flex items-center text-rose-600 dark:text-rose-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 mr-1.5"></span>
              Blockage / Overflow Risk
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={capacityBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
              <XAxis 
                dataKey="id" 
                stroke={isDark ? '#64748b' : '#94a3b8'} 
                fontSize={10} 
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={10} domain={[0, 100]} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                  borderColor: isDark ? '#334155' : '#e2e8f0', 
                  color: isDark ? '#f8fafc' : '#0f172a',
                  borderRadius: '8px',
                  fontSize: '11px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                }} 
              />
              <Bar 
                dataKey="capacity" 
                name="Surcharge %" 
                fill="#0284c7"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side-by-Side Drain Comparison: Blocked vs Clear Hydrograph */}
      <div className="glass-panel p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <GitCompare className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Comparative Hydraulic Response (Blocked vs Free Flow)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Superimpose two conduits to demonstrate how the early warning engine flags discharge lag before surface street pooling begins.
            </p>
          </div>

          {/* Selectors */}
          <div className="flex items-center space-x-2">
            <select
              value={compareDrainA}
              onChange={(e) => setCompareDrainA(e.target.value)}
              aria-label="Compare Conduit A"
              className="bg-slate-50 dark:bg-slate-900 border border-rose-300 dark:border-rose-500/50 text-xs text-rose-700 dark:text-rose-300 rounded-lg px-2.5 py-1.5 focus:outline-none font-medium shadow-2xs"
            >
              {drains.map(d => (
                <option key={d.id} value={d.id}>
                  A: {d.id} ({d.clearanceStatus === 'clear' ? 'Clear' : 'Clogged'})
                </option>
              ))}
            </select>

            <span className="text-xs text-slate-400 font-bold">vs</span>

            <select
              value={compareDrainB}
              onChange={(e) => setCompareDrainB(e.target.value)}
              aria-label="Compare Conduit B"
              className="bg-slate-50 dark:bg-slate-900 border border-sky-300 dark:border-sky-500/50 text-xs text-sky-700 dark:text-sky-300 rounded-lg px-2.5 py-1.5 focus:outline-none font-medium shadow-2xs"
            >
              {drains.map(d => (
                <option key={d.id} value={d.id}>
                  B: {d.id} ({d.clearanceStatus === 'clear' ? 'Clear' : 'Clogged'})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonTimeseries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
              <XAxis dataKey="timeLabel" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={10} tickLine={false} />
              <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                  borderColor: isDark ? '#334155' : '#e2e8f0', 
                  color: isDark ? '#f8fafc' : '#0f172a',
                  borderRadius: '8px',
                  fontSize: '11px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line 
                type="monotone" 
                dataKey="drainA_depth" 
                name={`${drainA.name} Depth (cm)`} 
                stroke="#e11d48" 
                strokeWidth={2.5} 
                dot={false} 
              />
              <Line 
                type="monotone" 
                dataKey="drainB_depth" 
                name={`${drainB.name} Depth (cm)`} 
                stroke="#0284c7" 
                strokeWidth={2.5} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
