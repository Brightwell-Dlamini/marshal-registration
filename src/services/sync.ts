import { useEffect, useState } from 'react';
import { storageService } from './storage';
import { SyncLog } from '../types';

class SyncManager {
  private isOnlineNative: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSimulatedOffline: boolean = false;
  private isSyncing: boolean = false;
  private lastSyncTime: number | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnlineNative = true;
        this.notify();
        if (!this.isSimulatedOffline) {
          this.triggerSync();
        }
      });

      window.addEventListener('offline', () => {
        this.isOnlineNative = false;
        this.notify();
      });

      // Storage changes might introduce new pending items
      storageService.subscribe(() => {
        this.notify();
      });
    }
  }

  public get isEffectiveOnline(): boolean {
    return this.isOnlineNative && !this.isSimulatedOffline;
  }

  public get simulatedOffline(): boolean {
    return this.isSimulatedOffline;
  }

  public get syncing(): boolean {
    return this.isSyncing;
  }

  public get lastSync(): number | null {
    return this.lastSyncTime;
  }

  public toggleSimulatedOffline(): void {
    this.isSimulatedOffline = !this.isSimulatedOffline;
    this.notify();
    if (this.isEffectiveOnline) {
      this.triggerSync();
    }
  }

  public setSimulatedOffline(val: boolean): void {
    this.isSimulatedOffline = val;
    this.notify();
    if (this.isEffectiveOnline) {
      this.triggerSync();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('Sync listener error:', err);
      }
    });
  }

  public async triggerSync(): Promise<{ success: boolean; syncedCount: number; message: string }> {
    if (this.isSyncing) {
      return { success: false, syncedCount: 0, message: 'Sync already in progress' };
    }

    if (!this.isEffectiveOnline) {
      return {
        success: false,
        syncedCount: 0,
        message: 'Cannot sync: Network is offline. Data queued securely on device.',
      };
    }

    const pending = await storageService.getPendingMarshals();
    if (pending.length === 0) {
      this.lastSyncTime = Date.now();
      this.notify();
      return { success: true, syncedCount: 0, message: 'All marshal records are up to date' };
    }

    this.isSyncing = true;
    this.notify();

    try {
      // Simulate remote server sync with realistic network turnaround
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Mark all pending marshals as synced
      const syncedIds = pending.map((m) => m.id);
      await storageService.markAsSynced(syncedIds);

      const log: SyncLog = {
        id: 'sync-' + Date.now(),
        timestamp: Date.now(),
        action: 'online_sync',
        count: syncedIds.length,
        status: 'success',
        message: `Successfully synced ${syncedIds.length} marshal registration(s) to central database`,
      };
      await storageService.addSyncLog(log);

      this.lastSyncTime = Date.now();
      this.isSyncing = false;
      this.notify();

      return {
        success: true,
        syncedCount: syncedIds.length,
        message: `Successfully synchronized ${syncedIds.length} marshal record(s)`,
      };
    } catch (err) {
      this.isSyncing = false;
      this.notify();
      const message = err instanceof Error ? err.message : 'Unknown sync error';
      return { success: false, syncedCount: 0, message };
    }
  }
}

export const syncManager = new SyncManager();

export function useSync() {
  const [, setTick] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const update = async () => {
      const pending = await storageService.getPendingMarshals();
      setPendingCount(pending.length);
      setTick((t) => t + 1);
    };

    update();
    const unsubSync = syncManager.subscribe(update);
    const unsubStorage = storageService.subscribe(update);

    return () => {
      unsubSync();
      unsubStorage();
    };
  }, []);

  return {
    isOnline: syncManager.isEffectiveOnline,
    isNativeOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSimulatedOffline: syncManager.simulatedOffline,
    isSyncing: syncManager.syncing,
    pendingCount,
    lastSyncTime: syncManager.lastSync,
    triggerSync: () => syncManager.triggerSync(),
    toggleSimulatedOffline: () => syncManager.toggleSimulatedOffline(),
  };
}
