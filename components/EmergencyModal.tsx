import React from 'react';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmKillSwitch: () => void;
}

export function EmergencyModal({ isOpen, onClose, onConfirmKillSwitch }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-sm grid place-items-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-slate-900 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-400 grid place-items-center"><ShieldAlert className="h-6 w-6" /></div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X className="h-5 w-5" /></button>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Emergency kill switch</h2>
          <p className="mt-2 text-xs leading-5 text-slate-300">The system enters EMERGENCY_STOP, blocks new entries, disarms live trading, and attempts to close every open Deriv contract at market.</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300 flex gap-2"><AlertTriangle className="h-4 w-4 shrink-0" /> Broker failures remain visible in the audit log.</div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold">Cancel</button>
          <button onClick={onConfirmKillSwitch} className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold">Confirm kill switch</button>
        </div>
      </div>
    </div>
  );
}
