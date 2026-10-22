import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  DrainNode, 
  AlertItem, 
  WorkOrder, 
  ThresholdSettings, 
  SimulationPreset, 
  MaintenanceStatus,
  SensorReading,
  ClearanceStatus,
  RiskLevel,
  ThemeMode
} from '../types/drain';
import { INITIAL_DRAINS, INITIAL_ALERTS, INITIAL_WORK_ORDERS } from '../data/initialDrains';

interface WeatherContext {
  rainfallMmH: number;
  temperatureC: number;
  condition: 'Dry / Clear' | 'Light Drizzle' | 'Moderate Rain' | 'Flash Downpour' | 'Severe Cloudburst';
  stormWarningActive: boolean;
  atmosphericPressureHpa: number;
}

interface DrainContextType {
  drains: DrainNode[];
  alerts: AlertItem[];
  workOrders: WorkOrder[];
  selectedDrain: DrainNode | null;
  weather: WeatherContext;
  thresholds: ThresholdSettings;
  simulationPreset: SimulationPreset;
  isSimulationRunning: boolean;
  simulationSpeed: number; // 1, 2, 4
  lastUpdatedTimestamp: Date;
  theme: ThemeMode;
  
  // Filtering & Sorting
  searchQuery: string;
  filterZone: string;
  filterRisk: string;
  filterStatus: string;
  sortBy: 'risk' | 'water_level' | 'capacity' | 'name';
  activeView: 'map' | 'schematic';
  activeTab: 'dashboard' | 'drains' | 'alerts' | 'maintenance' | 'analytics';
  
  // State Setters
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setSearchQuery: (query: string) => void;
  setFilterZone: (zone: string) => void;
  setFilterRisk: (risk: string) => void;
  setFilterStatus: (status: string) => void;
  setSortBy: (sort: 'risk' | 'water_level' | 'capacity' | 'name') => void;
  setActiveView: (view: 'map' | 'schematic') => void;
  setActiveTab: (tab: 'dashboard' | 'drains' | 'alerts' | 'maintenance' | 'analytics') => void;
  setSelectedDrainId: (id: string | null) => void;
  
  // Actions
  toggleSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  applyScenario: (preset: SimulationPreset) => void;
  toggleDrainBlockage: (drainId: string) => void;
  clearAllBlockages: () => void;
  updateThresholds: (settings: Partial<ThresholdSettings>) => void;
  createWorkOrderFromAlert: (alertId: string, assignedCrew: string, priority?: WorkOrder['priority']) => void;
  updateWorkOrderStatus: (workOrderId: string, status: MaintenanceStatus, note?: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  triggerManualReadingCycle: () => void;
}

const DEFAULT_THRESHOLDS: ThresholdSettings = {
  warningCapacityPercent: 60,
  criticalCapacityPercent: 82,
  suspectedPersistenceCycles: 3,
  confirmedPersistenceCycles: 5,
  flowEfficiencyDeficitPercent: 45,
};

const DrainContext = createContext<DrainContextType | undefined>(undefined);

export const DrainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drains, setDrains] = useState<DrainNode[]>(INITIAL_DRAINS);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [selectedDrainId, setSelectedDrainId] = useState<string | null>(null);
  
  const [thresholds, setThresholds] = useState<ThresholdSettings>(DEFAULT_THRESHOLDS);
  const [simulationPreset, setSimulationPreset] = useState<SimulationPreset>('debris_surge');
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [lastUpdatedTimestamp, setLastUpdatedTimestamp] = useState<Date>(new Date());
  
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('drainwatch-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  // Apply theme to html root element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('drainwatch-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Weather state
  const [weather, setWeather] = useState<WeatherContext>({
    rainfallMmH: 22.5,
    temperatureC: 17.2,
    condition: 'Moderate Rain',
    stormWarningActive: true,
    atmosphericPressureHpa: 1008,
  });

  // UI Navigation & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterZone, setFilterZone] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'risk' | 'water_level' | 'capacity' | 'name'>('risk');
  const [activeView, setActiveView] = useState<'map' | 'schematic'>('map');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'drains' | 'alerts' | 'maintenance' | 'analytics'>('dashboard');

  const selectedDrain = useMemo(() => {
    return drains.find(d => d.id === selectedDrainId) || null;
  }, [drains, selectedDrainId]);

  // Simulation step function
  const runSimulationStep = useCallback(() => {
    setLastUpdatedTimestamp(new Date());

    setDrains((prevDrains) => {
      return prevDrains.map((drain) => {
        const isBlocked = drain.simulatedBlockage;
        const currentRain = weather.rainfallMmH;
        
        // Hydraulic calculation
        // Inflow is proportional to catchment rainfall + random storm burst
        const stormFluctuation = (Math.random() * 2 - 1) * 1.5;
        const inflowFactor = Math.max(0, (currentRain + stormFluctuation) / 30);
        
        let targetLevel = drain.currentWaterLevelCm;
        let flowVelocity = drain.flowVelocityMs;
        let efficiency = drain.drainageEfficiencyPercent;
        let persistentCycles = drain.persistentAbnormalCycles;

        if (isBlocked) {
          // Water accumulates because drainage is restricted
          efficiency = Math.max(10, Math.min(35, Math.round(30 - (persistentCycles * 2))));
          const riseAmount = (inflowFactor * 4.5) + (Math.random() * 2.2);
          targetLevel = Math.min(drain.maxDepthCm, targetLevel + riseAmount);
          flowVelocity = Math.max(0.1, Number((0.45 - (persistentCycles * 0.05)).toFixed(2)));
          persistentCycles += 1;
        } else {
          // Free drainage
          efficiency = Math.min(100, Math.round(92 + Math.random() * 8));
          if (inflowFactor > 1.2) {
            // Rising due to heavy rain, but discharging rapidly
            targetLevel = Math.min(drain.maxDepthCm * 0.65, targetLevel + 2.5);
            flowVelocity = Math.min(2.4, Number((1.2 + inflowFactor * 0.5).toFixed(2)));
          } else {
            // Receding to normal base level (approx 20-35% of max)
            const baseLevel = drain.maxDepthCm * 0.25;
            targetLevel = Math.max(baseLevel, targetLevel - 2.8);
            flowVelocity = Math.max(0.6, Number((1.1 + Math.random() * 0.3).toFixed(2)));
          }
          persistentCycles = Math.max(0, persistentCycles - 1);
        }

        const newWaterLevel = Math.max(5, Math.round(targetLevel));
        const newCapacity = Math.min(100, Math.round((newWaterLevel / drain.maxDepthCm) * 100));

        // Trend calculation
        let trend: DrainNode['waterTrend'] = 'stable';
        const diff = newWaterLevel - drain.currentWaterLevelCm;
        if (diff > 4) trend = 'rising_fast';
        else if (diff > 1) trend = 'rising';
        else if (diff < -1) trend = 'falling';

        // Clearance status logic
        let clearanceStatus: ClearanceStatus = 'clear';
        let riskLevel: RiskLevel = 'low';

        if (newCapacity >= thresholds.criticalCapacityPercent || (isBlocked && persistentCycles >= thresholds.confirmedPersistenceCycles)) {
          clearanceStatus = 'confirmed_blockage';
          riskLevel = 'critical';
        } else if (
          (newCapacity >= thresholds.warningCapacityPercent && persistentCycles >= thresholds.suspectedPersistenceCycles) ||
          (isBlocked && persistentCycles >= 2) ||
          (efficiency < thresholds.flowEfficiencyDeficitPercent && newCapacity > 50)
        ) {
          clearanceStatus = 'suspected_blockage';
          riskLevel = newCapacity > 75 ? 'high' : 'moderate';
        } else if (newCapacity >= thresholds.warningCapacityPercent) {
          clearanceStatus = 'clear';
          riskLevel = 'moderate';
        }

        // Add history point
        const now = new Date();
        const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newReading: SensorReading = {
          timestamp: now.toISOString(),
          timeLabel,
          waterLevelCm: newWaterLevel,
          capacityPercent: newCapacity,
          flowVelocityMs: flowVelocity,
          dischargeRateLs: Math.round(flowVelocity * 40 * (efficiency / 100)),
          rainfallMmH: Number(currentRain.toFixed(1)),
          predictedTrend: isBlocked ? Math.min(drain.maxDepthCm, newWaterLevel + 4) : Math.max(10, newWaterLevel - 2)
        };

        const updatedHistory = [...drain.history.slice(1), newReading];

        return {
          ...drain,
          currentWaterLevelCm: newWaterLevel,
          capacityPercent: newCapacity,
          waterTrend: trend,
          clearanceStatus,
          riskLevel,
          flowVelocityMs: flowVelocity,
          drainageEfficiencyPercent: efficiency,
          persistentAbnormalCycles: persistentCycles,
          lastUpdated: 'Just now',
          history: updatedHistory
        };
      });
    });
  }, [weather.rainfallMmH, thresholds]);

  // Alert generation effect based on updated drains
  useEffect(() => {
    drains.forEach((drain) => {
      if (drain.clearanceStatus === 'confirmed_blockage') {
        setAlerts((prevAlerts) => {
          const existing = prevAlerts.find(a => a.drainId === drain.id && a.status !== 'resolved');
          if (existing) {
            if (existing.severity !== 'critical') {
              return prevAlerts.map(a => a.id === existing.id ? {
                ...a,
                severity: 'critical' as const,
                title: `CONFIRMED Blockage: Overflow Imminent at ${drain.name}`,
                waterLevelCm: drain.currentWaterLevelCm,
                capacityPercent: drain.capacityPercent,
                persistentCycles: drain.persistentAbnormalCycles,
              } : a);
            }
            return prevAlerts;
          }

          // Create new critical alert
          const newAlert: AlertItem = {
            id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
            drainId: drain.id,
            drainName: drain.name,
            street: drain.street,
            zone: drain.zone,
            timestamp: 'Just now',
            severity: 'critical',
            title: `Confirmed Severe Blockage: ${drain.name}`,
            description: `Persistent water retention (> ${thresholds.confirmedPersistenceCycles} cycles) with ${drain.capacityPercent}% capacity filled. Outflow velocity degraded to ${drain.flowVelocityMs} m/s.`,
            waterLevelCm: drain.currentWaterLevelCm,
            capacityPercent: drain.capacityPercent,
            persistentCycles: drain.persistentAbnormalCycles,
            recommendedAction: 'Immediate jet-vac truck dispatch and upstream curb sandbagging.',
            status: 'active',
          };
          return [newAlert, ...prevAlerts];
        });
      } else if (drain.clearanceStatus === 'suspected_blockage') {
        setAlerts((prevAlerts) => {
          const existing = prevAlerts.find(a => a.drainId === drain.id && a.status !== 'resolved');
          if (!existing) {
            const newAlert: AlertItem = {
              id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
              drainId: drain.id,
              drainName: drain.name,
              street: drain.street,
              zone: drain.zone,
              timestamp: 'Just now',
              severity: 'suspected',
              title: `Suspected Obstruction: ${drain.name}`,
              description: `Abnormal drainage rate deficit (${drain.drainageEfficiencyPercent}% flow). Water accumulation persistent across ${drain.persistentAbnormalCycles} cycles.`,
              waterLevelCm: drain.currentWaterLevelCm,
              capacityPercent: drain.capacityPercent,
              persistentCycles: drain.persistentAbnormalCycles,
              recommendedAction: 'Deploy inspection crew to clear surface debris grate and check silt level.',
              status: 'active',
            };
            return [newAlert, ...prevAlerts];
          }
          return prevAlerts;
        });
      }
    });
  }, [drains, thresholds]);

  // Main simulation timer
  useEffect(() => {
    if (!isSimulationRunning) return;

    const intervalTime = Math.max(1000, 3600 / simulationSpeed);
    const interval = setInterval(() => {
      runSimulationStep();
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isSimulationRunning, simulationSpeed, runSimulationStep]);

  // Actions
  const toggleSimulation = () => {
    setIsSimulationRunning(prev => !prev);
  };

  const triggerManualReadingCycle = () => {
    runSimulationStep();
  };

  const applyScenario = (preset: SimulationPreset) => {
    setSimulationPreset(preset);

    if (preset === 'normal') {
      setWeather({
        rainfallMmH: 2.1,
        temperatureC: 19.5,
        condition: 'Light Drizzle',
        stormWarningActive: false,
        atmosphericPressureHpa: 1016,
      });
      setDrains(prev => prev.map(d => ({
        ...d,
        simulatedBlockage: false,
        persistentAbnormalCycles: 0,
        currentWaterLevelCm: Math.round(d.maxDepthCm * 0.22),
        capacityPercent: 22,
        clearanceStatus: 'clear',
        riskLevel: 'low',
        flowVelocityMs: 1.15,
        drainageEfficiencyPercent: 98,
        waterTrend: 'stable',
      })));
    } else if (preset === 'flash_storm') {
      setWeather({
        rainfallMmH: 48.0,
        temperatureC: 15.8,
        condition: 'Flash Downpour',
        stormWarningActive: true,
        atmosphericPressureHpa: 998,
      });
      setDrains(prev => prev.map(d => ({
        ...d,
        simulatedBlockage: false, // High water, but drains freely!
        persistentAbnormalCycles: 0,
        currentWaterLevelCm: Math.round(d.maxDepthCm * 0.58),
        capacityPercent: 58,
        clearanceStatus: 'clear',
        riskLevel: 'moderate',
        flowVelocityMs: 2.1,
        drainageEfficiencyPercent: 95,
        waterTrend: 'rising',
      })));
    } else if (preset === 'debris_surge') {
      setWeather({
        rainfallMmH: 24.5,
        temperatureC: 16.5,
        condition: 'Moderate Rain',
        stormWarningActive: true,
        atmosphericPressureHpa: 1006,
      });
      setDrains(prev => prev.map(d => {
        if (d.id === 'DRN-101-MK' || d.id === 'DRN-102-MC') {
          return {
            ...d,
            simulatedBlockage: true,
            persistentAbnormalCycles: d.id === 'DRN-101-MK' ? 6 : 3,
            currentWaterLevelCm: Math.round(d.maxDepthCm * 0.85),
            capacityPercent: 85,
            clearanceStatus: d.id === 'DRN-101-MK' ? 'confirmed_blockage' : 'suspected_blockage',
            riskLevel: d.id === 'DRN-101-MK' ? 'critical' : 'high',
            flowVelocityMs: 0.22,
            drainageEfficiencyPercent: 20,
            waterTrend: 'rising_fast',
          };
        }
        return {
          ...d,
          simulatedBlockage: false,
          persistentAbnormalCycles: 0,
          currentWaterLevelCm: Math.round(d.maxDepthCm * 0.38),
          capacityPercent: 38,
          clearanceStatus: 'clear',
          riskLevel: 'low',
          flowVelocityMs: 1.25,
          drainageEfficiencyPercent: 94,
          waterTrend: 'stable',
        };
      }));
    } else if (preset === 'severe_gridlock') {
      setWeather({
        rainfallMmH: 62.0,
        temperatureC: 14.2,
        condition: 'Severe Cloudburst',
        stormWarningActive: true,
        atmosphericPressureHpa: 992,
      });
      setDrains(prev => prev.map((d, index) => {
        const isBlocked = index % 2 === 0;
        return {
          ...d,
          simulatedBlockage: isBlocked,
          persistentAbnormalCycles: isBlocked ? 7 : 1,
          currentWaterLevelCm: Math.round(d.maxDepthCm * (isBlocked ? 0.92 : 0.65)),
          capacityPercent: isBlocked ? 92 : 65,
          clearanceStatus: isBlocked ? 'confirmed_blockage' : 'clear',
          riskLevel: isBlocked ? 'critical' : 'moderate',
          flowVelocityMs: isBlocked ? 0.12 : 2.3,
          drainageEfficiencyPercent: isBlocked ? 12 : 92,
          waterTrend: isBlocked ? 'rising_fast' : 'rising',
        };
      }));
    }
  };

  const toggleDrainBlockage = (drainId: string) => {
    setDrains(prev => prev.map(d => {
      if (d.id === drainId) {
        const willBeBlocked = !d.simulatedBlockage;
        return {
          ...d,
          simulatedBlockage: willBeBlocked,
          persistentAbnormalCycles: willBeBlocked ? 3 : 0,
          clearanceStatus: willBeBlocked ? 'suspected_blockage' : 'clear',
          riskLevel: willBeBlocked ? 'high' : 'low',
          drainageEfficiencyPercent: willBeBlocked ? 28 : 96,
          waterTrend: willBeBlocked ? 'rising' : 'falling',
        };
      }
      return d;
    }));
  };

  const clearAllBlockages = () => {
    setDrains(prev => prev.map(d => ({
      ...d,
      simulatedBlockage: false,
      persistentAbnormalCycles: 0,
      clearanceStatus: 'clear',
      riskLevel: 'low',
      drainageEfficiencyPercent: 96,
      waterTrend: 'falling',
    })));
    setAlerts(prev => prev.map(a => ({ ...a, status: 'resolved' })));
  };

  const updateThresholds = (newSettings: Partial<ThresholdSettings>) => {
    setThresholds(prev => ({ ...prev, ...newSettings }));
  };

  const createWorkOrderFromAlert = (
    alertId: string, 
    assignedCrew: string, 
    priority: WorkOrder['priority'] = 'high'
  ) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    const newOrder: WorkOrder = {
      id: `WO-${Math.floor(800 + Math.random() * 200)}`,
      drainId: alert.drainId,
      drainName: alert.drainName,
      street: alert.street,
      zone: alert.zone,
      severity: alert.severity,
      status: 'assigned',
      createdAt: 'Just now',
      assignedCrew,
      priority,
      estimatedArrival: 'ETA 8 mins',
      actionRequired: alert.recommendedAction,
      notes: [
        `Dispatched from Alert ${alert.id} by municipal operator.`,
        `Assigned to ${assignedCrew}. En route.`
      ],
      alertId: alert.id,
    };

    setWorkOrders(prev => [newOrder, ...prev]);
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'in_progress', workOrderId: newOrder.id } : a));
  };

  const updateWorkOrderStatus = (workOrderId: string, status: MaintenanceStatus, note?: string) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === workOrderId) {
        const updatedNotes = note ? [...wo.notes, note] : wo.notes;
        const resolvedAt = status === 'resolved' ? 'Just now' : wo.resolvedAt;

        // If marked resolved, automatically clear the associated drain blockage!
        if (status === 'resolved') {
          setDrains(currentDrains => currentDrains.map(d => {
            if (d.id === wo.drainId) {
              return {
                ...d,
                simulatedBlockage: false,
                persistentAbnormalCycles: 0,
                clearanceStatus: 'clear',
                riskLevel: 'low',
                drainageEfficiencyPercent: 96,
                waterTrend: 'falling',
                currentWaterLevelCm: Math.round(d.maxDepthCm * 0.3),
                capacityPercent: 30,
              };
            }
            return d;
          }));

          // Mark corresponding alert resolved
          if (wo.alertId) {
            setAlerts(curAlerts => curAlerts.map(a => a.id === wo.alertId ? { ...a, status: 'resolved' } : a));
          }
        }

        return {
          ...wo,
          status,
          notes: updatedNotes,
          resolvedAt
        };
      }
      return wo;
    }));
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a));
  };

  return (
    <DrainContext.Provider value={{
      drains,
      alerts,
      workOrders,
      selectedDrain,
      weather,
      thresholds,
      simulationPreset,
      isSimulationRunning,
      simulationSpeed,
      lastUpdatedTimestamp,
      theme,
      searchQuery,
      filterZone,
      filterRisk,
      filterStatus,
      sortBy,
      activeView,
      activeTab,
      setTheme,
      toggleTheme,
      setSearchQuery,
      setFilterZone,
      setFilterRisk,
      setFilterStatus,
      setSortBy,
      setActiveView,
      setActiveTab,
      setSelectedDrainId,
      toggleSimulation,
      setSimulationSpeed,
      applyScenario,
      toggleDrainBlockage,
      clearAllBlockages,
      updateThresholds,
      createWorkOrderFromAlert,
      updateWorkOrderStatus,
      acknowledgeAlert,
      triggerManualReadingCycle,
    }}>
      {children}
    </DrainContext.Provider>
  );
};

export const useDrainSystem = () => {
  const context = useContext(DrainContext);
  if (!context) {
    throw new Error('useDrainSystem must be used within a DrainProvider');
  }
  return context;
};
