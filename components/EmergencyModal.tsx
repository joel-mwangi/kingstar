import React from 'react';
import { ShieldAlert, AlertTriangle, X } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmKillSwitch: () => void;
}

export function EmergencyModal({ isOpen, onClose, onConfirmKillSwitch }: EmergencyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-rose-950/50 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            EMERGENCY KILL SWITCH
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            This will immediately halt all automated bot sessions, cancel pending broker orders, liquidate all open positions at market price, and lock the account.
          </p>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center gap-3 text-rose-400 text-xs font-mono">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>Warning: This action cannot be undone automatically and incurs immediate market execution.</span>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirmKillSwitch();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all"
          >
            CONFIRM KILL SWITCH
          </button>
        </div>

      </div>
    </div>
  );
}
