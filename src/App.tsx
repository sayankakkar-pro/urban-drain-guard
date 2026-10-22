import React, { useState } from 'react';
import { DrainProvider, useDrainSystem } from './context/DrainContext';
import { Header } from './components/Header';
import { DemoBanner } from './components/DemoBanner';
import { OverviewMetrics } from './components/OverviewMetrics';
import { MapSchematicView } from './components/MapSchematicView';
import { DrainCardList } from './components/DrainCardList';
import { AlertHistoryPanel } from './components/AlertHistoryPanel';
import { MaintenanceWorkflow } from './components/MaintenanceWorkflow';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { DrainDetailModal } from './components/DrainDetailModal';
import { ThresholdConfigModal } from './components/ThresholdConfigModal';
import { DemoPitchGuideModal } from './components/DemoPitchGuideModal';

const MainDashboard: React.FC = () => {
  const { activeTab } = useDrainSystem();

  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState<boolean>(false);
  const [isPitchGuideOpen, setIsPitchGuideOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-brand-500 selection:text-white pb-12 transition-colors duration-200">
      {/* 1. Competition Demo Mode Banner */}
      <DemoBanner 
        onOpenPitchGuide={() => setIsPitchGuideOpen(true)}
        onOpenThresholds={() => setIsThresholdModalOpen(true)}
      />

      {/* 2. Operations Header */}
      <Header 
        onOpenThresholds={() => setIsThresholdModalOpen(true)} 
      />

      {/* 3. Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-5">
        {/* Render Tab Contents */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5">
            {/* KPI Metric Overview */}
            <OverviewMetrics />

            {/* Dual Mode: Interactive GIS Map & Topological Schematic */}
            <MapSchematicView />

            {/* Quick Inlets Grid Preview */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Priority Catchment Inlets & Grates
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time gauged depth, outflow velocities, and blockage classification
                  </p>
                </div>
              </div>
              <DrainCardList />
            </div>
          </div>
        )}

        {activeTab === 'drains' && (
          <div className="space-y-4">
            <DrainCardList />
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <AlertHistoryPanel />
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-4">
            <MaintenanceWorkflow />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <AnalyticsCharts />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DrainWatch IoT • Urban Stormwater Blockage & Flood Prevention Architecture</span>
          <span className="font-mono text-slate-600 dark:text-slate-400">Competition Edition v1.1 • Ready for Vercel Deployment</span>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <DrainDetailModal />

      <ThresholdConfigModal 
        isOpen={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
      />

      <DemoPitchGuideModal 
        isOpen={isPitchGuideOpen}
        onClose={() => setIsPitchGuideOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <DrainProvider>
      <MainDashboard />
    </DrainProvider>
  );
};

export default App;
