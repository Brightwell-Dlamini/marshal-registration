import { MarshalRegistration, MarshalRow } from '../types';
import {
  supabase,
  STORAGE_BUCKETS,
  TABLES,
  dataUrlToBlob,
  getExtensionFromDataUrl,
} from './supabase';

const DB_NAME = 'EswatiniMarshalsDB';
const DB_VERSION = 1;
const STORE_MARSHALS = 'marshals';
const LOCAL_STORAGE_BACKUP_KEY = 'eswatini_marshals_backup_v2';

export const SAMPLE_INITIAL_MARSHAL: MarshalRegistration = {
  id: 'sample-04-mkhatshwa',
  staffNumber: '04',
  firstName: 'Thulani Sdumo',
  surname: 'Mkhatshwa',
  position: 'Uniswa Marshal',
  residentialAddress: 'Ndlavane',
  homeTelNo: 'N/A',
  cellNo: '76704181',
  whatsappNo: '76704181',
  idNumber: '8203296100441',
  chiefOfArea: 'Logcogco Dlamini',
  indvuna: 'Jan Mngometulu',
  maritalStatus: 'Married',
  partnerName: 'Thandiwe Dube',
  numberOfKids: 3,
  nextOfKin: {
    fullName: 'Thandiwe Dube',
    relationship: 'Wife',
    contactNumber: '76439772',
  },
  region: 'Manzini',
  agreementAccepted: true,
  registrationDate: '2024-02-16',
  createdAt: Date.now() - 86400000 * 5,
  updatedAt: Date.now() - 86400000 * 5,
  syncStatus: 'pending_sync',
  fieldOfficerName: 'Officer D. Simelane (Manzini Depot)',
};

// =============================================================
// CONVERSION
// =============================================================
function marshalToRow(
  m: MarshalRegistration,
  opts: { stripBase64?: boolean } = {}
): Omit<MarshalRow, 'server_created_at' | 'server_updated_at'> {
  const strip = opts.stripBase64 === true;
  return {
    id: m.id,
    staff_number: m.staffNumber,
    first_name: m.firstName,
    surname: m.surname,
    position: m.position,
    residential_address: m.residentialAddress,
    home_tel_no: m.homeTelNo || 'N/A',
    cell_no: m.cellNo,
    whatsapp_no: m.whatsappNo?.trim() || null,
    id_number: m.idNumber,
    chief_of_area: m.chiefOfArea,
    indvuna: m.indvuna,
    marital_status: m.maritalStatus || 'Single',
    partner_name: m.partnerName ?? null,
    number_of_kids: m.numberOfKids ?? 0,
    next_of_kin_full_name: m.nextOfKin.fullName,
    next_of_kin_relationship: m.nextOfKin.relationship,
    next_of_kin_contact_number: m.nextOfKin.contactNumber,
    region: m.region,
    agreement_accepted: m.agreementAccepted,
    registration_date: m.registrationDate,
    field_officer_name: m.fieldOfficerName ?? null,
    notes: m.notes ?? null,
    photo_storage_path: m.photoStoragePath ?? null,
    signature_storage_path: m.signatureStoragePath ?? null,
    // P2.2: strip base64 once it's safely uploaded to Storage
    photo_data_url: strip ? null : m.photoDataUrl ?? null,
    signature_data_url: strip ? null : m.signatureDataUrl ?? null,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
    synced_at: m.syncedAt ?? null,
    sync_status: m.syncStatus,
  };
}

function rowToMarshal(r: MarshalRow): MarshalRegistration {
  const photoRemoteUrl = r.photo_storage_path
    ? supabase.storage.from(STORAGE_BUCKETS.photos).getPublicUrl(r.photo_storage_path).data.publicUrl
    : undefined;

  const signatureRemoteUrl = r.signature_storage_path
    ? supabase.storage
        .from(STORAGE_BUCKETS.signatures)
        .getPublicUrl(r.signature_storage_path).data.publicUrl
    : undefined;

  return {
    id: r.id,
    staffNumber: r.staff_number,
    firstName: r.first_name,
    surname: r.surname,
    position: r.position,
    residentialAddress: r.residential_address,
    homeTelNo: r.home_tel_no,
    cellNo: r.cell_no,
    whatsappNo: r.whatsapp_no ?? undefined,
    idNumber: r.id_number,
    chiefOfArea: r.chief_of_area,
    indvuna: r.indvuna,
    maritalStatus: (r.marital_status as MarshalRegistration['maritalStatus']) || 'Single',
    partnerName: r.partner_name ?? undefined,
    numberOfKids: r.number_of_kids ?? 0,
    nextOfKin: {
      fullName: r.next_of_kin_full_name,
      relationship: r.next_of_kin_relationship,
      contactNumber: r.next_of_kin_contact_number,
    },
    region: (r.region as MarshalRegistration['region']) || 'Manzini',
    agreementAccepted: r.agreement_accepted,
    registrationDate: r.registration_date,
    fieldOfficerName: r.field_officer_name ?? undefined,
    notes: r.notes ?? undefined,
    photoStoragePath: r.photo_storage_path ?? undefined,
    signatureStoragePath: r.signature_storage_path ?? undefined,
    photoDataUrl: r.photo_data_url ?? undefined,
    signatureDataUrl: r.signature_data_url ?? undefined,
    photoRemoteUrl,
    signatureRemoteUrl,
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
    syncStatus: (r.sync_status as MarshalRegistration['syncStatus']) || 'synced',
    syncedAt: r.synced_at ?? undefined,
  };
}

// =============================================================
// INDEXEDDB
// =============================================================
class IDBCache {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private open(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB not supported'));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_MARSHALS)) {
          const store = db.createObjectStore(STORE_MARSHALS, { keyPath: 'id' });
          store.createIndex('syncStatus', 'syncStatus', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return this.dbPromise;
  }

  async getAll(): Promise<MarshalRegistration[]> {
    try {
      const db = await this.open();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_MARSHALS, 'readonly');
        const req = tx.objectStore(STORE_MARSHALS).getAll();
        req.onsuccess = () => {
          const results = (req.result || []) as MarshalRegistration[];
          results.sort((a, b) => b.createdAt - a.createdAt);
          resolve(results);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return this.getFromLocalStorage();
    }
  }

  async put(m: MarshalRegistration): Promise<void> {
    try {
      const db = await this.open();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_MARSHALS, 'readwrite');
        const req = tx.objectStore(STORE_MARSHALS).put(m);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = this.getFromLocalStorage().filter((x) => x.id !== m.id);
      list.unshift(m);
      this.saveToLocalStorage(list);
    }
  }

  async putMany(items: MarshalRegistration[]): Promise<void> {
    for (const item of items) await this.put(item);
  }

  async delete(id: string): Promise<void> {
    try {
      const db = await this.open();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_MARSHALS, 'readwrite');
        const req = tx.objectStore(STORE_MARSHALS).delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = this.getFromLocalStorage().filter((x) => x.id !== id);
      this.saveToLocalStorage(list);
    }
  }

  private getFromLocalStorage(): MarshalRegistration[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as MarshalRegistration[];
      }
    } catch {
      /* noop */
    }
    return [];
  }

  private saveToLocalStorage(items: MarshalRegistration[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('[Storage] localStorage quota exceeded', e);
    }
  }
}

const idbCache = new IDBCache();

// =============================================================
// STORAGE SERVICE
// =============================================================
class StorageService {
  private changeListeners: Array<() => void> = [];

  public subscribe(listener: () => void): () => void {
    this.changeListeners.push(listener);
    return () => {
      this.changeListeners = this.changeListeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.changeListeners.forEach((l) => {
      try {
        l();
      } catch (e) {
        console.error('[Storage] listener error', e);
      }
    });
  }

  public async getAllMarshals(): Promise<MarshalRegistration[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.marshals)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const remoteMarshals = ((data || []) as MarshalRow[]).map(rowToMarshal);
      await idbCache.putMany(remoteMarshals);

      const local = await idbCache.getAll();
      const pendingLocal = local.filter(
        (m) => m.syncStatus === 'pending_sync' || m.syncStatus === 'error'
      );
      const remoteIds = new Set(remoteMarshals.map((m) => m.id));
      const onlyLocalPending = pendingLocal.filter((m) => !remoteIds.has(m.id));

      const merged = [...onlyLocalPending, ...remoteMarshals];
      merged.sort((a, b) => b.createdAt - a.createdAt);
      return merged;
    } catch (err) {
      console.warn('[Storage] Remote fetch failed, using IndexedDB cache', err);
      return idbCache.getAll();
    }
  }

  public async getMarshalById(id: string): Promise<MarshalRegistration | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.marshals)
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data ? rowToMarshal(data as MarshalRow) : null;
    } catch {
      const all = await idbCache.getAll();
      return all.find((m) => m.id === id) || null;
    }
  }

  /**
   * P2.7 — Duplicate detection by National ID number.
   * Returns the existing marshal if a match exists (excluding `excludeId`).
   */
  public async findDuplicateByIdNumber(
    idNumber: string,
    excludeId?: string
  ): Promise<MarshalRegistration | null> {
    const trimmed = idNumber.trim();
    if (!trimmed) return null;

    try {
      let query = supabase
        .from(TABLES.marshals)
        .select('*')
        .eq('id_number', trimmed)
        .limit(2);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        return rowToMarshal(data[0] as MarshalRow);
      }
      return null;
    } catch (err) {
      // Fallback: check local cache
      const all = await idbCache.getAll();
      const match = all.find(
        (m) => m.idNumber.trim() === trimmed && (!excludeId || m.id !== excludeId)
      );
      return match || null;
    }
  }

  public async getPendingMarshals(): Promise<MarshalRegistration[]> {
    const all = await idbCache.getAll();
    return all.filter((m) => m.syncStatus === 'pending_sync' || m.syncStatus === 'error');
  }

  public async saveMarshal(marshal: MarshalRegistration): Promise<MarshalRegistration> {
    await idbCache.put(marshal);
    this.notify();

    try {
      const uploaded = await this.uploadMediaAndSync(marshal);
      await idbCache.put(uploaded);
      this.notify();
      return uploaded;
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      console.warn('[Storage] Local save succeeded, remote sync failed:', message);
      const failed: MarshalRegistration = {
        ...marshal,
        syncStatus: 'pending_sync',
        updatedAt: Date.now(),
      };
      await idbCache.put(failed);
      this.notify();
      return failed;
    }
  }

  public async deleteMarshal(id: string): Promise<void> {
    await idbCache.delete(id);
    this.notify();

    try {
      const { data } = await supabase
        .from(TABLES.marshals)
        .select('photo_storage_path, signature_storage_path')
        .eq('id', id)
        .maybeSingle();

      if (data) {
        const row = data as {
          photo_storage_path: string | null;
          signature_storage_path: string | null;
        };
        if (row.photo_storage_path) {
          await supabase.storage.from(STORAGE_BUCKETS.photos).remove([row.photo_storage_path]);
        }
        if (row.signature_storage_path) {
          await supabase.storage
            .from(STORAGE_BUCKETS.signatures)
            .remove([row.signature_storage_path]);
        }
      }

      await supabase.from(TABLES.marshals).delete().eq('id', id);
    } catch (err) {
      console.warn('[Storage] Remote delete failed (local already deleted)', err);
    }
  }

  private async uploadMediaAndSync(marshal: MarshalRegistration): Promise<MarshalRegistration> {
    let photoStoragePath = marshal.photoStoragePath;
    let signatureStoragePath = marshal.signatureStoragePath;

    // Upload photo if we have a data URL and no remote path yet
    if (marshal.photoDataUrl && !photoStoragePath) {
      const ext = getExtensionFromDataUrl(marshal.photoDataUrl);
      const path = `${marshal.id}/photo.${ext}`;
      const blob = dataUrlToBlob(marshal.photoDataUrl);

      const { error: upErr } = await supabase.storage
        .from(STORAGE_BUCKETS.photos)
        .upload(path, blob, { upsert: true, contentType: blob.type });

      if (upErr) {
        throw new Error(
          `Photo upload failed: ${upErr.message} (bucket=${STORAGE_BUCKETS.photos}, path=${path})`
        );
      }
      photoStoragePath = path;
    }

    if (marshal.signatureDataUrl && !signatureStoragePath) {
      const ext = getExtensionFromDataUrl(marshal.signatureDataUrl);
      const path = `${marshal.id}/signature.${ext}`;
      const blob = dataUrlToBlob(marshal.signatureDataUrl);

      const { error: upErr } = await supabase.storage
        .from(STORAGE_BUCKETS.signatures)
        .upload(path, blob, { upsert: true, contentType: blob.type });

      if (upErr) {
        throw new Error(
          `Signature upload failed: ${upErr.message} (bucket=${STORAGE_BUCKETS.signatures}, path=${path})`
        );
      }
      signatureStoragePath = path;
    }

    const now = Date.now();
    const photoRemoteUrl = photoStoragePath
      ? supabase.storage.from(STORAGE_BUCKETS.photos).getPublicUrl(photoStoragePath).data.publicUrl
      : undefined;
    const signatureRemoteUrl = signatureStoragePath
      ? supabase.storage
          .from(STORAGE_BUCKETS.signatures)
          .getPublicUrl(signatureStoragePath).data.publicUrl
      : undefined;

    // P2.2: build the "synced" marshal WITHOUT base64 (they're now on the CDN)
    const syncedMarshal: MarshalRegistration = {
      ...marshal,
      photoStoragePath,
      signatureStoragePath,
      photoRemoteUrl,
      signatureRemoteUrl,
      photoDataUrl: undefined, // stripped
      signatureDataUrl: undefined, // stripped
      syncStatus: 'synced',
      syncedAt: now,
      updatedAt: now,
    };

    // P2.2: also strip base64 in the DB row
    const row = marshalToRow(syncedMarshal, { stripBase64: true });

    const { error: dbErr } = await supabase
      .from(TABLES.marshals)
      .upsert(row, { onConflict: 'id' });

    if (dbErr) {
      throw new Error(
        `DB upsert failed: ${dbErr.message} (code=${dbErr.code}, details=${dbErr.details ?? 'n/a'}, hint=${dbErr.hint ?? 'n/a'})`
      );
    }

    return syncedMarshal;
  }

  public async syncPendingMarshals(
    onProgress?: (done: number, total: number) => void
  ): Promise<{ syncedCount: number; failedCount: number; failedIds: string[] }> {
    const pending = await this.getPendingMarshals();
    const failedIds: string[] = [];
    let synced = 0;

    for (let i = 0; i < pending.length; i++) {
      const m = pending[i];
      try {
        const result = await this.uploadMediaAndSync({ ...m, syncStatus: 'syncing' });
        await idbCache.put(result);
        synced++;
      } catch (err) {
        const message = err instanceof Error ? err.message : JSON.stringify(err);
        console.error(`[Sync] Failed to sync ${m.id}:`, message);
        failedIds.push(m.id);
        await idbCache.put({ ...m, syncStatus: 'error', updatedAt: Date.now() });
      }
      if (onProgress) onProgress(i + 1, pending.length);
      this.notify();
    }

    return { syncedCount: synced, failedCount: failedIds.length, failedIds };
  }

  public async addSyncLog(log: {
    id: string;
    timestamp: number;
    action: string;
    count: number;
    status: string;
    message: string;
  }): Promise<void> {
    try {
      await supabase.from(TABLES.syncLogs).upsert(
        {
          id: log.id,
          timestamp: log.timestamp,
          action: log.action,
          count: log.count,
          status: log.status,
          message: log.message,
        },
        { onConflict: 'id' }
      );
    } catch (e) {
      console.warn('[Storage] Failed to write sync log', e);
    }
  }

  /** P2.9 — Fetch sync logs for the log viewer */
  public async getSyncLogs(limit = 50): Promise<import('../types').SyncLogRow[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.syncLogs)
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as import('../types').SyncLogRow[];
    } catch (err) {
      console.warn('[Storage] Failed to fetch sync logs', err);
      return [];
    }
  }

  /** P2.8 — Apply a remote realtime event to the local cache */
  public async applyRemoteChange(row: MarshalRow): Promise<void> {
    const m = rowToMarshal(row);
    await idbCache.put(m);
    this.notify();
  }

  /** P2.8 — Apply a remote realtime DELETE */
  public async applyRemoteDelete(id: string): Promise<void> {
    await idbCache.delete(id);
    this.notify();
  }
}

export const storageService = new StorageService();
