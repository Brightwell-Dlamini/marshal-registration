import { MarshalRegistration, SyncLog } from '../types';

const DB_NAME = 'EswatiniMarshalsDB';
const DB_VERSION = 1;
const STORE_MARSHALS = 'marshals';
const STORE_LOGS = 'sync_logs';
const LOCAL_STORAGE_BACKUP_KEY = 'eswatini_marshals_backup';

// Initial sample marshal matching the user's uploaded paper form!
export const SAMPLE_INITIAL_MARSHAL: MarshalRegistration = {
  id: 'sample-04-mkhatshwa',
  staffNumber: '04',
  firstName: 'Thulani Sdumo',
  surname: 'Mkhatshwa',
  position: 'Uniswa Marshal',
  residentialAddress: 'Ndlavane',
  homeTelNo: 'N/A',
  cellNo: '76704181',
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
  syncStatus: 'synced',
  syncedAt: Date.now() - 86400000 * 5,
  fieldOfficerName: 'Officer D. Simelane (Manzini Depot)',
  // SVG portrait placeholder resembling the officer in the photo
  photoDataUrl:
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
    `),
};

class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private changeListeners: Array<() => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initDB();
    }
  }

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
      } catch (err) {
        console.error('Storage listener error:', err);
      }
    });
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        console.warn('IndexedDB not supported, falling back to LocalStorage');
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_MARSHALS)) {
          const marshalStore = db.createObjectStore(STORE_MARSHALS, { keyPath: 'id' });
          marshalStore.createIndex('staffNumber', 'staffNumber', { unique: false });
          marshalStore.createIndex('syncStatus', 'syncStatus', { unique: false });
          marshalStore.createIndex('region', 'region', { unique: false });
          marshalStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_LOGS)) {
          db.createObjectStore(STORE_LOGS, { keyPath: 'id' });
        }
      };

      request.onsuccess = async () => {
        const db = request.result;
        // Seed initial sample record if completely empty
        try {
          const count = await this.countMarshals(db);
          if (count === 0) {
            const tx = db.transaction(STORE_MARSHALS, 'readwrite');
            tx.objectStore(STORE_MARSHALS).add(SAMPLE_INITIAL_MARSHAL);
            this.syncToLocalStorage([SAMPLE_INITIAL_MARSHAL]);
          }
        } catch (e) {
          console.warn('Could not check seed status:', e);
        }
        resolve(db);
      };

      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  private countMarshals(db: IDBDatabase): Promise<number> {
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_MARSHALS, 'readonly');
      const countReq = tx.objectStore(STORE_MARSHALS).count();
      countReq.onsuccess = () => resolve(countReq.result);
      countReq.onerror = () => resolve(0);
    });
  }

  // Backup to localStorage for safety
  private syncToLocalStorage(marshals: MarshalRegistration[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(marshals));
    } catch (e) {
      console.warn('LocalStorage backup quota reached or unavailable', e);
    }
  }

  private normalizeMarshal(m: MarshalRegistration): MarshalRegistration {
    return {
      ...m,
      maritalStatus: m.maritalStatus || 'Married',
      partnerName: m.partnerName ?? (m.nextOfKin?.relationship === 'Wife' || m.nextOfKin?.relationship === 'Husband' ? m.nextOfKin.fullName : ''),
      numberOfKids: typeof m.numberOfKids === 'number' ? m.numberOfKids : 0,
    };
  }

  private getFromLocalStorage(): MarshalRegistration[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => this.normalizeMarshal(item));
        }
      }
    } catch (e) {
      console.warn('Error reading from LocalStorage backup', e);
    }
    return [SAMPLE_INITIAL_MARSHAL];
  }

  public async getAllMarshals(): Promise<MarshalRegistration[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_MARSHALS, 'readonly');
        const store = tx.objectStore(STORE_MARSHALS);
        const req = store.getAll();

        req.onsuccess = () => {
          const rawResults: MarshalRegistration[] = req.result || [];
          const results = rawResults.map((item) => this.normalizeMarshal(item));
          results.sort((a, b) => b.createdAt - a.createdAt);
          this.syncToLocalStorage(results);
          resolve(results);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Falling back to LocalStorage for getAllMarshals', err);
      return this.getFromLocalStorage();
    }
  }

  public async getMarshalById(id: string): Promise<MarshalRegistration | null> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_MARSHALS, 'readonly');
        const store = tx.objectStore(STORE_MARSHALS);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      const list = this.getFromLocalStorage();
      return list.find((m) => m.id === id) || null;
    }
  }

  public async saveMarshal(marshal: MarshalRegistration): Promise<void> {
    try {
      const db = await this.initDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_MARSHALS, 'readwrite');
        const store = tx.objectStore(STORE_MARSHALS);
        const req = store.put(marshal);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('IndexedDB save failed, saving to LocalStorage', err);
      const list = this.getFromLocalStorage().filter((m) => m.id !== marshal.id);
      list.unshift(marshal);
      this.syncToLocalStorage(list);
    }
    this.notify();
  }

  public async deleteMarshal(id: string): Promise<void> {
    try {
      const db = await this.initDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_MARSHALS, 'readwrite');
        const store = tx.objectStore(STORE_MARSHALS);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('IndexedDB delete failed, deleting from LocalStorage', err);
      const list = this.getFromLocalStorage().filter((m) => m.id !== id);
      this.syncToLocalStorage(list);
    }
    this.notify();
  }

  public async getPendingMarshals(): Promise<MarshalRegistration[]> {
    const all = await this.getAllMarshals();
    return all.filter((m) => m.syncStatus === 'pending_sync' || m.syncStatus === 'error');
  }

  public async markAsSynced(ids: string[]): Promise<void> {
    const all = await this.getAllMarshals();
    const idSet = new Set(ids);
    const now = Date.now();

    for (const item of all) {
      if (idSet.has(item.id)) {
        item.syncStatus = 'synced';
        item.syncedAt = now;
        await this.saveMarshal(item);
      }
    }
    this.notify();
  }

  public async addSyncLog(log: SyncLog): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction(STORE_LOGS, 'readwrite');
      tx.objectStore(STORE_LOGS).put(log);
    } catch (e) {
      // Ignored non-critical log failure
    }
  }
}

export const storageService = new StorageService();
