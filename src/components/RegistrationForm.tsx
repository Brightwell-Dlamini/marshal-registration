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
        syncStatus: isOnline ? 'synced' : '
