import { supabase, TABLES } from './supabase';
import { storageService } from './storage';
import { MarshalRow } from '../types';

type StatusCallback = (status: 'connecting' | 'live' | 'error' | 'closed') => void;

class RealtimeManager {
  private channel: ReturnType<typeof supabase.channel> | null = null;
  private statusListeners: Set<StatusCallback> = new Set();
  private currentStatus: 'connecting' | 'live' | 'error' | 'closed' = 'closed';

  public subscribe(cb: StatusCallback): () => void {
    this.statusListeners.add(cb);
    cb(this.currentStatus);
    return () => {
      this.statusListeners.delete(cb);
    };
  }

  private setStatus(s: 'connecting' | 'live' | 'error' | 'closed') {
    this.currentStatus = s;
    this.statusListeners.forEach((cb) => {
      try {
        cb(s);
      } catch (e) {
        console.error('[Realtime] status listener error', e);
      }
    });
  }

  public start() {
    if (this.channel) return;

    this.setStatus('connecting');

    this.channel = supabase
      .channel('marshals-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: TABLES.marshals },
        (payload) => {
          console.log('[Realtime] INSERT', payload.new);
          storageService.applyRemoteChange(payload.new as MarshalRow).catch((e) =>
            console.warn('[Realtime] apply INSERT failed', e)
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: TABLES.marshals },
        (payload) => {
          console.log('[Realtime] UPDATE', payload.new);
          storageService.applyRemoteChange(payload.new as MarshalRow).catch((e) =>
            console.warn('[Realtime] apply UPDATE failed', e)
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: TABLES.marshals },
        (payload) => {
          console.log('[Realtime] DELETE', payload.old);
          const oldRow = payload.old as { id?: string };
          if (oldRow?.id) {
            storageService
              .applyRemoteDelete(oldRow.id)
              .catch((e) => console.warn('[Realtime] apply DELETE failed', e));
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] status:', status);
        if (status === 'SUBSCRIBED') {
          this.setStatus('live');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          this.setStatus('error');
        } else if (status === 'CLOSED') {
          this.setStatus('closed');
        }
      });
  }

  public stop() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.setStatus('closed');
  }
}

export const realtimeManager = new RealtimeManager();
