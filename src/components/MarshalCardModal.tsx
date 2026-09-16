import React from 'react';
import { MarshalRegistration } from '../types';
import { X, Printer, Shield, CheckCircle2, QrCode } from 'lucide-react';

interface MarshalCardModalProps {
  marshal: MarshalRegistration | null;
  onClose: () => void;
}

export const MarshalCardModal: React.FC<MarshalCardModalProps> = ({ marshal, onClose }) => {
  if (!marshal) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:fixed-none">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto print:shadow-none print:border-none print:max-w-none print:w-full">
        {/* Modal Header Toolbar (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold tracking-wide">
              Official Marshal Registration Record
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Form</span>
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

        {/* Printable Official Form Replica */}
        <div className="p-6 sm:p-8 bg-white font-serif text-slate-900 relative print:p-8">
          {/* Subtle Watermark Stamp */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.04]">
            <div className="w-96 h-96 rounded-full border-[18px] border-slate-900 flex items-center justify-center text-center p-8 text-3xl font-black uppercase tracking-widest rotate-[-25deg]">
              Swaziland Local Transport Association
            </div>
          </div>

          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-lg sm:text-xl font-black font-sans uppercase tracking-tight text-slate-950">
                  Swaziland Local Transport Association
                </h1>
                <h2 className="text-xs font-bold font-sans tracking-widest text-slate-700 uppercase mt-0.5">
                  National Executive Committee
                </h2>
                <div className="text-[10px] sm:text-[11px] font-sans text-slate-600 mt-1 leading-snug">
                  First floor Office No. 11, Main Post office Building, Cnr. Martin & Nkoseluhlaza Street, MANZINI<br />
                  P. O. Box 4176, MANZINI M200, SWAZILAND • TEL/FAX: 2505 7796
                </div>
              </div>

              {/* Staff Number Badge */}
              <div className="text-right flex-shrink-0">
                <div className="inline-block border-2 border-slate-900 rounded-lg px-3 py-1.5 bg-slate-50 text-center">
                  <span className="block text-[9px] font-sans font-black text-slate-500 uppercase tracking-widest">
                    STAFF #:
                  </span>
                  <span className="font-mono text-lg font-black text-slate-950">
                    {marshal.staffNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Subject Header */}
            <div className="mt-4 pt-3 border-t border-slate-300 text-center">
              <span className="font-sans text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4">
                MARSHAL REGISTRATION
              </span>
            </div>
          </div>

          {/* Form Content: Photo + Field Lines */}
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            {/* Passport Photo Box */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="w-32 h-40 border-2 border-slate-800 rounded bg-slate-100 overflow-hidden shadow-xs relative">
                {marshal.photoDataUrl ? (
                  <img
                    src={marshal.photoDataUrl}
                    alt="Marshal portrait"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                    No Photo
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 py-0.5 text-center text-[8px] font-mono text-white">
                  STAFF #{marshal.staffNumber}
                </div>
              </div>
              <span className="text-[9px] font-sans text-slate-500 mt-1">Official Passport Photo</span>
            </div>

            {/* Fields List Styled as Paper Lines */}
            <div className="flex-1 space-y-2.5 text-xs leading-relaxed">
              <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-dotted border-slate-400 pb-1">
                <span className="w-36 font-sans font-bold text-slate-800 flex-shrink-0">First names:</span>
                <span className="font-serif text-sm font-semibold text-blue-950">{marshal.firstName}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-dotted border-slate-400 pb-1">
                <span className="w-36 font-sans font-bold text-slate-800 flex-shrink-0">Surname:</span>
                <span className="font-serif text-sm font-semibold text-blue-950">{marshal.surname}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-dotted border-slate-400 pb-1">
                <span className="w-36 font-sans font-bold text-slate-800 flex-shrink-0">Position:</span>
                <span className="font-serif text-sm font-semibold text-blue-950">{marshal.position}</span>
              </div>

              {/* Marital Profiling Highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-b border-dotted border-slate-400 pb-1 bg-rose-50/40 p-1.5 rounded">
                <div className="flex items-baseline">
                  <span className="w-32 font-sans font-bold text-rose-950 flex-shrink-0">Marital Status:</span>
                  <span className="font-serif text-sm font-bold text-rose-900">{marshal.maritalStatus || 'Single'}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="w-28 font-sans font-bold text-rose-950 flex-shrink-0">Number of Kids:</span>
                  <span className="font-serif text-sm font-bold text-rose-900 font-mono">
                    {marshal.numberOfKids ?? 0} {marshal.numberOfKids === 1 ? 'child' : 'children'}
                  </span>
                </div>
              </div>

              {/* Partner's Name */}
              <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-dotted border-slate-400 pb-1 bg-rose-50/40 p-1.5 rounded">
                <span className="w-36 font-sans font-bold text-rose-950 flex-shrink-0">Partner's Name:</span>
                <span className="font-serif text-sm font-semibold text-slate-900">
                  {marshal.partnerName || 'N/A (Single / Not Recorded)'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-dotted border-slate-400 pb-1">
                <span className="w-36 font-sans font-bold text-slate-800 flex-shrink-0">Residential address:</span>
                <span className="font-serif text-sm font-semibold text-blue-950">{marshal.residentialAddress} ({marshal.region})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-b border-dotted border-slate-400 pb-1">
                <div className="flex items-baseline">
                  <span className="w-28 font-sans font-bold text-slate-800 flex-shrink-0">Home tell No:</span>
                  <span className="font-serif text-sm font-semibold text-blue-950">{marshal.homeTelNo}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="w-20 font-sans font-bold text-slate-800 flex-shrink-0">Cell No:</span>
                  <span className="font-serif text-sm font-semibold text-blue-950 font-mono">{marshal.cellNo}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-dotted border-slate-400 pb-1">
                <span className="w-36 font-sans font-bold text-slate-800 flex-shrink-0">I.D. No:</span>
                <span className="font-serif text-sm font-semibold text-blue-950 font-mono tracking-wider">{marshal.idNumber}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-b border-dotted border-slate-400 pb-1">
                <div className="flex items-baseline">
                  <span className="w-28 font-sans font-bold text-slate-800 flex-shrink-0">Chief of Area:</span>
                  <span className="font-serif text-sm font-semibold text-blue-950">{marshal.chiefOfArea}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="w-20 font-sans font-bold text-slate-800 flex-shrink-0">Indvuna:</span>
                  <span className="font-serif text-sm font-semibold text-blue-950">{marshal.indvuna}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline border-b border-dotted border-slate-400 pb-1">
                <span className="w-36 font-sans font-bold text-slate-800 flex-shrink-0">Next of kin:</span>
                <span className="font-serif text-sm font-semibold text-blue-950">
                  {marshal.nextOfKin.fullName} ({marshal.nextOfKin.relationship}) {marshal.nextOfKin.contactNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Agreement Section */}
          <div className="border-t-2 border-slate-800 pt-4 mb-4">
            <div className="text-xs font-serif leading-relaxed mb-4">
              <strong className="font-sans font-bold text-slate-900 block mb-0.5">AGREEMENT:</strong>
              The undersigned person has agreed that he/she will abide by rules and regulations of the above named association.
            </div>

            {/* Signature & Date Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
              <div>
                <span className="block font-sans text-[11px] font-bold uppercase text-slate-700 mb-1">
                  MEMBER'S SIGNATURE:
                </span>
                <div className="h-16 border-b-2 border-slate-900 flex items-center justify-start px-2">
                  {marshal.signatureDataUrl ? (
                    <img
                      src={marshal.signatureDataUrl}
                      alt="Member signature"
                      className="h-14 max-w-full object-contain"
                    />
                  ) : (
                    <span className="italic text-slate-400 text-xs">Signed digitally</span>
                  )}
                </div>
              </div>

              <div>
                <span className="block font-sans text-[11px] font-bold uppercase text-slate-700 mb-1">
                  DATE:
                </span>
                <div className="h-16 border-b-2 border-slate-900 flex items-center justify-start px-2">
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {marshal.registrationDate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Branches Footer */}
          <div className="border-t border-slate-300 pt-3 text-center">
            <span className="font-sans text-[10px] font-bold text-slate-600 tracking-widest uppercase">
              REGIONAL BRANCHES: MANZINI • HHOHHO • SHISELWENI • LUBOMBO
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
