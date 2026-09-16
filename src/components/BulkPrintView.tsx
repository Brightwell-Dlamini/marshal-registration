import React from 'react';
import { MarshalRegistration } from '../types';

interface BulkPrintViewProps {
  marshals: MarshalRegistration[];
  onClose: () => void;
}

/**
 * Bulk print view: renders all selected marshals as a single printable document.
 * Each marshal gets its own page (page-break-after: always).
 */
export const BulkPrintView: React.FC<BulkPrintViewProps> = ({ marshals, onClose }) => {
  if (marshals.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-white overflow-y-auto print:static print:overflow-visible">
      {/* Toolbar (hidden on print) */}
      <div className="sticky top-0 z-10 bg-slate-900 text-white px-5 py-3 flex items-center justify-between print:hidden shadow-md">
        <span className="text-sm font-bold">
          Bulk Print Preview — {marshals.length} record{marshals.length === 1 ? '' : 's'}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
          >
            Print / Save as PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Print pages */}
      <div className="bg-slate-100 print:bg-white">
        {marshals.map((m, idx) => (
          <div
            key={m.id}
            className="bg-white max-w-3xl mx-auto my-6 p-8 shadow-lg print:shadow-none print:my-0 print:p-10 print:max-w-none"
            style={{ pageBreakAfter: idx < marshals.length - 1 ? 'always' : 'auto' }}
          >
            <BulkPage marshal={m} />
          </div>
        ))}
      </div>
    </div>
  );
};

const BulkPage: React.FC<{ marshal: MarshalRegistration }> = ({ marshal }) => (
  <div className="font-serif text-slate-900">
    <div className="border-b-2 border-slate-900 pb-4 mb-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-black font-sans uppercase tracking-tight">
            Swaziland Local Transport Association
          </h1>
          <h2 className="text-xs font-bold font-sans tracking-widest uppercase mt-0.5">
            National Executive Committee
          </h2>
          <div className="text-[10px] font-sans text-slate-600 mt-1 leading-snug">
            First floor Office No. 11, Main Post office Building, Cnr. Martin & Nkoseluhlaza
            Street, MANZINI
            <br />
            P. O. Box 4176, MANZINI M200, SWAZILAND • TEL/FAX: 2505 7796
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="inline-block border-2 border-slate-900 rounded-lg px-3 py-1.5 bg-slate-50 text-center">
            <span className="block text-[9px] font-sans font-black text-slate-500 uppercase tracking-widest">
              STAFF #:
            </span>
            <span className="font-mono text-lg font-black">{marshal.staffNumber}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-300 text-center">
        <span className="font-sans text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4">
          MARSHAL REGISTRATION
        </span>
      </div>
    </div>

    <div className="flex gap-6 mb-6">
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className="w-32 h-40 border-2 border-slate-800 rounded bg-slate-100 overflow-hidden relative">
          {marshal.photoRemoteUrl || marshal.photoDataUrl ? (
            <img
              src={marshal.photoRemoteUrl || marshal.photoDataUrl}
              alt="Marshal"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
              No Photo
            </div>
          )}
        </div>
        <span className="text-[9px] font-sans text-slate-500 mt-1">Official Photo</span>
      </div>

      <div className="flex-1 space-y-2 text-xs leading-relaxed">
        <FieldLine label="First names" value={marshal.firstName} />
        <FieldLine label="Surname" value={marshal.surname} />
        <FieldLine label="Position" value={marshal.position} />
        <FieldLine label="Marital Status" value={marshal.maritalStatus} />
        <FieldLine label="Number of Kids" value={String(marshal.numberOfKids ?? 0)} />
        <FieldLine label="Partner's Name" value={marshal.partnerName || 'N/A'} />
        <FieldLine
          label="Residential address"
          value={`${marshal.residentialAddress} (${marshal.region})`}
        />
        <FieldLine label="Home tell No" value={marshal.homeTelNo} />
        <FieldLine label="Cell No" value={marshal.cellNo} mono />
        <FieldLine label="WhatsApp No" value={marshal.whatsappNo || 'N/A'} mono />
        <FieldLine label="I.D. No" value={marshal.idNumber} mono />
        <FieldLine label="Chief of Area" value={marshal.chiefOfArea} />
        <FieldLine label="Indvuna" value={marshal.indvuna} />
        <FieldLine
          label="Next of kin"
          value={`${marshal.nextOfKin.fullName} (${marshal.nextOfKin.relationship}) ${marshal.nextOfKin.contactNumber}`}
        />
      </div>
    </div>

    <div className="border-t-2 border-slate-800 pt-4">
      <div className="text-xs font-serif leading-relaxed mb-4">
        <strong className="font-sans font-bold block mb-0.5">AGREEMENT:</strong>
        The undersigned person has agreed that he/she will abide by rules and regulations of the
        above named association.
      </div>

      <div className="grid grid-cols-2 gap-6 items-end">
        <div>
          <span className="block font-sans text-[11px] font-bold uppercase mb-1">
            MEMBER'S SIGNATURE:
          </span>
          <div className="h-16 border-b-2 border-slate-900 flex items-center px-2">
            {marshal.signatureRemoteUrl || marshal.signatureDataUrl ? (
              <img
                src={marshal.signatureRemoteUrl || marshal.signatureDataUrl}
                alt="Signature"
                className="h-14 max-w-full object-contain"
              />
            ) : (
              <span className="italic text-slate-400 text-xs">Signed digitally</span>
            )}
          </div>
        </div>
        <div>
          <span className="block font-sans text-[11px] font-bold uppercase mb-1">DATE:</span>
          <div className="h-16 border-b-2 border-slate-900 flex items-center px-2">
            <span className="font-mono text-sm font-bold">{marshal.registrationDate}</span>
          </div>
        </div>
      </div>
    </div>

    <div className="border-t border-slate-300 pt-3 text-center mt-4">
      <span className="font-sans text-[10px] font-bold text-slate-600 tracking-widest uppercase">
        REGIONAL BRANCHES: MANZINI • HHOHHO • SHISELWENI • LUBOMBO
      </span>
    </div>
  </div>
);

const FieldLine: React.FC<{ label: string; value: string; mono?: boolean }> = ({
  label,
  value,
  mono,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-dotted border-slate-400 pb-1">
    <span className="w-36 font-sans font-bold text-slate-800 flex-shrink-0">{label}:</span>
    <span
      className={`font-serif text-sm font-semibold text-blue-950 ${
        mono ? 'font-mono tracking-wider' : ''
      }`}
    >
      {value}
    </span>
  </div>
);
