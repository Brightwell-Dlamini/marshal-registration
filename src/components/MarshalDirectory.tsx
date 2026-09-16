import React, { useState, useMemo } from 'react';
import { MarshalRegistration } from '../types';
import {
  Search,
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
  Heart,
  Baby,
  Users,
  MessageCircle,
  Pencil,
  Printer,
  Square,
  CheckSquare,
} from 'lucide-react';

interface MarshalDirectoryProps {
  marshals: MarshalRegistration[];
  onSelectMarshal: (marshal: MarshalRegistration) => void;
  onEditMarshal: (marshal: MarshalRegistration) => void;
  onDeleteMarshal: (id: string) => void;
  onGoToRegister: () => void;
  onBulkPrint: (marshals: MarshalRegistration[]) => void;
}

const formatPhoneIntl = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 8) return `+268${digits}`;
  if (digits.startsWith('268')) return `+${digits}`;
  return digits ? `+${digits}` : '';
};

export const MarshalDirectory: React.FC<MarshalDirectoryProps> = ({
  marshals,
  onSelectMarshal,
  onEditMarshal,
  onDeleteMarshal,
  onGoToRegister,
  onBulkPrint,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selection, setSelection] = useState<Set<string>>(new Set());

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
        (m.cellNo && m.cellNo.toLowerCase().includes(q)) ||
        (m.whatsappNo && m.whatsappNo.toLowerCase().includes(q)) ||
        (m.maritalStatus && m.maritalStatus.toLowerCase().includes(q)) ||
        (m.partnerName && m.partnerName.toLowerCase().includes(q));

      const matchesRegion = selectedRegion === 'All' || m.region === selectedRegion;
      const matchesStatus = selectedStatus === 'All' || m.syncStatus === selectedStatus;

      return matchesSearch && matchesRegion && matchesStatus;
    });
  }, [marshals, searchTerm, selectedRegion, selectedStatus]);

  const toggleSelection = (id: string) => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelection(new Set(filteredMarshals.map((m) => m.id)));
  };

  const clearSelection = () => setSelection(new Set());

  const selectedMarshals = useMemo(
    () => marshals.filter((m) => selection.has(m.id)),
    [marshals, selection]
  );

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
      'WhatsApp Number',
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
      `"${m.whatsappNo || ''}"`,
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
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute(
      'download',
      `Eswatini_Marshals_Registry_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(marshals, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute(
      'download',
      `Eswatini_Marshals_Backup_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto my-4 sm:my-8 px-3 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <span>Marshal Records Registry</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {marshals.length} Registered
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gathered field registrations for Swaziland Local Transport Association.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-xs transition"
            title="Download CSV for Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
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

      {selection.size > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-blue-900 text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold">
              {selection.size} record{selection.size === 1 ? '' : 's'} selected
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onBulkPrint(selectedMarshals)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Bulk Print ({selection.size})</span>
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, staff #, ID, phone, WhatsApp..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
            >
              <option value="All">All Regions</option>
              <option value="Manzini">Manzini Region</option>
              <option value="Hhohho">Hhohho Region</option>
              <option value="Shiselweni">Shiselweni Region</option>
              <option value="Lubombo">Lubombo Region</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
            >
              <option value="All">All Sync States</option>
              <option value="synced">Synced</option>
              <option value="pending_sync">Pending Sync</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-2">
          <span>
            Showing {filteredMarshals.length} of {marshals.length} marshals
          </span>
          <div className="flex items-center gap-3">
            {filteredMarshals.length > 0 && (
              <button
                type="button"
                onClick={selectAllFiltered}
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Select all ({filteredMarshals.length})
              </button>
            )}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredMarshals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-dashed border-slate-300 dark:border-slate-600">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Marshal Records Found</h3>
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
          {filteredMarshals.map((marshal) => {
            const isSelected = selection.has(marshal.id);
            const whatsappDiffers =
              marshal.whatsappNo && marshal.whatsappNo.trim() !== marshal.cellNo.trim();

            return (
              <div
                key={marshal.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm hover:shadow-md transition-all p-4 flex flex-col justify-between group ${
                  isSelected
                    ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => toggleSelection(marshal.id)}
                      className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-md transition ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-3.5 h-3.5" />
                      ) : (
                        <Square className="w-3.5 h-3.5" />
                      )}
                      <span>Select</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-extrabold px-2 py-1 rounded-md bg-slate-900 text-amber-400">
                        #{marshal.staffNumber}
                      </span>
                      {marshal.syncStatus === 'synced' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full animate-pulse">
                          <Clock className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-16 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex-shrink-0 shadow-2xs">
                      {marshal.photoRemoteUrl || marshal.photoDataUrl ? (
                        <img
                          src={marshal.photoRemoteUrl || marshal.photoDataUrl}
                          alt={`${marshal.firstName} portrait`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                          No Photo
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {marshal.firstName} {marshal.surname}
                      </h3>
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 truncate mt-0.5">
                        {marshal.position}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        <MapPin className="w-3 h-3 flex-shrink-0 text-slate-400" />
                        <span className="truncate">
                          {marshal.residentialAddress} ({marshal.region})
                        </span>
                      </div>

                      <a
                        href={`tel:${formatPhoneIntl(marshal.cellNo)}`}
                        className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 font-mono mt-0.5 transition"
                      >
                        <Phone className="w-3 h-3 flex-shrink-0 text-slate-400" />
                        <span>{marshal.cellNo}</span>
                      </a>

                      {marshal.whatsappNo && (
                        <a
                          href={`https://wa.me/${formatPhoneIntl(marshal.whatsappNo).replace('+', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-1 text-[11px] font-mono mt-0.5 transition ${
                            whatsappDiffers
                              ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                              : 'text-slate-500 dark:text-slate-400 hover:text-emerald-700'
                          }`}
                          title="Open WhatsApp chat"
                        >
                          <MessageCircle className="w-3 h-3 flex-shrink-0 text-emerald-500" />
                          <span>{marshal.whatsappNo}</span>
                          <span className="text-[9px] uppercase tracking-wide text-emerald-600 dark:text-emerald-400 font-bold">
                            WhatsApp
                          </span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 rounded-lg p-2.5 mb-3 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-rose-950 dark:text-rose-200 font-bold">
                      <span className="flex items-center gap-1 text-xs">
                        <Heart className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span>{marshal.maritalStatus || 'Single'}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-rose-200/60 dark:bg-rose-900/40 border border-rose-300/60 dark:border-rose-800 px-1.5 py-0.5 rounded-full">
                        <Baby className="w-3 h-3" />
                        {marshal.numberOfKids ?? 0}
                      </span>
                    </div>
                    {marshal.partnerName && (
                      <div className="text-rose-900 dark:text-rose-300">
                        Partner:{' '}
                        <strong className="font-semibold text-slate-900 dark:text-slate-100">
                          {marshal.partnerName}
                        </strong>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg p-2 space-y-1 mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">National ID:</span>
                      <span className="font-mono font-medium text-slate-800 dark:text-slate-200 truncate ml-2">
                        {marshal.idNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Chief:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate ml-2">
                        {marshal.chiefOfArea}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                  <span className="text-[10px] text-slate-400">
                    {marshal.registrationDate}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onSelectMarshal(marshal)}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[11px] font-semibold transition"
                      title="View"
                    >
                      <Eye className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditMarshal(marshal)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete ${marshal.firstName} ${marshal.surname}?`)) {
                          onDeleteMarshal(marshal.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
