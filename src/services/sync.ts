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
          // Auto-sync when connection returns
          this.triggerSync('auto_sync').catch(() => {});
        }
      });

      window.addEventListener('offline', () => {
        this.isOnlineNative = false;
        this.notify();
      });

      storageService.subscribe(() => this.notify());

      // Auto-sync every 60 seconds while online
      setInterval(() => {
        if (this.isEffectiveOnline && !this.isSyncing) {
          this.triggerSync('auto_sync').catch(() => {});
        }
      }, 60_000);
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
      this.triggerSync('manual_sync').catch(() => {});
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
      } catch (e) {
        console.error('[Sync] listener error', e);
      }
    });
  }

  public async triggerSync(
    action: 'online_sync' | 'manual_sync' | 'auto_sync' = 'manual_sync'
  ): Promise<{ success: boolean; syncedCount: number; message: string }> {
    if (this.isSyncing) {
      return { success: false, syncedCount: 0, message: 'Sync already in progress' };
    }

    if (!this.isEffectiveOnline) {
      return {
        success: false,
        syncedCount: 0,
        message: 'Cannot sync: Network is offline.',
      };
    }

    const pending = await storageService.getPendingMarshals();
    if (pending.length === 0) {
      this.lastSyncTime = Date.now();
      this.notify();
      return { success: true, syncedCount: 0, message: 'All records up to date' };
    }

    this.isSyncing = true;
    this.notify();

    try {
      const result = await storageService.syncPendingMarshals();

      const log: SyncLog = {
        id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
        action,
        count: result.syncedCount,
        status: result.failedCount === 0 ? 'success' : 'failed',
        message:
          result.failedCount === 0
            ? `Synced ${result.syncedCount} record(s) to Supabase`
            : `Synced ${result.syncedCount}, failed ${result.failedCount}`,
      };

      await storageService.addSyncLog(log);

      this.lastSyncTime = Date.now();
      this.isSyncing = false;
      this.notify();

      return {
        success: result.failedCount === 0,
        syncedCount: result.syncedCount,
        message: log.message,
      };
    } catch (err) {
      this.isSyncing = false;
      this.notify();
      const message = err instanceof Error ? err.message : 'Unknown sync error';
      console.error('[Sync] Fatal error', err);
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
    triggerSync: () => syncManager.triggerSync('manual_sync'),
    toggleSimulatedOffline: () => syncManager.toggleSimulatedOffline(),
  };
}
