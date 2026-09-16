import React, { useState, useEffect } from 'react';
import { MarshalRegistration, Region, MaritalStatus } from '../types';
import { PhotoUpload } from './PhotoUpload';
import { SignaturePad } from './SignaturePad';
import { useSync } from '../services/sync';
import {
  Send,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Shield,
  MapPin,
  Phone,
  CreditCard,
  Crown,
  HeartHandshake,
  Calendar,
  AlertCircle,
  Heart,
  Baby,
  Users,
  Minus,
  Plus,
  MessageCircle,
  Copy,
} from 'lucide-react';

interface RegistrationFormProps {
  onSuccess: (marshal: MarshalRegistration) => void;
}

const REGIONS: Region[] = ['Manzini', 'Hhohho', 'Shiselweni', 'Lubombo'];

const MARITAL_STATUS_OPTIONS: { value: MaritalStatus; label: string; desc: string }[] = [
  { value: 'Married', label: 'Married', desc: 'Standard / Civil marriage' },
  { value: 'Customary Marriage (Kuteka)', label: 'Customary (Kuteka)', desc: 'Swazi traditional marriage' },
  { value: 'Civil / Religious Marriage', label: 'Civil / Church', desc: 'Court or religious solemnization' },
  { value: 'Single', label: 'Single', desc: 'Unmarried / Never married' },
  { value: 'Cohabiting', label: 'Cohabiting', desc: 'Living with partner' },
  { value: 'Divorced', label: 'Divorced', desc: 'Legally dissolved marriage' },
  { value: 'Widowed', label: 'Widowed', desc: 'Surviving spouse' },
  { value: 'Separated', label: 'Separated', desc: 'Living separately' },
];

const COMMON_POSITIONS = [
  'Uniswa Marshal',
  'Manzini Bus Rank Marshal',
  'Mbabane Bus Rank Marshal',
  'Matsapha Bus Rank Marshal',
  'Nhlangano Rank Marshal',
  'Siteki Rank Marshal',
  'Piggs Peak Rank Marshal',
  'Route Inspector / Marshal',
  'Chief Rank Supervisor',
];

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
  const { isOnline } = useSync();

  // Form State
  const [staffNumber, setStaffNumber] = useState('04');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [position, setPosition] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [homeTelNo, setHomeTelNo] = useState('');
  const [cellNo, setCellNo] = useState('');
  const [whatsappNo, setWhatsappNo] = useState('');
  const [whatsappSameAsCell, setWhatsappSameAsCell] = useState(true);
  const [idNumber, setIdNumber] = useState('');
  const [chiefOfArea, setChiefOfArea] = useState('');
  const [indvuna, setIndvuna] = useState('');

  // Marital & Family Profiling State
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('Married');
  const [partnerName, setPartnerName] = useState('');
  const [numberOfKids, setNumberOfKids] = useState<number>(0);

  const [kinName, setKinName] = useState('');
  const [kinRelationship, setKinRelationship] = useState('Wife');
  const [kinPhone, setKinPhone] = useState('');
  const [region, setRegion] = useState<Region>('Manzini');
  const [agreementAccepted, setAgreementAccepted] = useState(true);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [registrationDate, setRegistrationDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [fieldOfficerName, setFieldOfficerName] = useState('Officer In-Charge (Manzini)');

  // Validation & feedback state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync WhatsApp with Cell when the checkbox is ticked
  useEffect(() => {
    if (whatsappSameAsCell) {
      setWhatsappNo(cellNo);
    }
  }, [cellNo, whatsappSameAsCell]);

  const handleWhatsappCheckbox = (checked: boolean) => {
    setWhatsappSameAsCell(checked);
    if (checked) {
      setWhatsappNo(cellNo);
    }
  };

  const handlePrefillSample = () => {
    setStaffNumber('04');
    setFirstName('Thulani Sdumo');
    setSurname('Mkhatshwa');
    setPosition('Uniswa Marshal');
    setResidentialAddress('Ndlavane');
    setHomeTelNo('N/A');
    setCellNo('76704181');
    setWhatsappSameAsCell(true);
    setWhatsappNo('76704181');
    setIdNumber('8203296100441');
    setChiefOfArea('Logcogco Dlamini');
    setIndvuna('Jan Mngometulu');
    setMaritalStatus('Married');
    setPartnerName('Thandiwe Dube');
    setNumberOfKids(3);
    setKinName('Thandiwe Dube');
    setKinRelationship('Wife');
    setKinPhone('76439772');
    setRegion('Manzini');
    setAgreementAccepted(true);
    setRegistrationDate('2024-02-16');

    if (!photoDataUrl) {
      setPhotoDataUrl(
        'data:image/svg+xml;utf8,' +
          encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">
            <rect width="200" height="240" fill="#e2e8f0"/>
            <circle cx="100" cy="85" r="45" fill="#5c3826"/>
            <path d="M40 220 C40 160 70 145 100 145 C130 145 160 160 160 220 Z" fill="#d97706"/>
            <path d="M85 145 L100 180 L115 145 Z" fill="#ffffff"/>
            <circle cx="85" cy="82" r="5" fill="#1e1b4b"/>
            <circle cx="115" cy="82" r="5" fill="#1e1b4b"/>
            <path d="M80 105 Q100 115 120 105" stroke="#382318" stroke-width="4" fill="none"/>
            <path d="M78 98 Q100 96 122 98" stroke="#261710" stroke-width="6" fill="none"/>
          </svg>
        `)
      );
    }

    if (!signatureDataUrl) {
      setSignatureDataUrl(
        'data:image/svg+xml;utf8,' +
          encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" width="300" height="100">
            <path d="M20 60 Q 60 10, 100 50 T 180 40 T 260 70 M50 70 L 220 70" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round"/>
          </svg>
        `)
      );
    }

    setErrors({});
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear all form entries?')) {
      setStaffNumber(String(Math.floor(Math.random() * 90) + 10));
      setFirstName('');
      setSurname('');
      setPosition('');
      setResidentialAddress('');
      setHomeTelNo('');
      setCellNo('');
      setWhatsappNo('');
      setWhatsappSameAsCell(true);
      setIdNumber('');
      setChiefOfArea('');
      setIndvuna('');
      setMaritalStatus('Single');
      setPartnerName('');
      setNumberOfKids(0);
      setKinName('');
      setKinPhone('');
      setPhotoDataUrl('');
      setSignatureDataUrl('');
      setErrors({});
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!staffNumber.trim()) errs.staffNumber = 'Staff number is required';
    if (!firstName.trim()) errs.firstName = 'First name(s) is required';
    if (!surname.trim()) errs.surname = 'Surname is required';
    if (!position.trim()) errs.position = 'Position/Rank is required';
    if (!residentialAddress.trim()) errs.residentialAddress = 'Residential address is required';
    if (!cellNo.trim()) errs.cellNo = 'Cell phone number is required';
    if (!idNumber.trim()) errs.idNumber = 'National ID number is required';
    if (!chiefOfArea.trim()) errs.chiefOfArea = 'Chief of area is required';
    if (!indvuna.trim()) errs.indvuna = 'Indvuna name is required';

    // WhatsApp: only validate if user chose to enter a different one
    if (!whatsappSameAsCell && !whatsappNo.trim()) {
      errs.whatsappNo = 'Enter WhatsApp number or tick "Same as Cell"';
    }

    const isMarriedOrPartnered =
      maritalStatus === 'Married' ||
      maritalStatus === 'Customary Marriage (Kuteka)' ||
      maritalStatus === 'Civil / Religious Marriage' ||
      maritalStatus === 'Cohabiting';

    if (isMarriedOrPartnered && !partnerName.trim()) {
      errs.partnerName = "Partner's / Spouse's full name is required";
    }

    if (isNaN(numberOfKids) || numberOfKids < 0) {
      errs.numberOfKids = 'Please provide a valid number of children (0 or more)';
    }

    if (!kinName.trim()) errs.kinName = 'Next of kin name is required';
    if (!kinPhone.trim()) errs.kinPhone = 'Next of kin contact is required';
    if (!agreementAccepted) errs.agreement = 'You must accept the association agreement';
    if (!photoDataUrl) errs.photo = 'Profile photograph is required';
    if (!signatureDataUrl) errs.signature = 'Member signature is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const newMarshal: MarshalRegistration = {
        id: 'marshal-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        staffNumber: staffNumber.trim(),
        firstName: firstName.trim(),
        surname: surname.trim(),
        position: position.trim(),
        residentialAddress: residentialAddress.trim(),
        homeTelNo: homeTelNo.trim() || 'N/A',
        cellNo: cellNo.trim(),
        whatsappNo: whatsappSameAsCell ? cellNo.trim() : whatsappNo.trim() || undefined,
        idNumber: idNumber.trim(),
        chiefOfArea: chiefOfArea.trim(),
        indvuna: indvuna.trim(),
        maritalStatus,
        partnerName: partnerName.trim() || undefined,
        numberOfKids: Math.max(0, Number(numberOfKids) || 0),
        nextOfKin: {
          fullName: kinName.trim(),
          relationship: kinRelationship.trim(),
          contactNumber: kinPhone.trim(),
        },
        region,
        agreementAccepted,
        signatureDataUrl,
        photoDataUrl,
        registrationDate,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: isOnline ? 'synced' : 'pending_sync',
        syncedAt: isOnline ? Date.now() : undefined,
        fieldOfficerName: fieldOfficerName.trim(),
      };

      onSuccess(newMarshal);
    } catch (err) {
      console.error('Submission failed', err);
      alert('Failed to register marshal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-4 sm:my-8 px-3 sm:px-6">
      {/* Quick Action Banner for Field Officers */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 p-3 rounded-xl bg-blue-50/80 border border-blue-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-700 flex-shrink-0" />
          <span className="text-xs font-semibold text-blue-900">
            Eswatini Field Officer Registration Terminal
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrefillSample}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
            title="Auto-fill with exact data from the uploaded paper form"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample from Form (Thulani Mkhatshwa #04)</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium transition"
            title="Clear all inputs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Main Registration Form Paper Layout */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden">
        {/* Authentic Association Header Banner */}
        <div className="bg-slate-900 text-white p-5 sm:p-7 border-b-4 border-amber-500 text-center relative">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="text-center sm:text-left flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-amber-400">
                  Swaziland Local Transport Association
                </h2>
                <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                  National Executive Committee
                </div>
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-center flex-shrink-0">
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Staff Number
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs font-mono font-bold text-amber-400">STAFF #:</span>
                <input
                  type="text"
                  value={staffNumber}
                  onChange={(e) => setStaffNumber(e.target.value)}
                  className="w-16 bg-slate-900 border border-amber-500/50 rounded px-1.5 py-0.5 text-sm font-mono font-bold text-white text-center focus:outline-none focus:ring-1 focus:ring-amber-400"
                  placeholder="04"
                />
              </div>
              {errors.staffNumber && (
                <span className="text-[10px] text-red-400 block mt-0.5">Required</span>
              )}
            </div>
          </div>

          <div className="mt-3 text-[11px] sm:text-xs text-slate-400 space-y-0.5">
            <div>
              First floor Office No. 11, Main Post office Building, Cnr. Martin & Nkoseluhlaza Street,
              MANZINI
            </div>
            <div>
              P. O. Box 4176, MANZINI M200, SWAZILAND • TEL/FAX: 2505 7796
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <span className="inline-block px-4 py-1 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-widest bg-amber-500 text-slate-950 shadow-xs">
              MARSHAL REGISTRATION
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          {/* Section 1: Photo & Primary Identification */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pb-6 border-b border-slate-200">
            <div className="md:col-span-5">
              <PhotoUpload
                value={photoDataUrl}
                onChange={setPhotoDataUrl}
                staffNumber={staffNumber}
              />
              {errors.photo && (
                <p className="mt-1 text-xs font-semibold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.photo}
                </p>
              )}
            </div>

            <div className="md:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    First Names <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Thulani Sdumo"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                      errors.firstName
                        ? 'border-red-400 bg-red-50/40 text-red-900'
                        : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  />
                  {errors.firstName && (
                    <span className="text-[11px] text-red-500 mt-1 block">{errors.firstName}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Surname <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="e.g. Mkhatshwa"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                      errors.surname
                        ? 'border-red-400 bg-red-50/40 text-red-900'
                        : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  />
                  {errors.surname && (
                    <span className="text-[11px] text-red-500 mt-1 block">{errors.surname}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Position / Rank <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Uniswa Marshal or Manzini Rank Marshal"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                    errors.position
                      ? 'border-red-400 bg-red-50/40 text-red-900'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {COMMON_POSITIONS.slice(0, 4).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPosition(p)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium transition"
                    >
                      {p}
                    </button>
                  ))}
                </div>
                {errors.position && (
                  <span className="text-[11px] text-red-500 mt-1 block">{errors.position}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Regional Branch (Eswatini District) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {REGIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRegion(r)}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition ${
                        region === r
                          ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Residential Details */}
          <div className="space-y-4 pb-6 border-b border-slate-200">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-700" />
              <span>Contact & Address Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Residential Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={residentialAddress}
                  onChange={(e) => setResidentialAddress(e.target.value)}
                  placeholder="e.g. Ndlavane"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                    errors.residentialAddress
                      ? 'border-red-400 bg-red-50/40 text-red-900'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
                {errors.residentialAddress && (
                  <span className="text-[11px] text-red-500 mt-1 block">
                    {errors.residentialAddress}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Cell Phone No. <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="tel"
                    value={cellNo}
                    onChange={(e) => setCellNo(e.target.value)}
                    placeholder="e.g. 76704181"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                      errors.cellNo
                        ? 'border-red-400 bg-red-50/40 text-red-900'
                        : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  MTN / Eswatini Mobile (8 digits)
                </span>
                {errors.cellNo && (
                  <span className="text-[11px] text-red-500 mt-0.5 block">{errors.cellNo}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Home Tel No.
                </label>
                <input
                  type="text"
                  value={homeTelNo}
                  onChange={(e) => setHomeTelNo(e.target.value)}
                  placeholder="e.g. N/A or 2505 1234"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Optional (enter N/A if none)
                </span>
              </div>
            </div>

            {/* WhatsApp Number (with Same-as-Cell shortcut) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  WhatsApp No.{' '}
                  <span className="text-slate-400 font-normal lowercase">(if applicable)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="tel"
                    value={whatsappNo}
                    onChange={(e) => {
                      setWhatsappNo(e.target.value);
                      if (whatsappSameAsCell && e.target.value !== cellNo) {
                        setWhatsappSameAsCell(false);
                      }
                    }}
                    placeholder="e.g. 76704181"
                    disabled={whatsappSameAsCell}
                    className={`w-full pl-9 pr-24 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition ${
                      errors.whatsappNo
                        ? 'border-red-400 bg-red-50/40 text-red-900'
                        : whatsappSameAsCell
                        ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900 cursor-not-allowed'
                        : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  />
                  {whatsappSameAsCell && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-1 rounded-md flex items-center gap-1">
                      <Copy className="w-3 h-3" />
                      Same as Cell
                    </span>
                  )}
                </div>
                {errors.whatsappNo && (
                  <span className="text-[11px] text-red-500 mt-1 block">{errors.whatsappNo}</span>
                )}
              </div>

              <div className="flex items-end">
                <label className="flex items-start gap-2 cursor-pointer w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-slate-100 transition select-none">
                  <input
                    type="checkbox"
                    checked={whatsappSameAsCell}
                    onChange={(e) => handleWhatsappCheckbox(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-800 leading-snug">
                    Same as Cell No.
                    <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                      Auto-fill WhatsApp with cell number
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Marital Profiling & Family Structure */}
          <div className="space-y-5 pb-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-600" />
                <span>Marital Profiling & Family Structure</span>
              </h3>
              <span className="text-[11px] font-medium text-slate-500">
                Demographic & family welfare profile
              </span>
            </div>

            <div className="bg-rose-50/40 border border-rose-100 rounded-2xl p-4 sm:p-5 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                  Marital Status <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MARITAL_STATUS_OPTIONS.map((opt) => {
                    const isSelected = maritalStatus === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setMaritalStatus(opt.value)}
                        className={`p-2.5 rounded-xl border text-left transition relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-rose-950 text-white border-rose-950 shadow-sm ring-2 ring-rose-500'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-rose-300 hover:bg-rose-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs leading-snug">{opt.label}</span>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                          )}
                        </div>
                        <span
                          className={`text-[10px] mt-1 block line-clamp-1 ${
                            isSelected ? 'text-rose-200' : 'text-slate-400'
                          }`}
                        >
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-1">
                <div className="md:col-span-7">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                    Partner / Spouse's Name{' '}
                    {maritalStatus === 'Married' ||
                    maritalStatus === 'Customary Marriage (Kuteka)' ||
                    maritalStatus === 'Civil / Religious Marriage' ||
                    maritalStatus === 'Cohabiting' ? (
                      <span className="text-red-500">* (Required)</span>
                    ) : (
                      <span className="text-slate-400 font-normal lowercase">
                        (optional for {maritalStatus})
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Users className="w-4 h-4 text-rose-500" />
                    </div>
                    <input
                      type="text"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder={
                        maritalStatus === 'Single'
                          ? 'N/A or enter partner name if applicable'
                          : 'e.g. Thandiwe Dube (Spouse / Partner)'
                      }
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none transition ${
                        errors.partnerName
                          ? 'border-red-400 bg-red-50/60 text-red-900'
                          : 'border-slate-300 bg-white text-slate-900'
                      }`}
                    />
                  </div>
                  {errors.partnerName && (
                    <span className="text-[11px] text-red-600 font-semibold mt-1 block">
                      {errors.partnerName}
                    </span>
                  )}
                </div>

                <div className="md:col-span-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                    Number of Kids (Children) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNumberOfKids((prev) => Math.max(0, prev - 1))}
                      className="w-10 h-10 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-700 active:scale-95 transition shadow-2xs flex-shrink-0"
                      title="Decrease kids count"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Baby className="w-4 h-4 text-amber-600" />
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={numberOfKids}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setNumberOfKids(isNaN(val) ? 0 : Math.max(0, val));
                        }}
                        className={`w-full pl-9 pr-3 py-2 text-center rounded-xl border font-mono font-bold text-base focus:ring-2 focus:ring-rose-500 focus:outline-none transition ${
                          errors.numberOfKids
                            ? 'border-red-400 bg-red-50 text-red-900'
                            : 'border-slate-300 bg-white text-slate-900'
                        }`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setNumberOfKids((prev) => prev + 1)}
                      className="w-10 h-10 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-700 active:scale-95 transition shadow-2xs flex-shrink-0"
                      title="Increase kids count"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Quick:</span>
                    {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setNumberOfKids(num)}
                        className={`text-[11px] px-2 py-0.5 rounded-md font-mono transition ${
                          numberOfKids === num
                            ? 'bg-rose-700 text-white font-bold'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-rose-50'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  {errors.numberOfKids && (
                    <span className="text-[11px] text-red-600 font-semibold mt-1 block">
                      {errors.numberOfKids}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Civic & Traditional Authority Identifiers */}
          <div className="space-y-4 pb-6 border-b border-slate-200">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-600" />
              <span>Civic & Traditional Authority Verification</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  I.D. Number (PIN) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="e.g. 8203296100441"
                    maxLength={13}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                      errors.idNumber
                        ? 'border-red-400 bg-red-50/40 text-red-900'
                        : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  13-digit Eswatini National ID
                </span>
                {errors.idNumber && (
                  <span className="text-[11px] text-red-500 mt-0.5 block">{errors.idNumber}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Chief of Area (Sikhulu) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={chiefOfArea}
                  onChange={(e) => setChiefOfArea(e.target.value)}
                  placeholder="e.g. Logcogco Dlamini"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                    errors.chiefOfArea
                      ? 'border-red-400 bg-red-50/40 text-red-900'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Umphakatsi Chiefdom
                </span>
                {errors.chiefOfArea && (
                  <span className="text-[11px] text-red-500 mt-0.5 block">
                    {errors.chiefOfArea}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Indvuna (Headman) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={indvuna}
                  onChange={(e) => setIndvuna(e.target.value)}
                  placeholder="e.g. Jan Mngometulu"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                    errors.indvuna
                      ? 'border-red-400 bg-red-50/40 text-red-900'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Traditional Authority Headman
                </span>
                {errors.indvuna && (
                  <span className="text-[11px] text-red-500 mt-0.5 block">{errors.indvuna}</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Next of Kin */}
          <div className="space-y-4 pb-6 border-b border-slate-200">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-rose-600" />
              <span>Next of Kin (Emergency Contact)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Next of Kin Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={kinName}
                  onChange={(e) => setKinName(e.target.value)}
                  placeholder="e.g. Thandiwe Dube"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                    errors.kinName
                      ? 'border-red-400 bg-red-50/40 text-red-900'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
                {errors.kinName && (
                  <span className="text-[11px] text-red-500 mt-1 block">{errors.kinName}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Relationship <span className="text-red-500">*</span>
                </label>
                <select
                  value={kinRelationship}
                  onChange={(e) => setKinRelationship(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                >
                  <option value="Wife">Wife</option>
                  <option value="Husband">Husband</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Kin Contact Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="tel"
                    value={kinPhone}
                    onChange={(e) => setKinPhone(e.target.value)}
                    placeholder="e.g. 76439772"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                      errors.kinPhone
                        ? 'border-red-400 bg-red-50/40 text-red-900'
                        : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  />
                </div>
                {errors.kinPhone && (
                  <span className="text-[11px] text-red-500 mt-1 block">{errors.kinPhone}</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 6: Agreement & Member's Signature */}
          <div className="space-y-5 pb-6 border-b border-slate-200">
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
              <div className="flex items-start gap-3">
                <input
                  id="agreement-checkbox"
                  type="checkbox"
                  checked={agreementAccepted}
                  onChange={(e) => setAgreementAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label
                  htmlFor="agreement-checkbox"
                  className="text-xs sm:text-sm text-slate-800 leading-relaxed font-serif select-none"
                >
                  <strong className="font-sans font-bold text-slate-900 block mb-0.5">
                    AGREEMENT:
                  </strong>
                  "The undersigned person has agreed that he/she will abide by rules and regulations
                  of the above named association (Swaziland Local Transport Association)."
                </label>
              </div>
              {errors.agreement && (
                <p className="mt-1.5 text-xs text-red-600 font-semibold">{errors.agreement}</p>
              )}
            </div>

            <div>
              <SignaturePad value={signatureDataUrl} onChange={setSignatureDataUrl} />
              {errors.signature && (
                <p className="mt-1 text-xs font-semibold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.signature}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  <Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                  Registration Date
                </label>
                <input
                  type="date"
                  value={registrationDate}
                  onChange={(e) => setRegistrationDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Field Officer In-Charge
                </label>
                <input
                  type="text"
                  value={fieldOfficerName}
                  onChange={(e) => setFieldOfficerName(e.target.value)}
                  placeholder="e.g. Officer D. Simelane"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Submission Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {isOnline
                  ? 'Active connection: Registration will save and synchronize immediately.'
                  : 'Offline mode: Registration will be saved to device storage and synced automatically once signal returns.'}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-98 disabled:opacity-50 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Submitting Registration...'
                  : isOnline
                  ? 'Submit Marshal Registration'
                  : 'Save Registration Offline'}
              </span>
            </button>
          </div>
        </form>

        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            REGIONAL BRANCHES: MANZINI • HHOHHO • SHISELWENI • LUBOMBO
          </span>
        </div>
      </div>
    </div>
  );
};
