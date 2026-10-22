export type ClearanceStatus = 'clear' | 'suspected_blockage' | 'confirmed_blockage';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export type DrainType = 'curb_inlet' | 'culvert' | 'catch_basin' | 'trunk_junction' | 'outfall';

export type WaterTrend = 'rising_fast' | 'rising' | 'stable' | 'falling';

export interface SensorReading {
  timestamp: string;
  timeLabel: string;
  waterLevelCm: number;
  capacityPercent: number;
  flowVelocityMs: number;
  dischargeRateLs: number;
  rainfallMmH: number;
  predictedTrend?: number;
}

export interface DrainNode {
  id: string;
  name: string;
  street: string;
  zone: 'Downtown Core' | 'North Catchment' | 'Industrial Canal' | 'Harborfront';
  coordinates: {
    lat: number;
    lng: number;
  };
  schematicCoords: {
    x: number; // 0-100 percentage in schematic map
    y: number; // 0-100 percentage in schematic map
    connectedTo?: string[]; // IDs of downstream drains
  };
  type: DrainType;
  maxDepthCm: number;
  pipeDiameterMm: number;
  
  // Real-time Telemetry
  currentWaterLevelCm: number;
  capacityPercent: number;
  waterTrend: WaterTrend;
  clearanceStatus: ClearanceStatus;
  riskLevel: RiskLevel;
  flowVelocityMs: number;
  drainageEfficiencyPercent: number; // 100% = free flow, <40% = blocked
  persistentAbnormalCycles: number;
  
  // Hardware status
  batteryLevel: number;
  signalStrengthDbm: number;
  sensorHealth: 'optimal' | 'degraded' | 'check_required';
  lastUpdated: string;
  
  // Simulation overrides
  simulatedBlockage: boolean;
  history: SensorReading[];
}

export type AlertSeverity = 'warning' | 'suspected' | 'critical';

export interface AlertItem {
  id: string;
  drainId: string;
  drainName: string;
  zone: string;
  street: string;
  timestamp: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  waterLevelCm: number;
  capacityPercent: number;
  persistentCycles: number;
  recommendedAction: string;
  status: 'active' | 'acknowledged' | 'in_progress' | 'resolved';
  workOrderId?: string;
}

export type MaintenanceStatus = 'open' | 'assigned' | 'in_progress' | 'resolved';

export interface WorkOrder {
  id: string;
  drainId: string;
  drainName: string;
  street: string;
  zone: string;
  severity: AlertSeverity;
  status: MaintenanceStatus;
  createdAt: string;
  assignedCrew?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedArrival?: string;
  actionRequired: string;
  notes: string[];
  resolvedAt?: string;
  alertId?: string;
}

export interface ThresholdSettings {
  warningCapacityPercent: number;
  criticalCapacityPercent: number;
  suspectedPersistenceCycles: number;
  confirmedPersistenceCycles: number;
  flowEfficiencyDeficitPercent: number;
}

export type ThemeMode = 'light' | 'dark';

export type SimulationPreset = 
  | 'normal'           // Base dry / light runoff
  | 'flash_storm'      // Heavy rain, normal drainage
  | 'debris_surge'     // Moderate rain + Market / Canal blockage
  | 'severe_gridlock'; // Severe downpour + multiple critical blockages
