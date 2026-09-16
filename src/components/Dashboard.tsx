import React, { useMemo } from 'react';
import { MarshalRegistration, Region } from '../types';
import {
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  Baby,
  Heart,
  MessageCircle,
  TrendingUp,
} from 'lucide-react';

interface DashboardProps {
  marshals: MarshalRegistration[];
}

const REGIONS: Region[] = ['Manzini', 'Hhohho', 'Shiselweni', 'Lubombo'];

export const Dashboard: React.FC<DashboardProps> = ({ marshals }) => {
  const stats = useMemo(() => {
    const total = marshals.length;
    const synced = marshals.filter((m) => m.syncStatus === 'synced').length;
    const pending = total - synced;

    const byRegion = REGIONS.map((r) => ({
      region: r,
      count: marshals.filter((m) => m.region === r).length,
    }));

    const withWhatsapp = marshals.filter((m) => !!m.whatsappNo?.trim()).length;
    const withPartner = marshals.filter((m) => !!m.partnerName?.trim()).length;
    const totalKids = marshals.reduce((sum, m) => sum + (m.numberOfKids ?? 0), 0);
    const married = marshals.filter(
      (m) =>
        m.maritalStatus === 'Married' ||
        m.maritalStatus === 'Customary Marriage (Kuteka)' ||
        m.maritalStatus === 'Civil / Religious Marriage'
    ).length;

    // Last 7 days registrations
    const now = Date.now();
    const week = 7 * 86400000;
    const thisWeek = marshals.filter((m) => now - m.createdAt < week).length;

    return {
      total,
      synced,
      pending,
      byRegion,
      withWhatsapp,
      withPartner,
      totalKids,
      married,
      thisWeek,
    };
  }, [marshals]);

  const maxRegionCount = Math.max(1, ...stats.byRegion.map((r) => r.count));

  return (
    <div className="max-w-6xl mx-auto my-4 sm:my-8 px-3 sm:px-6">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Registration Dashboard
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Live overview of marshal registrations across Eswatini.
        </p>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <KPI
          icon={<Users className="w-5 h-5" />}
          label="Total Marshals"
          value={stats.total}
          tone="blue"
        />
        <KPI
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Synced"
          value={stats.synced}
          tone="emerald"
        />
        <KPI
          icon={<Clock className="w-5 h-5" />}
          label="Pending Sync"
          value={stats.pending}
          tone={stats.pending > 0 ? 'amber' : 'slate'}
        />
        <KPI
          icon={<TrendingUp className="w-5 h-5" />}
          label="Last 7 Days"
          value={stats.thisWeek}
          tone="violet"
        />
      </div>

      {/* Region Distribution */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-blue-700 dark:text-blue-400" />
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Registrations by Region
          </h3>
        </div>
        <div className="space-y-2.5">
          {stats.byRegion.map((r) => (
            <div key={r.region} className="flex items-center gap-3">
              <span className="w-24 text-xs font-bold text-slate-700 dark:text-slate-300 flex-shrink-0">
                {r.region}
              </span>
              <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg transition-all duration-500"
                  style={{ width: `${(r.count / maxRegionCount) * 100}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-end pr-2 text-[11px] font-bold text-slate-700 dark:text-slate-200">
                  {r.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Family & Contact Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          icon={<Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
          label="Married / Partnered"
          value={stats.married}
          subtext={`${stats.withPartner} with partner name recorded`}
        />
        <MetricCard
          icon={<Baby className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          label="Total Children"
          value={stats.totalKids}
          subtext={`Across ${stats.total} marshal households`}
        />
        <MetricCard
          icon={<MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          label="WhatsApp Reachable"
          value={stats.withWhatsapp}
          subtext={`${
            stats.total > 0 ? Math.round((stats.withWhatsapp / stats.total) * 100) : 0
          }% of marshals`}
        />
        <MetricCard
          icon={<Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          label="Avg. Kids / Marshal"
          value={
            stats.total > 0 ? (stats.totalKids / stats.total).toFixed(1) : '0.0'
          }
          subtext="Family size indicator"
        />
      </div>
    </div>
  );
};

const KPI: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'blue' | 'emerald' | 'amber' | 'violet' | 'slate';
}> = ({ icon, label, value, tone }) => {
  const toneMap: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    violet: 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    slate: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };
  return (
    <div className={`rounded-2xl border p-3.5 sm:p-4 ${toneMap[tone]}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="p-1.5 rounded-lg bg-white/70 dark:bg-slate-900/50">{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-wider opacity-80">
          {label}
        </span>
      </div>
      <div className="text-2xl sm:text-3xl font-black font-mono">{value}</div>
    </div>
  );
};

const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subtext: string;
}> = ({ icon, label, value, subtext }) => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">{icon}</div>
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
        {label}
      </span>
    </div>
    <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">{value}</div>
    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{subtext}</div>
  </div>
);
