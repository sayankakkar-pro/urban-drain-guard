import React, { useState } from 'react';
import { X, Sliders, ShieldAlert, Check, RefreshCw, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useDrainSystem } from '../context/DrainContext';
import { ThresholdSettings } from '../types/drain';

interface ThresholdConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThresholdConfigModal: React.FC<ThresholdConfigModalProps> = ({ isOpen, onClose }) => {
  const { thresholds, updateThresholds } = useDrainSystem();

  const [formValues, setFormValues] = useState<ThresholdSettings>(thresholds);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    updateThresholds(formValues);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    const defaultVals: ThresholdSettings = {
      warningCapacityPercent: 60,
      criticalCapacityPercent: 82,
      suspectedPersistenceCycles: 3,
      confirmedPersistenceCycles: 5,
      flowEfficiencyDeficitPercent: 45,
    };
    setFormValues(defaultVals);
    updateThresholds(defaultVals);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="glass-panel-glow w-full max-w-lg rounded-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700/80 shadow-2xl text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Configurable Alert Logic & Thresholds</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Autonomous blockage detection & persistence sensitivity</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sliders Form */}
        <div className="p-6 space-y-5 text-xs overflow-y-auto">
          {/* Explanation Box */}
          <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
            <strong className="text-brand-700 dark:text-brand-300 block font-bold">How the Classification Matrix Works:</strong>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              • <strong>Suspected Blockage:</strong> Triggered when water capacity exceeds warning threshold OR flow velocity falls below efficiency deficit for consecutive cycles during runoff.<br/>
              • <strong>Confirmed Blockage:</strong> Triggered when capacity exceeds critical threshold OR an abnormal water surcharge persists for the configured persistence cycles without gravitational recession.
            </p>
          </div>

          {/* 1. Warning Capacity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Warning Capacity Level (%):</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">{formValues.warningCapacityPercent}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="75"
              step="1"
              value={formValues.warningCapacityPercent}
              onChange={(e) => setFormValues({ ...formValues, warningCapacityPercent: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 dark:text-slate-500 block">Baseline warning for elevated water in conduit.</span>
          </div>

          {/* 2. Critical Capacity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Critical Overflow Threat (%):</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">{formValues.criticalCapacityPercent}%</span>
            </div>
            <input
              type="range"
              min="70"
              max="95"
              step="1"
              value={formValues.criticalCapacityPercent}
              onChange={(e) => setFormValues({ ...formValues, criticalCapacityPercent: Number(e.target.value) })}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 dark:text-slate-500 block">Immediate risk of surface water flooding onto street level.</span>
          </div>

          {/* 3. Suspected Persistence Cycles */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Suspected Obstruction Persistence:</span>
              <span className="font-mono font-bold text-orange-600 dark:text-orange-400 text-sm">{formValues.suspectedPersistenceCycles} cycles</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              step="1"
              value={formValues.suspectedPersistenceCycles}
              onChange={(e) => setFormValues({ ...formValues, suspectedPersistenceCycles: Number(e.target.value) })}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 dark:text-slate-500 block">Consecutive abnormal readings required before raising suspected alarm.</span>
          </div>

          {/* 4. Confirmed Persistence Cycles */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Confirmed Blockage Persistence:</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-500 text-sm">{formValues.confirmedPersistenceCycles} cycles</span>
            </div>
            <input
              type="range"
              min="3"
              max="10"
              step="1"
              value={formValues.confirmedPersistenceCycles}
              onChange={(e) => setFormValues({ ...formValues, confirmedPersistenceCycles: Number(e.target.value) })}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 dark:text-slate-500 block">Persistent duration needed to confirm complete debris choke.</span>
          </div>

          {/* 5. Flow Efficiency Deficit */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Flow Discharge Deficit (%):</span>
              <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-sm">{formValues.flowEfficiencyDeficitPercent}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="60"
              step="5"
              value={formValues.flowEfficiencyDeficitPercent}
              onChange={(e) => setFormValues({ ...formValues, flowEfficiencyDeficitPercent: Number(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 dark:text-slate-500 block">Velocity restriction threshold comparing outflow against rain volume.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center space-x-1 font-medium"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-brand-600/20 flex items-center space-x-1"
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5 text-white" /> : null}
              <span>{savedSuccess ? 'Thresholds Applied!' : 'Save Thresholds'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
