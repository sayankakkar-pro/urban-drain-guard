# 🌊 DrainWatch IoT — Urban Storm Drain Blockage Early Warning System

> **Competition-Ready Smart City Operations Dashboard**  
> Proactive blockage detection and flood prevention before street inundation occurs. Built with **React 18**, **TypeScript**, **Tailwind CSS**, **Leaflet GIS**, **Recharts**, and an autonomous hydrodynamic simulation engine.

[![Vercel Ready](https://img.shields.io/badge/Vercel-Deployable-black?style=flat&logo=vercel)](https://vercel.com)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.2-blue?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![React 18](https://img.shields.io/badge/React-18.2-61dafb?style=flat&logo=react)](https://react.dev)

---

## 🎯 Project Goal & Problem Statement

Urban flash flooding is often **not caused by insufficient trunk sewer capacity**, but by localized, invisible surface intake chokepoints:
- 80% of urban flooding initiates at curb grates, trash racks, and catch basins blocked by leaves, construction silt, and plastic debris.
- Traditional municipal systems are **reactive**: crews are dispatched only after citizen 911 calls report submerged vehicles and flooded basements.
- **DrainWatch IoT** flips this paradigm to **predictive early intervention**, continuously cross-referencing acoustic chamber depth, Doppler outflow velocities, and localized storm precipitation to identify clogged drains **before water breaches street level**.

---

## ⚡ Key Features

1. **Dashboard Overview**:
   - Live KPI cards: Total Monitored Inlets, Normal Free Flow, Suspected Flow Deficit, Confirmed Critical Alerts, and City-Wide Surcharge % with real-time discharge rates.
   - Dynamic weather & storm front telemetry (precipitation in mm/h, atmospheric pressure, and storm phase).

2. **Dual-Mode Interactive Visualizations**:
   - **Geospatial GIS Map**: Leaflet interactive dark-matter map with pulsating HTML SVG markers color-coded by status (Green = Normal, Amber = Elevated, Orange = Suspected, Red = Confirmed Blockage). Click to inspect chamber cross-section and telemetry.
   - **Topological Hydraulic Schematic**: Underground pipe flow network with animated water current vectors, showing upstream vs downstream pressure accumulation and backpressure gridlock.

3. **Individual Drain Sensor Cards**:
   - Gauged water depth (cm & % capacity) with animated vertical water tank graphic.
   - Dynamic trend indicator: ↗ Rising sharply, ↗ Rising, → Stable, ↘ Receding.
   - Clearance status badge: **Clear / Free Flow**, **Suspected Blockage**, **Confirmed Blockage**.
   - Discharge rate and outflow velocity (m/s).
   - Sensor health (battery %, LoRaWAN RSSI in dBm).
   - 1-Click Interactive Clog Injection button for live pitching.

4. **Autonomous Anomaly Detection Engine**:
   - **Normal Response**: High rain + High water + Fast outflow velocity = Heavy storm runoff, NOT blocked.
   - **Suspected Blockage**: High water depth + Low outflow velocity (< 40% nominal) + Disproportionate to rain.
   - **Confirmed Blockage**: Persistent abnormal water depth for $\ge 5$ consecutive cycles during runoff recession, confirming physical obstruction.

5. **Alert Center & Audit Trail**:
   - Actionable alert logs with exact anomaly descriptions, persistent cycle counts, and municipal action directives (e.g., *"Deploy Hydro-Jetting Truck Unit 4"*, *"Manual curb grate clearing"*).
   - 1-click crew dispatch and alert acknowledgment.

6. **Closed-Loop Maintenance Dispatch**:
   - Full municipal maintenance lifecycle: **Open ➔ Assigned ➔ In Progress ➔ Resolved**.
   - Crew assignment, ETA tracking, and chronological dispatch activity notes.
   - **Closed-Loop Verification**: Resolving a work order automatically restores nominal flow in the simulation engine, watching the live depth chart plunge back to safe levels.

7. **Hydraulic Analytics & Dual-Axis Hydrographs**:
   - City-wide surcharge bar chart across all 12 monitored conduits.
   - Side-by-side drain comparison tool superimposing clear vs blocked hydrographs against rainfall curves.

8. **Configurable Sensitivity Thresholds**:
   - Modal to adjust Warning Depth (%), Critical Depth (%), Suspected Persistence Cycles, Confirmed Persistence Cycles, and Flow Deficit % in real time.

9. **Pitch Deck & Screen Recording Guide**:
   - Built-in interactive 5-minute competition presenter remote with cues and 1-click trigger buttons.

10. **Demo Mode Transparency**:
    - High-visibility banner disclosing synthetic hydrodynamic simulation (no live municipal SCADA connectivity).

---

## 🏗️ Technical Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **GIS Mapping**: Leaflet 1.9, React-Leaflet
- **Analytics & Hydrographs**: Recharts ComposedChart (Dual-axis Area + Line)
- **Icons**: Lucide React
- **Build Tool**: Vite 5
- **Hosting Ready**: Vercel (`vercel.json` included)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js v20 LTS)
- npm 9+

### 1. Clone or Open Project
```bash
cd "C:\Users\sayan\.gemini\antigravity\scratch\urban-drain-guard"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```
Generates a static, minified bundle in the `dist/` directory.

---

## ☁️ Deploying to Vercel

### Option 1: Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option 2: GitHub / Vercel Web Dashboard
1. Push this folder to a GitHub repository.
2. In [Vercel](https://vercel.com), click **Add New Project** and select the repository.
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Click **Deploy**.

The included `vercel.json` file ensures client-side routing works seamlessly with single-page application rewrites.

---

## ⏱️ 5-Minute Competition Pitch Flow

1. **0:00 - 1:00 (The Silent Choke)**: Introduce the problem. Click **1. Clear** in the top banner to show nominal dry-weather baseline.
2. **1:00 - 2:15 (Hydrodynamic Telemetry)**: Switch to the **Network Schematic** tab. Point out gravity-fed stormwater flow lines and sewer outfalls.
3. **2:15 - 3:30 (Anomaly Detection)**: Click **3. Market Clog** in the top banner. Point out `DRN-101-MK`. Show how the system detects the flow velocity deficit (0.18 m/s) and escalates from Suspected to Confirmed Blockage.
4. **3:30 - 4:30 (Maintenance Dispatch)**: Navigate to **Maintenance Dispatch**. Assign *Hydro-Jetting Truck Unit 4* to the Market Square blockage.
5. **4:30 - 5:00 (Closing the Loop)**: Click **Mark Resolved & Verify Flow**. Watch the simulation engine clear the blockage, restore nominal outflow, and drop the water depth on the live chart.

---

## 📜 Disclaimer
This software is an innovation challenge demonstration. All sensor telemetry, weather feeds, and municipal dispatch logs are generated via a synthetic kinematic hydrodynamic model. No physical sensors or municipal SCADA infrastructure are connected.
