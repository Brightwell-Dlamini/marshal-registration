import React from 'react';
import { MarshalRegistration } from '../types';
import { CheckCircle2, UserPlus, Eye, ShieldCheck, WifiOff, Wifi } from 'lucide-react';

interface SuccessModalProps {
  marshal: MarshalRegistration | null;
  onClose: () => void;
  onViewRecord: (marshal: MarshalRegistration) => void;
  onRegisterAnother: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  marshal,
  onClose,
  onViewRecord,
  onRegisterAnother,
}) => {
  if (!marshal) return null;

  const isOffline = marshal.syncStatus === 'pending_sync';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 text-center animate-in fade-in zoom-in duration-200">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
          Registration Recorded Successfully
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Swaziland Local Transport Association Official Registry
        </p>

        {/* Summary Card */}
        <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-left flex items-center gap-3">
          <div className="w-14 h-16 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-slate-700 flex-shrink-0">
            {marshal.photoDataUrl ? (
              <img
                src={marshal.photoDataUrl}
                alt="Portrait"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 dark:text-slate-500">
                No Photo
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
                STAFF #{marshal.staffNumber}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{marshal.region}</span>
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate mt-0.5">
              {marshal.firstName} {marshal.surname}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-400 font-medium truncate">
              {marshal.position}
            </div>
            {/* Marital Profiling summary */}
            <div className="mt-1 pt-1 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span className="font-medium text-rose-900 dark:text-rose-200">
                {marshal.maritalStatus || 'Single'}
                {marshal.partnerName ? ` (${marshal.partnerName})` : ''}
              </span>
              <span className="font-mono text-slate-500 dark:text-slate-400 font-bold">
                {marshal.numberOfKids ?? 0} {(marshal.numberOfKids ?? 0) === 1 ? 'Kid' : 'Kids'}
              </span>
            </div>
          </div>
        </div>

        {/* Sync Status Note */}
        <div className="mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 text-left bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200">
          {isOffline ? (
            <>
              <WifiOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Stored Offline:</strong> Registration is secured in local device storage.
                Will sync to central servers automatically when network returns.
              </span>
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Synchronized:</strong> Record confirmed in transport registry database.
              </span>
            </>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onViewRecord(marshal);
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
          >
            <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>View Form</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onRegisterAnother();
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Another</span>
          </button>
        </div>
      </div>
    </div>
  );
};
