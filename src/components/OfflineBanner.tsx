import React from 'react';
import { useSync } from '../services/sync';
import { WifiOff, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const { isOnline, pendingCount, isSyncing, triggerSync } = useSync();

  if (isOnline && pendingCount === 0) return null;

  return (
    <aside
      aria-label="Network status"
      className={`border-b text-xs sm:text-sm py-2 px-4 transition-colors ${
        !isOnline
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : 'bg-blue-50 border-blue-200 text-blue-900'
      }`}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-center sm:text-left">
          {!isOnline ? (
            <WifiOff className="w-4 h-4 text-amber-700 flex-shrink-0 animate-bounce" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-blue-700 flex-shrink-0" />
          )}
          <span>
            {!isOnline ? (
              <>
                <strong>Offline Mode:</strong> Mobile field storage is active. New marshal
                registrations and photos are saved locally on this device.
              </>
            ) : (
              <>
                <strong>Connection Restored:</strong> You have {pendingCount} marshal registration(s)
                queued for synchronization.
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="font-semibold text-xs bg-white/80 px-2 py-0.5 rounded-full border border-current">
              {pendingCount} Pending Sync
            </span>
          )}

          {isOnline && pendingCount > 0 && (
            <button
              type="button"
              onClick={() => triggerSync()}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs shadow-xs disabled:opacity-50 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync To Cloud'}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
