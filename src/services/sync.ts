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

  public get syncing():
