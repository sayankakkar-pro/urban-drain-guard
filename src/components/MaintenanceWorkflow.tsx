import React, { useState } from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Truck, 
  AlertOctagon, 
  Plus, 
  ExternalLink,
  ShieldCheck,
  Send,
  Sparkles
} from 'lucide-react';
import { useDrainSystem } from '../context/DrainContext';
import { MaintenanceStatus, WorkOrder } from '../types/drain';

export const MaintenanceWorkflow: React.FC = () => {
  const { 
    workOrders, 
    updateWorkOrderStatus, 
    setSelectedDrainId,
    drains 
  } = useDrainSystem();

  const [activeStatusTab, setActiveStatusTab] = useState<MaintenanceStatus | 'all'>('all');
  const [selectedCrew, setSelectedCrew] = useState<Record<string, string>>({});
  const [newNote, setNewNote] = useState<Record<string, string>>({});

  const CREW_OPTIONS = [
    'Hydro-Jetting Truck Unit 4 (Operator: K. Miller)',
    'Rapid Response Crew Alpha (Leader: D. Vance)',
    'Vacuum Excavator Unit 2 (Operator: S. Chen)',
    'Stormwater Catchment Patrol 3 (Inspector: J. Doe)',
    'Emergency Drainage Division North'
  ];

  const filteredOrders = workOrders.filter(wo => {
    if (activeStatusTab === 'all') return true;
    return wo.status === activeStatusTab;
  });

  const handleAssignCrew = (orderId: string) => {
    const crew = selectedCrew[orderId] || CREW_OPTIONS[0];
    updateWorkOrderStatus(orderId, 'assigned', `Assigned to ${crew}. Crew dispatched with ETA 10 minutes.`);
  };

  const handleStartWork = (orderId: string) => {
    updateWorkOrderStatus(orderId, 'in_progress', 'Crew arrived at drain catch basin. Commenced debris extraction and jetting.');
  };

  const handleResolve = (orderId: string) => {
    updateWorkOrderStatus(orderId, 'resolved', 'Blockage extracted. Catch basin grate cleared. Flow sensor verified nominal gravity velocity.');
  };

  const handleAddNote = (orderId: string) => {
    const noteText = newNote[orderId];
    if (noteText && noteText.trim()) {
      updateWorkOrderStatus(orderId, workOrders.find(w => w.id === orderId)?.status || 'in_progress', `Note: ${noteText.trim()}`);
      setNewNote(prev => ({ ...prev, [orderId]: '' }));
    }
  };

  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Open / Pending</span>;
      case 'assigned':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-300 dark:border-sky-500/40">En Route</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40">In Progress</span>;
      case 'resolved':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">Resolved & Cleared</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Pipeline Overview */}
      <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Wrench className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Municipal Maintenance Dispatch Board</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Field crew dispatch, work order progression, and hydrodynamic resolution verification.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveStatusTab('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeStatusTab === 'all' ? 'bg-brand-600 dark:bg-brand-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Orders ({workOrders.length})
          </button>
          <button
            onClick={() => setActiveStatusTab('open')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeStatusTab === 'open' ? 'bg-brand-600 dark:bg-brand-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Open ({workOrders.filter(w => w.status === 'open').length})
          </button>
          <button
            onClick={() => setActiveStatusTab('assigned')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeStatusTab === 'assigned' ? 'bg-brand-600 dark:bg-brand-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Assigned ({workOrders.filter(w => w.status === 'assigned').length})
          </button>
          <button
            onClick={() => setActiveStatusTab('in_progress')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeStatusTab === 'in_progress' ? 'bg-brand-600 dark:bg-brand-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            In Progress ({workOrders.filter(w => w.status === 'in_progress').length})
          </button>
          <button
            onClick={() => setActiveStatusTab('resolved')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeStatusTab === 'resolved' ? 'bg-brand-600 dark:bg-brand-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Resolved ({workOrders.filter(w => w.status === 'resolved').length})
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const isResolved = order.status === 'resolved';

            return (
              <div 
                key={order.id}
                className={`glass-panel rounded-xl p-4 border flex flex-col justify-between transition-all shadow-xs ${
                  isResolved 
                    ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-500/5' 
                    : order.priority === 'urgent'
                    ? 'border-rose-200 dark:border-rose-500/50 bg-rose-50/30 dark:bg-rose-500/5'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Top Bar: ID, Status, Priority */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {order.id}
                      </span>
                      <span className="font-mono text-xs text-brand-700 dark:text-brand-300 font-bold">
                        {order.drainId}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        order.priority === 'urgent' ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40' :
                        order.priority === 'high' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {order.priority}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  {/* Title & Street */}
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {order.drainName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-2 font-medium">
                    {order.street} ({order.zone})
                  </p>

                  {/* Action Directive */}
                  <div className="bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs mb-3 shadow-2xs">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">
                      Required Field Action:
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {order.actionRequired}
                    </span>
                  </div>

                  {/* Crew Assignment Status */}
                  <div className="flex items-center justify-between text-xs py-1.5 px-2 bg-slate-100 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800/80 mb-3 font-mono">
                    <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-medium">
                      <Truck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <span>{order.assignedCrew || 'No Crew Assigned'}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {order.estimatedArrival || (isResolved ? 'Job Completed' : 'Pending')}
                    </span>
                  </div>

                  {/* Operational Activity Log */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-3 max-h-32 overflow-y-auto pr-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Chronological Dispatch Log:
                    </span>
                    {order.notes.map((note, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 mt-1.5 shrink-0"></span>
                        <span className="text-slate-700 dark:text-slate-300">{note}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Transitions & Bottom Controls */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                  {/* Note Input */}
                  {!isResolved && (
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="text"
                        placeholder="Add field dispatch note..."
                        value={newNote[order.id] || ''}
                        onChange={(e) => setNewNote({ ...newNote, [order.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddNote(order.id);
                        }}
                        className="flex-1 px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      />
                      <button
                        onClick={() => handleAddNote(order.id)}
                        className="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-700"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Progression Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedDrainId(order.drainId)}
                      className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-mono font-medium flex items-center space-x-1"
                    >
                      <span>Inspect Drain</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <div className="flex items-center space-x-2 ml-auto">
                      {order.status === 'open' && (
                        <button
                          onClick={() => handleAssignCrew(order.id)}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 shadow-xs"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Dispatch Jetting Unit</span>
                        </button>
                      )}

                      {order.status === 'assigned' && (
                        <button
                          onClick={() => handleStartWork(order.id)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 shadow-xs"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Start Field Clearance</span>
                        </button>
                      )}

                      {order.status === 'in_progress' && (
                        <button
                          onClick={() => handleResolve(order.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center space-x-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark Resolved & Verify Flow</span>
                        </button>
                      )}

                      {isResolved && (
                        <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verified & De-escalated</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 glass-panel rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Work Orders in this Category</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              All storm drain intake maintenance is up to date.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
