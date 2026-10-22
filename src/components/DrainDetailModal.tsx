import React from 'react';
import { 
  X, 
  Droplets, 
  Activity, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  Wrench, 
  TrendingUp, 
  ShieldCheck, 
  Compass, 
  Layers, 
  Radio, 
  Battery,
  Gauge
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { useDrainSystem } from '../context/DrainContext';

export const DrainDetailModal: React.FC = () => {
  const { 
    selectedDrain, 
    setSelectedDrainId, 
    toggleDrainBlockage, 
    createWorkOrderFromAlert,
    alerts,
    weather,
    thresholds,
    theme 
  } = useDrainSystem();

  if (!selectedDrain) return null;

  const isDark = theme === 'dark';
  const isCritical = selectedDrain.clearanceStatus === 'confirmed_blockage';
  const isSuspected = selectedDrain.clearanceStatus === 'suspected_blockage';

  // Find any active alert associated with this drain
  const activeAlert = alerts.find(a => a.drainId === selectedDrain.id && a.status !== 'resolved');

  const handleDispatch = () => {
    if (activeAlert) {
      createWorkOrderFromAlert(activeAlert.id, 'Rapid Response Unit 1 (Hydro-Jet)', 'urgent');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="glass-panel-glow w-full max-w-4xl max-h-[92vh] rounded-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700/80 shadow-2xl text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-sm ${
              isCritical ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40' :
              isSuspected ? 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 border border-orange-300 dark:border-orange-500/40' :
              'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
            }`}>
              {selectedDrain.id.split('-')[1]}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{selectedDrain.name}</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-semibold">
                  {selectedDrain.id}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  isCritical ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40' :
                  isSuspected ? 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 border border-orange-300 dark:border-orange-500/40' :
                  'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                }`}>
                  {selectedDrain.clearanceStatus.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedDrain.street} • Catchment Zone: <span className="text-slate-800 dark:text-slate-300 font-semibold">{selectedDrain.zone}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedDrainId(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Metric Snapshot Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Current Water Depth</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{selectedDrain.currentWaterLevelCm}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">/ {selectedDrain.maxDepthCm} cm</span>
              </div>
              <span className={`text-[10px] font-mono mt-1 block font-semibold ${
                selectedDrain.capacityPercent > 80 ? 'text-rose-600 dark:text-rose-400' :
                selectedDrain.capacityPercent > 60 ? 'text-amber-600 dark:text-amber-400' :
                'text-emerald-600 dark:text-emerald-400'
              }`}>
                {selectedDrain.capacityPercent}% of Catchment Capacity
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Outflow Velocity</span>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{selectedDrain.flowVelocityMs}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">m/s</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1 block">
                Discharge: {Math.round(selectedDrain.flowVelocityMs * 45)} L/sec
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Drainage Efficiency</span>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className={`text-2xl font-bold font-mono ${
                  selectedDrain.drainageEfficiencyPercent < 35 ? 'text-rose-600 dark:text-rose-400' :
                  selectedDrain.drainageEfficiencyPercent < 65 ? 'text-amber-600 dark:text-amber-400' :
                  'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {selectedDrain.drainageEfficiencyPercent}%
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                {selectedDrain.drainageEfficiencyPercent < 50 ? 'Severe Choke Deficit' : 'Optimal Gravity Runoff'}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Anomaly Persistence</span>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{selectedDrain.persistentAbnormalCycles}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">cycles</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                Confirm Threshold: {thresholds.confirmedPersistenceCycles} cycles
              </span>
            </div>
          </div>

          {/* Cross-Section Graphic & Sensor Physics Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Catchment Manhole Cross-Section Illustration */}
            <div className="md:col-span-5 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Chamber Physical Cross-Section
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  Ultrasonic time-of-flight acoustic sensor monitoring water level and sediment silting.
                </p>
              </div>

              {/* Physical SVG Diagram */}
              <div className="relative w-full h-56 bg-white dark:bg-slate-900/60 rounded-lg p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                <svg viewBox="0 0 300 220" className="w-full h-full">
                  {/* Street Ground Surface */}
                  <rect x="10" y="25" width="280" height="8" fill={isDark ? "#334155" : "#cbd5e1"} rx="2" />
                  <text x="20" y="20" fill={isDark ? "#94a3b8" : "#64748b"} fontSize="9" fontWeight="bold">STREET SURFACE</text>

                  {/* Curb Inflow Grate */}
                  <line x1="70" y1="29" x2="230" y2="29" stroke={isDark ? "#64748b" : "#94a3b8"} strokeWidth="4" strokeDasharray="6 4" />
                  <text x="150" y="42" fill={isDark ? "#cbd5e1" : "#475569"} fontSize="8" textAnchor="middle" fontWeight="bold">INLET GRATE MESH</text>

                  {/* Catch Basin Manhole Walls */}
                  <path d="M 70 33 L 70 200 L 230 200 L 230 140 L 285 140 L 285 180 L 230 180" 
                        fill="none" stroke={isDark ? "#475569" : "#94a3b8"} strokeWidth="4" strokeLinejoin="round" />

                  {/* Outflow Pipe Label */}
                  <text x="260" y="132" fill="#0284c7" fontSize="8" textAnchor="middle" fontWeight="bold">OUTFLOW PIPE</text>

                  {/* Ultrasonic Sensor Device Mounted at Roof */}
                  <rect x="135" y="48" width="30" height="14" fill="#0284c7" rx="3" stroke="#38bdf8" strokeWidth="1" />
                  <text x="150" y="58" fill="white" fontSize="7" textAnchor="middle" fontWeight="bold">IOT SENSOR</text>

                  {/* Acoustic Sound Waves downward */}
                  <path d="M 142 66 Q 150 72 158 66" fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="2 2" />
                  <path d="M 138 72 Q 150 80 162 72" fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="2 2" />

                  {/* Water Pool inside Basin */}
                  {(() => {
                    const maxVisualH = 140; // from y=200 up to y=60
                    const waterH = (selectedDrain.capacityPercent / 100) * maxVisualH;
                    const waterY = 200 - waterH;
                    return (
                      <g>
                        <rect 
                          x="72" 
                          y={waterY} 
                          width="156" 
                          height={waterH} 
                          fill={isCritical ? 'rgba(239, 68, 68, 0.45)' : isSuspected ? 'rgba(249, 115, 22, 0.4)' : 'rgba(14, 165, 233, 0.4)'} 
                        />
                        {/* Water Surface Wave */}
                        <line 
                          x1="72" 
                          y1={waterY} 
                          x2="228" 
                          y2={waterY} 
                          stroke={isCritical ? '#ef4444' : isSuspected ? '#f97316' : '#0284c7'} 
                          strokeWidth="2.5" 
                        />
                        <text x="150" y={Math.max(75, waterY - 5)} fill={isDark ? "#f1f5f9" : "#0f172a"} fontSize="9" fontWeight="bold" textAnchor="middle">
                          WATER LEVEL: {selectedDrain.currentWaterLevelCm} cm ({selectedDrain.capacityPercent}%)
                        </text>
                      </g>
                    );
                  })()}

                  {/* Simulated Trash / Debris Blockage at Grate or Outflow */}
                  {selectedDrain.simulatedBlockage && (
                    <g>
                      <rect x="220" y="142" width="18" height="36" fill="#78350f" rx="3" stroke="#f59e0b" strokeWidth="1.5" />
                      <text x="229" y="163" fill="#fef08a" fontSize="7" fontWeight="bold" textAnchor="middle">CLOG</text>
                    </g>
                  )}
                </svg>
              </div>

              {/* Status footer pill */}
              <div className="mt-2 text-center">
                <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded ${
                  selectedDrain.simulatedBlockage 
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 font-semibold' 
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {selectedDrain.simulatedBlockage ? 'Obstruction Active in Hydraulic Model' : 'Chamber Free of Sediment'}
                </span>
              </div>
            </div>

            {/* Diagnostic Anomaly Reasoning */}
            <div className="md:col-span-7 bg-slate-50 dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Autonomous Blockage Diagnostic Engine
                </span>
                
                <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-200 mb-1">
                      <span>1. Hydraulic Flow Correlation</span>
                      <span className="font-mono text-brand-600 dark:text-brand-400">
                        {selectedDrain.drainageEfficiencyPercent}% Efficiency
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Compares precipitation inflow rate against gravitational outlet discharge. 
                      {selectedDrain.drainageEfficiencyPercent < 40 
                        ? ' Severe negative discharge divergence detected: water enters faster than pipe capacity allows despite unobstructed downstream conditions.'
                        : ' Flow discharge correlates normally with precipitation catchment volume.'}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-200 mb-1">
                      <span>2. Persistence Anomaly Tracker</span>
                      <span className="font-mono text-amber-600 dark:text-amber-400">
                        {selectedDrain.persistentAbnormalCycles} / {thresholds.confirmedPersistenceCycles} Cycles
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Normal flash rain produces transient water elevation that recedes within 2 cycles. 
                      {selectedDrain.persistentAbnormalCycles >= thresholds.confirmedPersistenceCycles
                        ? ' Persistence threshold exceeded. Status escalated to CONFIRMED BLOCKAGE.'
                        : selectedDrain.persistentAbnormalCycles >= thresholds.suspectedPersistenceCycles
                        ? ' Elevated depth persistent across multiple cycles. Categorized as SUSPECTED OBSTRUCTION.'
                        : ' No persistent hydrodynamic stagnation.'}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-200 mb-1">
                      <span>3. Municipal Action Recommendation</span>
                      <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400">Action Protocol</span>
                    </div>
                    <p className="text-[11px] text-slate-800 dark:text-slate-300 font-medium">
                      {isCritical 
                        ? 'Deploy emergency Jet-Vac truck immediately. Restrict right curb lane to avert surface roadway submersion.'
                        : isSuspected
                        ? 'Schedule two-person inspection unit to clear surface grate mesh and dislodge vegetative sediment.'
                        : 'Routine monitoring. Chamber capacity optimal for upcoming weather fronts.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hardware Telemetry Bar */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span className="flex items-center font-medium">
                  <Battery className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-1" />
                  Battery: {selectedDrain.batteryLevel}% (4.2 yrs life)
                </span>
                <span className="flex items-center font-medium">
                  <Radio className="w-4 h-4 text-sky-600 dark:text-sky-400 mr-1" />
                  LoRa Signal: {selectedDrain.signalStrengthDbm} dBm
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Recharts: Water Level (cm) vs Rainfall (mm/h) Over Time */}
          <div className="bg-slate-50 dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  30-Minute Dynamic Telemetry History
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Dual-axis timeseries correlating catch basin water height with localized storm precipitation.
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs font-mono font-medium">
                <span className="flex items-center text-sky-600 dark:text-sky-400">
                  <span className="w-3 h-0.5 bg-sky-500 mr-1.5"></span>
                  Water Level (cm)
                </span>
                <span className="flex items-center text-indigo-600 dark:text-indigo-400">
                  <span className="w-3 h-2 bg-indigo-500/30 mr-1.5 rounded-sm"></span>
                  Rainfall (mm/h)
                </span>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={selectedDrain.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                  <XAxis 
                    dataKey="timeLabel" 
                    stroke={isDark ? '#64748b' : '#94a3b8'} 
                    fontSize={10} 
                    tickLine={false} 
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke="#0284c7" 
                    fontSize={10} 
                    domain={[0, selectedDrain.maxDepthCm]} 
                    tickLine={false}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#6366f1" 
                    fontSize={10} 
                    domain={[0, 60]} 
                    tickLine={false}
                  />
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
                  {/* Rainfall Area on Right Axis */}
                  <Area 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="rainfallMmH" 
                    name="Rainfall (mm/h)" 
                    fill="#6366f1" 
                    fillOpacity={isDark ? 0.15 : 0.12} 
                    stroke="#6366f1" 
                    strokeWidth={1.5} 
                  />
                  {/* Water Level Line on Left Axis */}
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="waterLevelCm" 
                    name="Water Level (cm)" 
                    stroke={isCritical ? '#ef4444' : isSuspected ? '#f97316' : '#0284c7'} 
                    strokeWidth={2.5} 
                    dot={false}
                    activeDot={{ r: 5 }} 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleDrainBlockage(selectedDrain.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                selectedDrain.simulatedBlockage
                  ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40 hover:bg-rose-200'
                  : 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 hover:bg-slate-300'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{selectedDrain.simulatedBlockage ? 'Remove Simulated Clog' : 'Inject Simulated Blockage'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {activeAlert && activeAlert.status !== 'in_progress' && (
              <button
                onClick={handleDispatch}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-md shadow-rose-600/20 flex items-center space-x-1.5"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Dispatch Maintenance Crew</span>
              </button>
            )}

            <button
              onClick={() => setSelectedDrainId(null)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-colors"
            >
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
