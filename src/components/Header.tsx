import React from 'react';
import { useSync } from '../services/sync';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  UserPlus,
  Users,
  ShieldCheck,
  Radio,
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'register' | 'directory';
  onSelectTab: (tab: 'register' | 'directory') => void;
  totalMarshalsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  totalMarshalsCount,
}) => {
  const {
    isOnline,
    isSimulatedOffline,
    isSyncing,
    pendingCount,
    triggerSync,
    toggleSimulatedOffline,
  } = useSync();

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40 border-b border-slate-800">
      {/* Association Identification Bar */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-3 pb-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo & Emblem */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-amber-500 p-0.5 shadow-md flex-shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold tracking-wide text-white uppercase">
                  Swaziland Local Transport Association
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  SLTA • NEC
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium">
                Eswatini Marshals Field Registration System
              </p>
            </div>
          </div>

          {/* Offline Sync Controls & Status */}
          <div className="flex items-center flex-wrap gap-2 justify-between md:justify-end">
            {/* Online/Offline Status Pill */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                isOnline
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                  : 'bg-amber-950/80 text-amber-300 border-amber-600/70 animate-pulse'
              }`}
            >
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Offline Mode</span>
                </>
              )}
            </div>

            {/* Simulated Offline Toggle for Field Testing */}
            <button
              type="button"
              onClick={toggleSimulatedOffline}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 ${
                isSimulatedOffline
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Toggle to simulate poor cellular connectivity in rural bus ranks"
            >
              <Radio className="w-3 h-3" />
              <span>{isSimulatedOffline ? 'Simulating Offline' : 'Test Offline'}</span>
            </button>

            {/* Pending Sync & Trigger */}
            {pendingCount > 0 ? (
              <button
                type="button"
                onClick={() => triggerSync()}
                disabled={isSyncing || !isOnline}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-400 text-white shadow-xs transition"
                title="Sync records with central transport register"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync Now ({pendingCount})</span>
              </button>
            ) : (
              <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-slate-400">
                All records synced
              </span>
            )}

            {/* PWA Install */}
            <PWAInstallButton />
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => onSelectTab('register')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
              currentTab === 'register'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Registration Form</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('directory')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
              currentTab === 'directory'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Marshal Directory</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                currentTab === 'directory'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {totalMarshalsCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
