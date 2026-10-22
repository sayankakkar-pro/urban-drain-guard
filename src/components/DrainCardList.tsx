import React from 'react';
import { Search, Filter, ArrowUpDown, X, Droplet, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useDrainSystem } from '../context/DrainContext';
import { DrainCard } from './DrainCard';

export const DrainCardList: React.FC = () => {
  const {
    drains,
    searchQuery,
    setSearchQuery,
    filterZone,
    setFilterZone,
    filterRisk,
    setFilterRisk,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy
  } = useDrainSystem();

  // Filter & Search Logic
  const filteredDrains = drains
    .filter((drain) => {
      // Search matching
      const matchesSearch =
        searchQuery === '' ||
        drain.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drain.street.toLowerCase().includes(searchQuery.toLowerCase());

      // Zone filter
      const matchesZone = filterZone === 'all' || drain.zone === filterZone;

      // Risk filter
      const matchesRisk =
        filterRisk === 'all' ||
        (filterRisk === 'normal' && drain.riskLevel === 'low') ||
        (filterRisk === 'warning' && drain.riskLevel === 'moderate') ||
        (filterRisk === 'suspected' && drain.clearanceStatus === 'suspected_blockage') ||
        (filterRisk === 'critical' && (drain.riskLevel === 'critical' || drain.clearanceStatus === 'confirmed_blockage'));

      // Status filter
      const matchesStatus = filterStatus === 'all' || drain.clearanceStatus === filterStatus;

      return matchesSearch && matchesZone && matchesRisk && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'risk') {
        const riskOrder = { critical: 4, high: 3, moderate: 2, low: 1 };
        return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
      }
      if (sortBy === 'water_level') {
        return b.currentWaterLevelCm - a.currentWaterLevelCm;
      }
      if (sortBy === 'capacity') {
        return b.capacityPercent - a.capacityPercent;
      }
      return a.id.localeCompare(b.id);
    });

  const clearFilters = () => {
    setSearchQuery('');
    setFilterZone('all');
    setFilterRisk('all');
    setFilterStatus('all');
  };

  const hasActiveFilters = searchQuery !== '' || filterZone !== 'all' || filterRisk !== 'all' || filterStatus !== 'all';

  return (
    <div className="space-y-4">
      {/* Search, Filter & Sort Toolbar */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Search input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, street name, or landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Zone filter */}
          <select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            aria-label="Filter by Catchment Zone"
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 font-medium"
          >
            <option value="all">All Catchment Zones</option>
            <option value="Downtown Core">Downtown Core</option>
            <option value="North Catchment">North Catchment</option>
            <option value="Industrial Canal">Industrial Canal</option>
            <option value="Harborfront">Harborfront</option>
          </select>

          {/* Risk Level filter */}
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            aria-label="Filter by Risk & Clearance"
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 font-medium"
          >
            <option value="all">All Risk Levels</option>
            <option value="normal">Normal (Free Flow)</option>
            <option value="warning">Moderate Water</option>
            <option value="suspected">Suspected Blockage</option>
            <option value="critical">Critical / Confirmed</option>
          </select>

          {/* Sort selector */}
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 px-2 py-1 rounded-lg">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort Drains"
              className="bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none font-medium"
            >
              <option value="risk" className="bg-white dark:bg-slate-900">Highest Risk First</option>
              <option value="capacity" className="bg-white dark:bg-slate-900">Highest Surcharge %</option>
              <option value="water_level" className="bg-white dark:bg-slate-900">Depth (cm)</option>
              <option value="name" className="bg-white dark:bg-slate-900">Drain ID (A-Z)</option>
            </select>
          </div>

          {/* Clear filters pill */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-colors flex items-center space-x-1"
            >
              <X className="w-3 h-3 text-slate-500" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          Showing <strong className="text-slate-900 dark:text-white font-bold">{filteredDrains.length}</strong> of {drains.length} monitored storm drain points
        </span>
        <div className="flex items-center space-x-3 text-[11px] font-medium">
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
            Clear: {drains.filter(d => d.clearanceStatus === 'clear').length}
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-orange-500 mr-1.5"></span>
            Suspected: {drains.filter(d => d.clearanceStatus === 'suspected_blockage').length}
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5 animate-pulse"></span>
            Confirmed: {drains.filter(d => d.clearanceStatus === 'confirmed_blockage').length}
          </span>
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredDrains.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDrains.map((drain) => (
            <DrainCard key={drain.id} drain={drain} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No Matching Inlets Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            No storm drain locations matched your current search query "{searchQuery}" or filter combination.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            Clear Search & Filters
          </button>
        </div>
      )}
    </div>
  );
};
