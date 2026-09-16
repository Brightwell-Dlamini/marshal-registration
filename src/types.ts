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
  id: string;
  staffNumber: string;
  firstName: string;
  surname: string;
  position: string;
  residentialAddress: string;
  homeTelNo: string;
  cellNo: string;
  idNumber: string;
  chiefOfArea: string;
  indvuna: string;

  maritalStatus: MaritalStatus;
  partnerName?: string;
  numberOfKids: number;

  nextOfKin: NextOfKin;
  region: Region;
  agreementAccepted: boolean;

  // Media: local data URLs (for immediate preview / offline cache)
  signatureDataUrl?: string;
  photoDataUrl?: string;

  // Media: remote storage paths (set after upload to Supabase Storage)
  photoStoragePath?: string;
  signatureStoragePath?: string;

  // Remote URLs (public CDN URLs from Supabase Storage)
  photoRemoteUrl?: string;
  signatureRemoteUrl?: string;

  registrationDate: string;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
  syncedAt?: number;
  fieldOfficerName?: string;
  notes?: string;
}

export interface SyncLog {
  id: string;
  timestamp: number;
  action: 'online_sync' | 'manual_sync' | 'offline_queued' | 'auto_sync';
  count: number;
  status: 'success' | 'failed';
  message: string;
}

// Shape of a row in the Supabase `marshals` table (snake_case)
export interface MarshalRow {
  id: string;
  staff_number: string;
  first_name: string;
  surname: string;
  position: string;
  residential_address: string;
  home_tel_no: string;
  cell_no: string;
  id_number: string;
  chief_of_area: string;
  indvuna: string;
  marital_status: string;
  partner_name: string | null;
  number_of_kids: number;
  next_of_kin_full_name: string;
  next_of_kin_relationship: string;
  next_of_kin_contact_number: string;
  region: string;
  agreement_accepted: boolean;
  registration_date: string;
  field_officer_name: string | null;
  notes: string | null;
  photo_storage_path: string | null;
  signature_storage_path: string | null;
  photo_data_url: string | null;
  signature_data_url: string | null;
  created_at: number;
  updated_at: number;
  synced_at: number | null;
  sync_status: string;
  server_created_at: string;
  server_updated_at: string;
}

export interface SyncLogRow {
  id: string;
  timestamp: number;
  action: string;
  count: number;
  status: string;
  message: string | null;
  created_at: string;
}
