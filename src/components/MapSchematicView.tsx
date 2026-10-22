import React, { useEffect, useState, useMemo } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  Circle, 
  Polygon, 
  Tooltip,
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Map as MapIcon, 
  GitFork, 
  Maximize2, 
  Minimize2,
  Layers, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  Info,
  Waves,
  Crosshair,
  Compass,
  Eye,
  EyeOff,
  Navigation,
  Globe
} from 'lucide-react';
import { useDrainSystem } from '../context/DrainContext';
import { DrainNode } from '../types/drain';

// Camera controller helper
const MapCameraController: React.FC<{ 
  targetCoords: [number, number] | null; 
  zoomLevel: number;
  fitBoundsCoords?: [number, number][];
}> = ({ targetCoords, zoomLevel, fitBoundsCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (fitBoundsCoords && fitBoundsCoords.length > 0) {
      const bounds = L.latLngBounds(fitBoundsCoords.map(c => L.latLng(c[0], c[1])));
      map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.2 });
    } else if (targetCoords) {
      map.flyTo(targetCoords, zoomLevel, { animate: true, duration: 1.2 });
    }
  }, [targetCoords, zoomLevel, fitBoundsCoords, map]);

  return null;
};

// Create custom pulsating SVG marker icon
const createMarkerIcon = (drain: DrainNode, isDark: boolean, isSelected: boolean) => {
  let color = '#10b981'; // green
  let pulseColor = 'rgba(16, 185, 129, 0.4)';
  let label = 'OK';

  if (drain.clearanceStatus === 'confirmed_blockage') {
    color = '#ef4444'; // red
    pulseColor = 'rgba(239, 68, 68, 0.6)';
    label = '!';
  } else if (drain.clearanceStatus === 'suspected_blockage') {
    color = '#f97316'; // orange
    pulseColor = 'rgba(249, 115, 22, 0.5)';
    label = '⚠';
  } else if (drain.riskLevel === 'moderate') {
    color = '#f59e0b'; // amber
    pulseColor = 'rgba(245, 158, 11, 0.4)';
    label = '▲';
  }

  const borderStroke = isSelected ? '#38bdf8' : (isDark ? '#0f172a' : '#ffffff');
  const size = isSelected ? 38 : 32;

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
      <div style="
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: ${pulseColor};
        animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        position: relative;
        width: ${size - 8}px;
        height: ${size - 8}px;
        border-radius: 50%;
        background-color: ${color};
        border: ${isSelected ? '3px' : '2.5px'} solid ${borderStroke};
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${isSelected ? '12px' : '10px'};
        font-family: monospace;
      ">
        ${label}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-drain-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });
};

type TileStyle = 'default' | 'satellite' | 'street' | 'dark';

export const MapSchematicView: React.FC = () => {
  const { 
    drains, 
    selectedDrain, 
    activeView, 
    theme,
    setActiveView, 
    setSelectedDrainId,
    toggleDrainBlockage 
  } = useDrainSystem();

  const isDark = theme === 'dark';

  // Map settings
  const [tileStyle, setTileStyle] = useState<TileStyle>('default');
  const [showPipes, setShowPipes] = useState<boolean>(true);
  const [showFloodZones, setShowFloodZones] = useState<boolean>(true);
  const [showBasins, setShowBasins] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [cameraTarget, setCameraTarget] = useState<[number, number] | null>(null);
  const [cameraZoom, setCameraZoom] = useState<number>(14);
  const [fitBoundsData, setFitBoundsData] = useState<[number, number][] | undefined>(undefined);

  // Sync camera when a drain is selected in context
  useEffect(() => {
    if (selectedDrain) {
      setCameraTarget([selectedDrain.coordinates.lat, selectedDrain.coordinates.lng]);
      setCameraZoom(15);
      setFitBoundsData(undefined);
    }
  }, [selectedDrain]);

  // Determine active tile layer URL (100% open, NO API KEY NEEDED)
  const activeTileUrl = useMemo(() => {
    switch (tileStyle) {
      case 'satellite':
        // High-resolution Esri World Imagery (Completely free, no token required)
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'street':
        // Detailed Voyager street map with building footprints & hydrology
        return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      case 'dark':
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      default:
        // Default follows theme: Positron (light) or DarkMatter (dark)
        return isDark
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    }
  }, [tileStyle, isDark]);

  // Underground stormwater conduits (real geographical pipe segments connecting the drains)
  const pipeConduits = useMemo(() => {
    const pipes: Array<{
      id: string;
      from: DrainNode;
      to: DrainNode;
      isBlocked: boolean;
      diameterMm: number;
    }> = [];

    drains.forEach((source) => {
      (source.schematicCoords.connectedTo || []).forEach((targetId) => {
        const target = drains.find(d => d.id === targetId);
        if (target) {
          pipes.push({
            id: `${source.id}-${target.id}`,
            from: source,
            to: target,
            isBlocked: source.simulatedBlockage || target.simulatedBlockage,
            diameterMm: Math.min(source.pipeDiameterMm, target.pipeDiameterMm)
          });
        }
      });
    });

    return pipes;
  }, [drains]);

  // Catchment Basin Polygons (Zonal Boundaries in Municipal Coordinates)
  const catchmentBasins = [
    {
      name: 'North Catchment Basin',
      zone: 'North Catchment',
      color: '#10b981',
      coords: [
        [37.8040, -122.4340],
        [37.8040, -122.4080],
        [37.7890, -122.4120],
        [37.7890, -122.4340]
      ] as [number, number][],
      desc: 'Steep hill terrain; high velocity surface runoff collector.'
    },
    {
      name: 'Downtown Core Catchment',
      zone: 'Downtown Core',
      color: '#0284c7',
      coords: [
        [37.7890, -122.4340],
        [37.7890, -122.4120],
        [37.7710, -122.4150],
        [37.7710, -122.4340]
      ] as [number, number][],
      desc: 'Dense commercial pavement; vulnerable to curb grate clutter.'
    },
    {
      name: 'Industrial Canal Catchment',
      zone: 'Industrial Canal',
      color: '#8b5cf6',
      coords: [
        [37.7750, -122.4120],
        [37.7750, -122.3920],
        [37.7590, -122.3920],
        [37.7590, -122.4120]
      ] as [number, number][],
      desc: 'Heavy silt, gravel, and sediment accumulation corridor.'
    },
    {
      name: 'Harborfront Interceptor Basin',
      zone: 'Harborfront',
      color: '#06b6d4',
      coords: [
        [37.7980, -122.4080],
        [37.7980, -122.3840],
        [37.7750, -122.3840],
        [37.7750, -122.4080]
      ] as [number, number][],
      desc: 'Main gravity discharge interceptor outfalling to tidal bay.'
    }
  ];

  // Fly to Critical Blockage
  const focusCriticalBlockage = () => {
    const critical = drains.find(d => d.clearanceStatus === 'confirmed_blockage') ||
                     drains.find(d => d.clearanceStatus === 'suspected_blockage') ||
                     drains[0];
    if (critical) {
      setSelectedDrainId(critical.id);
      setCameraTarget([critical.coordinates.lat, critical.coordinates.lng]);
      setCameraZoom(16);
      setFitBoundsData(undefined);
    }
  };

  // Fit Whole City
  const fitWholeCity = () => {
    const allCoords = drains.map(d => [d.coordinates.lat, d.coordinates.lng] as [number, number]);
    setFitBoundsData(allCoords);
    setCameraTarget(null);
  };

  return (
    <div className={`glass-panel rounded-2xl border border-slate-200/90 dark:border-slate-800/80 overflow-hidden shadow-xl flex flex-col transition-all duration-300 ${
      isExpanded ? 'h-[720px]' : 'h-[520px]'
    }`}>
      {/* Top View Header & Navigation Toolbar */}
      <div className="px-4 py-2.5 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            {activeView === 'map' ? <MapIcon className="w-4 h-4" /> : <GitFork className="w-4 h-4" />}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>{activeView === 'map' ? 'Municipal GIS Hydrodynamic Mapping' : 'Topological Pipe Flow Network'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold">
                12 Nodes Active
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {activeView === 'map' 
                ? 'High-density GIS telemetry with underground conduits, flood inundation hazard buffers, and aerial imagery' 
                : 'Hydraulic flow topology showing stormwater routing & backpressure accumulation'}
            </p>
          </div>
        </div>

        {/* View Switcher & Map Tools */}
        <div className="flex items-center space-x-2">
          {/* Quick Action: Focus Critical Drain */}
          {activeView === 'map' && (
            <button
              onClick={focusCriticalBlockage}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40 transition-colors shadow-2xs"
              title="Fly to active blockage"
            >
              <Crosshair className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span className="hidden sm:inline">Focus Alert</span>
            </button>
          )}

          {/* Quick Action: Fit Whole City */}
          {activeView === 'map' && (
            <button
              onClick={fitWholeCity}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Fit entire city catchment in view"
            >
              <Navigation className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Height Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            title={isExpanded ? 'Collapse Map' : 'Expand Fullscreen Height'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* View Switcher Pill */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveView('map')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'map'
                  ? 'bg-brand-600 dark:bg-brand-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>GIS Map</span>
            </button>

            <button
              onClick={() => setActiveView('schematic')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'schematic'
                  ? 'bg-brand-600 dark:bg-brand-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Schematic</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      <div className="relative flex-1 bg-slate-50 dark:bg-slate-950">
        {activeView === 'map' ? (
          /* LEAFLET GEOSPATIAL MAP */
          <div className="w-full h-full relative">
            <MapContainer
              key={`${theme}-${tileStyle}`} // Smoothly re-render layer when user switches
              center={[37.7825, -122.4110]}
              zoom={13}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
              attributionControl={false}
            >
              {/* TileLayer: Always open, NO API KEY NEEDED */}
              <TileLayer
                url={activeTileUrl}
                maxZoom={19}
              />
              
              <MapCameraController 
                targetCoords={cameraTarget} 
                zoomLevel={cameraZoom} 
                fitBoundsCoords={fitBoundsData}
              />

              {/* 1. Catchment Basin Overlays */}
              {showBasins && catchmentBasins.map((basin) => (
                <Polygon
                  key={basin.name}
                  positions={basin.coords}
                  pathOptions={{
                    color: basin.color,
                    weight: 1.5,
                    dashArray: '5 5',
                    fillColor: basin.color,
                    fillOpacity: tileStyle === 'satellite' ? 0.15 : (isDark ? 0.08 : 0.05),
                  }}
                >
                  <Tooltip sticky>
                    <div className="text-xs">
                      <strong>{basin.name}</strong>
                      <p className="text-[10px] text-slate-500">{basin.desc}</p>
                    </div>
                  </Tooltip>
                </Polygon>
              ))}

              {/* 2. Stormwater Underground Pipe Conduits (Polylines) */}
              {showPipes && pipeConduits.map((pipe) => {
                const strokeColor = pipe.isBlocked 
                  ? '#ef4444' 
                  : (tileStyle === 'satellite' ? '#38bdf8' : (isDark ? '#0ea5e9' : '#0284c7'));
                const strokeWeight = Math.max(3, Math.round(pipe.diameterMm / 200));

                return (
                  <Polyline
                    key={pipe.id}
                    positions={[
                      [pipe.from.coordinates.lat, pipe.from.coordinates.lng],
                      [pipe.to.coordinates.lat, pipe.to.coordinates.lng],
                    ]}
                    pathOptions={{
                      color: strokeColor,
                      weight: strokeWeight,
                      dashArray: pipe.isBlocked ? '8 6' : '6 4',
                      opacity: pipe.isBlocked ? 0.9 : 0.75,
                    }}
                  >
                    <Tooltip sticky>
                      <div className="text-xs space-y-0.5">
                        <strong className="text-brand-600 dark:text-brand-400 block font-mono">
                          Conduit: {pipe.from.id} ➔ {pipe.to.id}
                        </strong>
                        <div className="text-[11px] text-slate-600 dark:text-slate-300">
                          Diameter: <strong>Ø {pipe.diameterMm} mm</strong> Reinforced Concrete
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-300">
                          Status: <strong className={pipe.isBlocked ? 'text-rose-500' : 'text-emerald-500'}>
                            {pipe.isBlocked ? '⚠️ Hydraulic Backpressure Stagnation' : '✓ Gravity Discharge Active'}
                          </strong>
                        </div>
                      </div>
                    </Tooltip>
                  </Polyline>
                );
              })}

              {/* 3. Flood Inundation Hazard Zones (Pulsating Radius around Blocked Drains) */}
              {showFloodZones && drains.filter(d => d.clearanceStatus !== 'clear').map((drain) => {
                const isCrit = drain.clearanceStatus === 'confirmed_blockage';
                const radiusMeters = isCrit ? 140 : 80;
                const zoneColor = isCrit ? '#ef4444' : '#f97316';

                return (
                  <Circle
                    key={`flood-${drain.id}`}
                    center={[drain.coordinates.lat, drain.coordinates.lng]}
                    radius={radiusMeters}
                    pathOptions={{
                      color: zoneColor,
                      weight: 2,
                      fillColor: zoneColor,
                      fillOpacity: isCrit ? 0.28 : 0.18,
                      dashArray: '4 4'
                    }}
                  >
                    <Tooltip sticky>
                      <div className="text-xs space-y-1">
                        <strong className="text-rose-600 dark:text-rose-400 flex items-center font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1 inline" />
                          {isCrit ? 'Critical Inundation Hazard Zone' : 'Curb Surface Water Pooling Risk'}
                        </strong>
                        <p className="text-[10px] text-slate-600 dark:text-slate-300">
                          Estimated {radiusMeters}m street flood spread radius around <strong>{drain.name}</strong> due to zero outflow discharge.
                        </p>
                      </div>
                    </Tooltip>
                  </Circle>
                );
              })}

              {/* 4. Drain Markers */}
              {drains.map((drain) => (
                <Marker
                  key={drain.id}
                  position={[drain.coordinates.lat, drain.coordinates.lng]}
                  icon={createMarkerIcon(drain, isDark, selectedDrain?.id === drain.id)}
                  eventHandlers={{
                    click: () => setSelectedDrainId(drain.id)
                  }}
                >
                  <Popup>
                    <div className="p-1 min-w-[210px] text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 pb-1.5 mb-2">
                        <span className="font-mono font-bold text-brand-700 dark:text-brand-300">{drain.id}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          drain.clearanceStatus === 'confirmed_blockage' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300' :
                          drain.clearanceStatus === 'suspected_blockage' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300' :
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                        }`}>
                          {drain.clearanceStatus.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{drain.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">{drain.street}</div>
                      
                      <div className="grid grid-cols-2 gap-1.5 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 mb-2">
                        <div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Water Depth</span>
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{drain.currentWaterLevelCm} cm</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Capacity</span>
                          <span className={`font-bold text-sm ${
                            drain.capacityPercent > 80 ? 'text-rose-600 dark:text-rose-400' :
                            drain.capacityPercent > 60 ? 'text-amber-600 dark:text-amber-400' :
                            'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {drain.capacityPercent}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Velocity</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{drain.flowVelocityMs} m/s</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Efficiency</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{drain.drainageEfficiencyPercent}%</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setSelectedDrainId(drain.id)}
                          className="flex-1 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-semibold text-[11px] transition-colors shadow-xs"
                        >
                          Inspect Telemetry
                        </button>
                        <button
                          onClick={() => toggleDrainBlockage(drain.id)}
                          className={`px-2 py-1.5 rounded-lg font-semibold text-[11px] border transition-colors ${
                            drain.simulatedBlockage
                              ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40'
                              : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {drain.simulatedBlockage ? 'Unclog' : 'Clog'}
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Floating Map Controls Overlay (Top-Right) */}
            <div className="absolute top-3 right-3 z-[1000] flex flex-col space-y-2">
              {/* Base Layer Picker */}
              <div className="glass-panel p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg flex items-center space-x-1 text-xs">
                <button
                  onClick={() => setTileStyle('default')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    tileStyle === 'default' 
                      ? 'bg-brand-600 text-white shadow-xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Default Theme Map (CartoDB)"
                >
                  {isDark ? 'Dark' : 'Light'}
                </button>

                <button
                  onClick={() => setTileStyle('satellite')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    tileStyle === 'satellite' 
                      ? 'bg-brand-600 text-white shadow-xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Esri World Satellite Imagery (Zero Keys Needed)"
                >
                  🛰️ Satellite
                </button>

                <button
                  onClick={() => setTileStyle('street')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    tileStyle === 'street' 
                      ? 'bg-brand-600 text-white shadow-xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Voyager Street & Waterways"
                >
                  🗺️ Street
                </button>
              </div>

              {/* Layer Toggles Pill */}
              <div className="glass-panel p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-1.5 text-[11px]">
                <span className="font-bold text-slate-800 dark:text-slate-300 block text-[10px] uppercase tracking-wider mb-1">
                  GIS Layer Overlays
                </span>

                <label className="flex items-center space-x-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                  <input
                    type="checkbox"
                    checked={showPipes}
                    onChange={(e) => setShowPipes(e.target.checked)}
                    className="accent-brand-600 rounded"
                  />
                  <span>Storm Pipes (Conduits)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                  <input
                    type="checkbox"
                    checked={showFloodZones}
                    onChange={(e) => setShowFloodZones(e.target.checked)}
                    className="accent-rose-500 rounded"
                  />
                  <span>Flood Threat Buffers</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                  <input
                    type="checkbox"
                    checked={showBasins}
                    onChange={(e) => setShowBasins(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  <span>Catchment Basins</span>
                </label>
              </div>
            </div>

            {/* Map Legend Overlay (Bottom-Left) */}
            <div className="absolute bottom-4 left-4 z-[1000] glass-panel p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/90 text-[11px] space-y-1.5 shadow-lg">
              <span className="font-bold text-slate-800 dark:text-slate-300 block text-[10px] uppercase tracking-wider mb-1">
                Sensor Clearance & Conduits
              </span>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Normal / Free Flow</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Elevated Water Level</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Suspected Obstruction</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-slate-900 dark:text-slate-100 font-bold">Confirmed Blockage</span>
              </div>
              <div className="pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2 text-[10px] text-slate-500">
                <span className="w-4 h-0.5 bg-sky-500"></span>
                <span>Active Underground Pipe</span>
              </div>
            </div>
          </div>
        ) : (
          /* TOPOLOGICAL HYDRAULIC SCHEMATIC VIEW */
          <div className="w-full h-full relative overflow-auto p-4 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <svg 
              className="w-full h-full min-w-[700px] min-h-[440px]" 
              viewBox="0 0 1000 500"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Flow line gradient */}
                <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity={isDark ? '0.4' : '0.6'} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={isDark ? '0.9' : '1'} />
                </linearGradient>
                <linearGradient id="blockedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.6" />
                </linearGradient>
                {/* Marker arrow */}
                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={isDark ? '#38bdf8' : '#0284c7'} opacity="0.8" />
                </marker>
              </defs>

              {/* Catchment Zone Boundaries (Dotted Boxes) */}
              <rect x="50" y="30" width="420" height="200" rx="12" 
                    fill={isDark ? "rgba(14, 165, 233, 0.02)" : "rgba(14, 165, 233, 0.04)"} 
                    stroke={isDark ? "#1e293b" : "#cbd5e1"} strokeDasharray="4 4" />
              <text x="65" y="55" fill={isDark ? "#64748b" : "#475569"} fontSize="11" fontWeight="bold" fontFamily="monospace">ZONE 1: NORTH CATCHMENT</text>

              <rect x="50" y="250" width="420" height="220" rx="12" 
                    fill={isDark ? "rgba(14, 165, 233, 0.02)" : "rgba(14, 165, 233, 0.04)"} 
                    stroke={isDark ? "#1e293b" : "#cbd5e1"} strokeDasharray="4 4" />
              <text x="65" y="275" fill={isDark ? "#64748b" : "#475569"} fontSize="11" fontWeight="bold" fontFamily="monospace">ZONE 2: DOWNTOWN CORE</text>

              <rect x="500" y="30" width="450" height="200" rx="12" 
                    fill={isDark ? "rgba(14, 165, 233, 0.02)" : "rgba(14, 165, 233, 0.04)"} 
                    stroke={isDark ? "#1e293b" : "#cbd5e1"} strokeDasharray="4 4" />
              <text x="515" y="55" fill={isDark ? "#64748b" : "#475569"} fontSize="11" fontWeight="bold" fontFamily="monospace">ZONE 3: INDUSTRIAL CANAL</text>

              <rect x="500" y="250" width="450" height="220" rx="12" 
                    fill={isDark ? "rgba(14, 165, 233, 0.02)" : "rgba(14, 165, 233, 0.04)"} 
                    stroke={isDark ? "#1e293b" : "#cbd5e1"} strokeDasharray="4 4" />
              <text x="515" y="275" fill={isDark ? "#64748b" : "#475569"} fontSize="11" fontWeight="bold" fontFamily="monospace">ZONE 4: HARBORFRONT & MARINE OUTFALL</text>

              {/* Pipe Connections & Flow Lines */}
              {drains.map((drain) => {
                const startX = (drain.schematicCoords.x / 100) * 1000;
                const startY = (drain.schematicCoords.y / 100) * 500;
                
                return (drain.schematicCoords.connectedTo || []).map((targetId) => {
                  const target = drains.find(d => d.id === targetId);
                  if (!target) return null;

                  const targetX = (target.schematicCoords.x / 100) * 1000;
                  const targetY = (target.schematicCoords.y / 100) * 500;
                  const isBlockedPath = drain.simulatedBlockage || target.simulatedBlockage;

                  return (
                    <g key={`${drain.id}-${target.id}`}>
                      {/* Base pipe line */}
                      <line
                        x1={startX}
                        y1={startY}
                        x2={targetX}
                        y2={targetY}
                        stroke={isBlockedPath ? 'url(#blockedGrad)' : 'url(#flowGrad)'}
                        strokeWidth={isBlockedPath ? 5 : 3.5}
                        strokeDasharray={isBlockedPath ? '6 4' : '8 6'}
                        className={isBlockedPath ? '' : 'animate-flow'}
                        markerEnd="url(#arrow)"
                      />
                    </g>
                  );
                });
              })}

              {/* Drain Nodes */}
              {drains.map((drain) => {
                const cx = (drain.schematicCoords.x / 100) * 1000;
                const cy = (drain.schematicCoords.y / 100) * 500;
                const isSelected = selectedDrain?.id === drain.id;
                
                let strokeColor = '#10b981';
                let fillColor = isDark ? '#064e3b' : '#d1fae5';
                let textColor = isDark ? 'white' : '#065f46';

                if (drain.clearanceStatus === 'confirmed_blockage') {
                  strokeColor = '#ef4444';
                  fillColor = isDark ? '#7f1d1d' : '#fee2e2';
                  textColor = isDark ? 'white' : '#991b1b';
                } else if (drain.clearanceStatus === 'suspected_blockage') {
                  strokeColor = '#f97316';
                  fillColor = isDark ? '#7c2d12' : '#ffedd5';
                  textColor = isDark ? 'white' : '#9a3412';
                } else if (drain.riskLevel === 'moderate') {
                  strokeColor = '#f59e0b';
                  fillColor = isDark ? '#78350f' : '#fef3c7';
                  textColor = isDark ? 'white' : '#92400e';
                }

                return (
                  <g 
                    key={drain.id} 
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => setSelectedDrainId(drain.id)}
                  >
                    {/* Pulsing ring for critical nodes */}
                    {drain.clearanceStatus === 'confirmed_blockage' && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="24"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        opacity="0.6"
                        className="animate-ping"
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 18 : 14}
                      fill={fillColor}
                      stroke={isSelected ? '#0284c7' : strokeColor}
                      strokeWidth={isSelected ? 3.5 : 2.5}
                    />

                    {/* Capacity Indicator inside node */}
                    <text
                      x={cx}
                      y={cy + 4}
                      textAnchor="middle"
                      fill={textColor}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {drain.capacityPercent}%
                    </text>

                    {/* Node Labels */}
                    <text
                      x={cx}
                      y={cy - 18}
                      textAnchor="middle"
                      fill={isDark ? "#e2e8f0" : "#1e293b"}
                      fontSize="10"
                      fontWeight="700"
                    >
                      {drain.id}
                    </text>
                    <text
                      x={cx}
                      y={cy + 24}
                      textAnchor="middle"
                      fill={isDark ? "#94a3b8" : "#64748b"}
                      fontSize="9"
                      fontWeight="500"
                    >
                      {drain.name.length > 18 ? drain.name.substring(0, 16) + '...' : drain.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Schematic Legend overlay */}
            <div className="absolute top-4 left-4 glass-panel p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 text-[11px] shadow-md">
              <span className="font-bold text-slate-800 dark:text-slate-300 block text-[10px] uppercase tracking-wider mb-1">
                Hydraulic Flow Network
              </span>
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-medium">
                <span className="w-5 h-1 bg-sky-500 rounded-full"></span>
                <span>Active Gravity Discharge</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-medium">
                <span className="w-5 h-1 bg-rose-500 rounded-full"></span>
                <span>Clogged / Backpressure Stoppage</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Tip: Click any node to inspect manhole depth & telemetry.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
