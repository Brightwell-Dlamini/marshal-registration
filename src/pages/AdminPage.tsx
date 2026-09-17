import React, { useState, useEffect } from 'react';
import { MarshalRegistration } from '../types';
import { storageService } from '../services/storage';
import { realtimeManager } from '../services/realtime';
import { AdminHeader, AdminTab } from '../components/AdminHeader';
import { OfflineBanner } from '../components/OfflineBanner';
import { Dashboard } from '../components/Dashboard';
import { MarshalDirectory } from '../components/MarshalDirectory';
import { MarshalCardModal } from '../components/MarshalCardModal';
import { RegistrationForm } from '../components/RegistrationForm';
import { SyncLogViewer } from '../components/SyncLogViewer';
import { BulkPrintView } from '../components/BulkPrintView';

/**
 * Staff-only admin console: Dashboard + Directory (registry).
 * Editing a marshal opens the registration form within this page.
 */
export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [marshals, setMarshals] = useState<MarshalRegistration[]>([]);
  const [selectedMarshal, setSelectedMarshal] = useState<MarshalRegistration | null>(null);
  const [editingMarshal, setEditingMarshal] = useState<MarshalRegistration | null>(null);
  const [showSyncLogs, setShowSyncLogs] = useState(false);
  const [bulkPrintMarshals, setBulkPrintMarshals] = useState<MarshalRegistration[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const list = await storageService.getAllMarshals();
        if (mounted) {
          setMarshals(list);
          setIsLoading(false);
        }
      } catch (e) {
        console.error('Failed to load marshals:', e);
        if (mounted) setIsLoading(false);
      }
    };

    loadData();
    const unsubscribe = storageService.subscribe(() => {
      loadData();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    realtimeManager.start();
    return () => {
      realtimeManager.stop();
    };
  }, []);

  const handleEditSuccess = async (updated: MarshalRegistration) => {
    await storageService.saveMarshal(updated);
    const list = await storageService.getAllMarshals();
    setMarshals(list);
    setEditingMarshal(null);
    setActiveTab('directory');
  };

  const handleDeleteMarshal = async (id: string) => {
    await storageService.deleteMarshal(id);
    const list = await storageService.getAllMarshals();
    setMarshals(list);
  };

  const handleEditFromDirectory = (m: MarshalRegistration) => {
    setEditingMarshal(m);
    setSelectedMarshal(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Editing takes over the main area
  if (editingMarshal) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col selection:bg-amber-400 selection:text-slate-900">
        <AdminHeader
          currentTab={activeTab}
          onSelectTab={(tab) => {
            setEditingMarshal(null);
            setActiveTab(tab);
          }}
          totalMarshalsCount={marshals.length}
          onOpenSyncLogs={() => setShowSyncLogs(true)}
        />
        <OfflineBanner />
        <main className="flex-1 pb-16">
          <RegistrationForm
            onSuccess={handleEditSuccess}
            editingMarshal={editingMarshal}
            onCancelEdit={() => {
              setEditingMarshal(null);
              setActiveTab('directory');
            }}
          />
        </main>
        {showSyncLogs && <SyncLogViewer onClose={() => setShowSyncLogs(false)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col selection:bg-amber-400 selection:text-slate-900">
      <AdminHeader
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        totalMarshalsCount={marshals.length}
        onOpenSyncLogs={() => setShowSyncLogs(true)}
      />

      <OfflineBanner />

      <main className="flex-1 pb-16">
        {isLoading ? (
          <div className="max-w-md mx-auto my-20 p-8 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Loading admin console…
            </p>
          </div>
        ) : activeTab === 'dashboard' ? (
          <Dashboard marshals={marshals} />
        ) : (
          <MarshalDirectory
            marshals={marshals}
            onSelectMarshal={(m) => setSelectedMarshal(m)}
            onEditMarshal={handleEditFromDirectory}
            onDeleteMarshal={handleDeleteMarshal}
            onGoToRegister={() => {
              // New registrations happen on the public form
              window.location.href = '/';
            }}
            onBulkPrint={(list) => setBulkPrintMarshals(list)}
          />
        )}
      </main>

      <MarshalCardModal
        marshal={selectedMarshal}
        onClose={() => setSelectedMarshal(null)}
        onEdit={(m) => {
          setSelectedMarshal(null);
          handleEditFromDirectory(m);
        }}
      />

      {showSyncLogs && <SyncLogViewer onClose={() => setShowSyncLogs(false)} />}

      {bulkPrintMarshals && (
        <BulkPrintView
          marshals={bulkPrintMarshals}
          onClose={() => setBulkPrintMarshals(null)}
        />
      )}
    </div>
  );
};
