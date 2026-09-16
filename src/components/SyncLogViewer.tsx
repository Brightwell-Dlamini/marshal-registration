import React, { useEffect, useState } from 'react';
import { storageService } from '../services/storage';
import { SyncLogRow } from '../types';
import { X, History, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface SyncLogViewerProps {
  onClose: () => void;
}

export const SyncLogViewer: React.FC<SyncLogViewerProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<SyncLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const rows = await storageService.getSyncLogs(50);
    setLogs(rows);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const formatTime = (ms: number) => {
    const d = new Date(ms);
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold tracking-wide">Sync History</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-4 sm:p-5">
          {loading ? (
            <div className="text-center py-10 text-slate-500 text-sm">Loading history…</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10">
              <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No sync history yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Sync events will appear here once you register or sync marshals.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {logs.map((log) => (
                <li
                  key={log.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${
                    log.status === 'success'
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-red-50/60 border-red-200'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg flex-shrink-0 ${
                      log.status === 'success'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {log.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {formatTime(Number(log.timestamp))}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-snug">{log.message}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                      {log.count} record{log.count === 1 ? '' : 's'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
