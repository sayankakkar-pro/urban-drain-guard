import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  Clock, 
  ArrowRight, 
  ExternalLink, 
  Search, 
  Filter,
  Check
} from 'lucide-react';
import { useDrainSystem } from '../context/DrainContext';
import { AlertSeverity } from '../types/drain';

export const AlertHistoryPanel: React.FC = () => {
  const { 
    alerts, 
    setSelectedDrainId, 
    createWorkOrderFromAlert, 
    acknowledgeAlert,
    setActiveTab 
  } = useDrainSystem();

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchAlerts, setSearchAlerts] = useState<string>('');

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesSearch = 
      searchAlerts === '' ||
      alert.drainName.toLowerCase().includes(searchAlerts.toLowerCase()) ||
      alert.drainId.toLowerCase().includes(searchAlerts.toLowerCase()) ||
      alert.street.toLowerCase().includes(searchAlerts.toLowerCase()) ||
      alert.title.toLowerCase().includes(searchAlerts.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length;
  const suspectedCount = alerts.filter(a => a.severity === 'suspected' && a.status !== 'resolved').length;
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;

  return (
    <div className="space-y-4">
      {/* Alert KPI Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-panel p-3.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/60 dark:bg-rose-500/5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 dark:text-rose-300">Confirmed Critical Blockages</span>
            <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">{criticalCount}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Immediate Overflow Threat</span>
          </div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-orange-200 dark:border-orange-500/30 bg-orange-50/60 dark:bg-orange-500/5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-800 dark:text-orange-300">Suspected Flow Obstructions</span>
            <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-orange-600 dark:text-orange-400">{suspectedCount}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Under Investigation</span>
          </div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Resolved Incidents</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{resolvedCount}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Restored to Free Flow</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="glass-panel p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alerts by drain, street, or anomaly..."
            value={searchAlerts}
            onChange={(e) => setSearchAlerts(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSeverityFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              severityFilter === 'all' 
                ? 'bg-brand-600 dark:bg-brand-500 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All Severities ({alerts.length})
          </button>

          <button
            onClick={() => setSeverityFilter('critical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              severityFilter === 'critical' 
                ? 'bg-rose-600 dark:bg-rose-500 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Critical Only
          </button>

          <button
            onClick={() => setSeverityFilter('suspected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              severityFilter === 'suspected' 
                ? 'bg-orange-600 dark:bg-orange-500 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-300 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Suspected Only
          </button>
        </div>
      </div>

      {/* Alert Items List */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const isCrit = alert.severity === 'critical';
            const isSusp = alert.severity === 'suspected';
            const isResolved = alert.status === 'resolved';

            return (
              <div 
                key={alert.id}
                className={`glass-panel p-4 rounded-xl border transition-all shadow-xs ${
                  isResolved 
                    ? 'border-slate-200 dark:border-slate-800/80 opacity-60' 
                    : isCrit 
                    ? 'border-rose-200 dark:border-rose-500/50 bg-rose-50/40 dark:bg-rose-500/5' 
                    : isSusp 
                    ? 'border-orange-200 dark:border-orange-500/40 bg-orange-50/40 dark:bg-orange-500/5' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Left Column: Severity, Title, Description */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wide flex items-center space-x-1 ${
                        isCrit ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40' :
                        isSusp ? 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 border border-orange-300 dark:border-orange-500/40' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                      }`}>
                        {isCrit && <AlertOctagon className="w-3 h-3 mr-1 inline" />}
                        {isSusp && <AlertTriangle className="w-3 h-3 mr-1 inline" />}
                        <span>{isCrit ? 'CONFIRMED BLOCKAGE' : isSusp ? 'SUSPECTED OBSTRUCTION' : 'HIGH WATER ADVISORY'}</span>
                      </span>

                      <span className="font-mono text-xs text-brand-700 dark:text-brand-300 font-bold">
                        {alert.drainId}
                      </span>

                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {alert.drainName} ({alert.zone})
                      </span>

                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center ml-auto lg:ml-0 font-medium">
                        <Clock className="w-3 h-3 mr-1 text-slate-400" />
                        {alert.timestamp}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{alert.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{alert.description}</p>

                    {/* Telemetry Snapshot at Alert Moment */}
                    <div className="flex flex-wrap items-center gap-4 text-[11px] pt-1 text-slate-500 dark:text-slate-400">
                      <span>Water Depth: <strong className="text-slate-900 dark:text-white font-mono">{alert.waterLevelCm} cm</strong> ({alert.capacityPercent}%)</span>
                      <span>Persistence: <strong className="text-amber-700 dark:text-amber-300 font-mono font-semibold">{alert.persistentCycles} cycles</strong></span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        Action: <span className="text-brand-700 dark:text-sky-300 font-semibold">{alert.recommendedAction}</span>
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => setSelectedDrainId(alert.drainId)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center space-x-1"
                    >
                      <span>Telemetry</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>

                    {alert.status === 'active' && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center space-x-1"
                      >
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>Acknowledge</span>
                      </button>
                    )}

                    {alert.status !== 'resolved' && !alert.workOrderId && (
                      <button
                        onClick={() => createWorkOrderFromAlert(alert.id, isCrit ? 'Hydro-Jet Truck 1' : 'Rapid Patrol Crew 2', isCrit ? 'urgent' : 'high')}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center space-x-1.5"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Dispatch Crew</span>
                      </button>
                    )}

                    {alert.workOrderId && (
                      <button
                        onClick={() => setActiveTab('maintenance')}
                        className="px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/40 text-xs font-semibold flex items-center space-x-1"
                      >
                        <span>Work Order Active</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass-panel rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Alerts Matching Query</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              All monitored catchment points are operating within nominal thresholds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
