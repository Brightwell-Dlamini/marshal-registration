import React, { useState, useMemo } from 'react';
import { MarshalRegistration, Region } from '../types';
import { useSync } from '../services/sync';
import {
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  CreditCard,
  UserPlus,
  RefreshCw,
  Crown,
  Heart,
  Baby,
  Users,
} from 'lucide-react';

interface MarshalDirectoryProps {
  marshals: MarshalRegistration[];
  onSelectMarshal: (marshal: MarshalRegistration) => void;
  onDeleteMarshal: (id: string) => void;
  onGoToRegister: () => void;
}

export const MarshalDirectory: React.FC<MarshalDirectoryProps> = ({
  marshals,
  onSelectMarshal,
  onDeleteMarshal,
  onGoToRegister,
}) => {
  const { isOnline, isSyncing, triggerSync } = useSync();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Filtered List
  const filteredMarshals = useMemo(() => {
    return marshals.filter((m) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.firstName.toLowerCase().includes(q) ||
        m.surname.toLowerCase().includes(q) ||
        m.staffNumber.toLowerCase().includes(q) ||
        m.position.toLowerCase().includes(q) ||
        m.idNumber.toLowerCase().includes(q) ||
        m.residentialAddress.toLowerCase().includes(q) ||
        m.chiefOfArea.toLowerCase().includes(q) ||
        (m.maritalStatus && m.maritalStatus.toLowerCase().includes(q)) ||
        (m.partnerName && m.partnerName.toLowerCase().includes(q));

      const matchesRegion = selectedRegion === 'All' || m.region === selectedRegion;
      const matchesStatus = selectedStatus === 'All' || m.syncStatus === selectedStatus;

      return matchesSearch && matchesRegion && matchesStatus;
    });
  }, [marshals, searchTerm, selectedRegion, selectedStatus]);

  // Export to CSV
  const handleExportCSV = () => {
    if (marshals.length === 0) {
      alert('No records to export');
      return;
    }

    const headers = [
      'Staff Number',
      'First Names',
      'Surname',
      'Position',
      'Marital Status',
      'Partner Name',
      'Number of Kids',
      'Region',
      'Cell Number',
      'Home Tel',
      'National ID',
      'Residential Address',
      'Chief of Area',
      'Indvuna',
      'Next of Kin Name',
      'Next of Kin Relation',
      'Next of Kin Phone',
      'Registration Date',
      'Sync Status',
      'Field Officer',
    ];

    const rows = marshals.map((m) => [
      `"${m.staffNumber}"`,
      `"${m.firstName.replace(/"/g, '""')}"`,
      `"${m.surname.replace(/"/g, '""')}"`,
      `"${m.position.replace(/"/g, '""')}"`,
      `"${m.maritalStatus || 'Single'}"`,
      `"${(m.partnerName || '').replace(/"/g, '""')}"`,
      `"${m.numberOfKids ?? 0}"`,
      `"${m.region}"`,
      `"${m.cellNo}"`,
      `"${m.homeTelNo}"`,
      `"${m.idNumber}"`,
      `"${m.residentialAddress.replace(/"/g, '""')}"`,
      `"${m.chiefOfArea.replace(/"/g, '""')}"`,
      `"${m.indvuna.replace(/"/g, '""')}"`,
      `"${m.nextOfKin.fullName.replace(/"/g, '""')}"`,
      `"${m.nextOfKin.relationship}"`,
      `"${m.nextOfKin.contactNumber}"`,
      `"${m.registrationDate}"`,
      `"${m.syncStatus}"`,
      `"${m.fieldOfficerName || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Eswatini_Marshals_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(marshals, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `Eswatini_Marshals_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto my-4 sm:my-8 px-3 sm:px-6">
      {/* Directory Title & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Marshal Records Registry</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              {marshals.length} Registered
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gathered field registrations for Swaziland Local Transport Association.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
            title="Download CSV for Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
            title="Export full JSON data with photos and signatures"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Backup JSON</span>
          </button>

          <button
            type="button"
            onClick={onGoToRegister}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Registration</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, staff #, ID, position, chief..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Region Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
            >
              <option value="All">All Regions (Eswatini)</option>
              <option value="Manzini">Manzini Region</option>
              <option value="Hhohho">Hhohho Region</option>
              <option value="Shiselweni">Shiselweni Region</option>
              <option value="Lubombo">Lubombo Region</option>
            </select>
          </div>

          {/* Sync Status Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
            >
              <option value="All">All Sync States</option>
              <option value="synced">Synced to Central DB</option>
              <option value="pending_sync">Pending Sync (Offline)</option>
            </select>
          </div>
        </div>

        {/* Quick summary stats */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Showing {filteredMarshals.length} of {marshals.length} marshals</span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-blue-600 hover:underline font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* Marshals Grid / List */}
      {filteredMarshals.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Marshal Records Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || selectedRegion !== 'All' || selectedStatus !== 'All'
              ? 'No marshals match your current search criteria. Try clearing the filters.'
              : 'Start gathering marshal registrations and marital profiles.'}
          </p>
          <button
            type="button"
            onClick={onGoToRegister}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700 text-white text-xs font-bold shadow-xs hover:bg-blue-800 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Open Registration Form</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMarshals.map((marshal) => (
            <div
              key={marshal.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all p-4 flex flex-col justify-between group"
            >
              <div>
                {/* Card Top: Staff # & Sync Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-md bg-slate-900 text-amber-400">
                    STAFF #{marshal.staffNumber}
                  </span>

                  {marshal.syncStatus === 'synced' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Synced
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full animate-pulse">
                      <Clock className="w-3 h-3" /> Queued (Offline)
                    </span>
                  )}
                </div>

                {/* Profile Portrait & Name */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-16 h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 shadow-2xs">
                    {marshal.photoDataUrl ? (
                      <img
                        src={marshal.photoDataUrl}
                        alt={`${marshal.firstName} portrait`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                        No Photo
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {marshal.firstName} {marshal.surname}
                    </h3>
                    <p className="text-xs font-semibold text-blue-700 truncate mt-0.5">
                      {marshal.position}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                      <MapPin className="w-3 h-3 flex-shrink-0 text-slate-400" />
                      <span className="truncate">{marshal.residentialAddress} ({marshal.region})</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-600 font-mono mt-0.5">
                      <Phone className="w-3 h-3 flex-shrink-0 text-slate-400" />
                      <span>{marshal.cellNo}</span>
                    </div>
                  </div>
                </div>

                {/* Marital Profiling Snippet */}
                <div className="bg-rose-50/70 border border-rose-100 rounded-lg p-2.5 mb-3 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-rose-950 font-bold">
                    <span className="flex items-center gap-1 text-xs">
                      <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-100" />
                      <span>{marshal.maritalStatus || 'Single'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-rose-200/60 border border-rose-300/60 px-1.5 py-0.5 rounded-full text-rose-950 font-bold">
                      <Baby className="w-3 h-3 text-amber-700" />
                      <span>
                        {marshal.numberOfKids ?? 0} {(marshal.numberOfKids ?? 0) === 1 ? 'Kid' : 'Kids'}
                      </span>
                    </span>
                  </div>
                  {marshal.partnerName && (
                    <div className="flex items-center gap-1 text-slate-700 text-[11px] pt-0.5">
                      <Users className="w-3 h-3 text-rose-400 flex-shrink-0" />
                      <span className="truncate">
                        Partner: <strong className="font-semibold text-slate-900">{marshal.partnerName}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Civic Authority snippet */}
                <div className="text-[11px] text-slate-600 bg-slate-50 rounded-lg p-2 space-y-1 mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">National ID:</span>
                    <span className="font-mono font-medium text-slate-800">{marshal.idNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chief (Sikhulu):</span>
                    <span className="font-medium text-slate-800 truncate ml-2">{marshal.chiefOfArea}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Indvuna:</span>
                    <span className="font-medium text-slate-800 truncate ml-2">{marshal.indvuna}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400">
                  Registered: {marshal.registrationDate}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectMarshal(marshal)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition"
                    title="View official document & print badge"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete registration record for ${marshal.firstName} ${marshal.surname}?`)) {
                        onDeleteMarshal(marshal.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
