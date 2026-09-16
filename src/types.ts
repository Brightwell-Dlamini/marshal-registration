export type Region = 'Manzini' | 'Hhohho' | 'Shiselweni' | 'Lubombo';

export type SyncStatus = 'pending_sync' | 'syncing' | 'synced' | 'error';

export type MaritalStatus =
  | 'Married'
  | 'Single'
  | 'Customary Marriage (Kuteka)'
  | 'Civil / Religious Marriage'
  | 'Divorced'
  | 'Widowed'
  | 'Separated'
  | 'Cohabiting';

export interface NextOfKin {
  fullName: string;
  relationship: string;
  contactNumber: string;
}

export interface MarshalRegistration {
  id: string; // UUID or timestamp-based local identifier
  staffNumber: string; // e.g., "04" or "SLTA-04"
  firstName: string; // e.g. "Thulani Sdumo"
  surname: string; // e.g. "Mkhatshwa"
  position: string; // e.g. "Uniswa Marshal"
  residentialAddress: string; // e.g. "Ndlavane"
  homeTelNo: string; // e.g. "N/A" or "2505 1234"
  cellNo: string; // e.g. "76704181"
  idNumber: string; // 13-digit Eswatini National ID e.g. "8203296100441"
  chiefOfArea: string; // e.g. "Logcogco Dlamini"
  indvuna: string; // e.g. "Jan Mngometulu"
  // Marital & Family Profiling
  maritalStatus: MaritalStatus;
  partnerName?: string; // Partner / Spouse Full Name
  numberOfKids: number; // Number of children (>= 0)
  nextOfKin: NextOfKin;
  region: Region;
  agreementAccepted: boolean;
  signatureDataUrl?: string; // Digital signature image (base64)
  photoDataUrl?: string; // Profile portrait image (base64)
  registrationDate: string; // ISO string or YYYY-MM-DD
  createdAt: number; // Unix timestamp ms
  updatedAt: number;
  syncStatus: SyncStatus;
  syncedAt?: number;
  fieldOfficerName?: string;
  notes?: string;
}

export interface SyncLog {
  id: string;
  timestamp: number;
  action: 'online_sync' | 'manual_sync' | 'offline_queued';
  count: number;
  status: 'success' | 'failed';
  message: string;
}
