import React, { useState, useEffect } from 'react';
import { MarshalRegistration } from './types';
import { storageService } from './services/storage';
import { realtimeManager } from './services/realtime';
import { Header } from './components/Header';
import { OfflineBanner } from './components/OfflineBanner';
import { RegistrationForm } from './components/RegistrationForm';
import { MarshalDirectory } from './components/MarshalDirectory';
import { MarshalCardModal } from './components/MarshalCardModal';
import { SuccessModal } from './components/SuccessModal';
import { Dashboard } from './components/Dashboard';
import { SyncLogViewer } from './components/SyncLogViewer';
import { BulkPrintView } from './components/BulkPrintView';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'register' | 'directory'>('dashboard');
  const [marshals, setMarshals] = useState<MarshalRegistration[]>([]);
  const [selectedMarshal, setSelectedMarshal] = useState<MarshalRegistration | null>(null);
  const [successMarshal, setSuccessMarshal] = useState<MarshalRegistration | null>(null);
  const [editingMarshal, setEditingMarshal] = useState<MarshalRegistration | null>(null);
  const [showSyncLogs, setShowSyncLogs] = useState(false);
  const [bulkPrintMarshals, setBulkPrintMarshals] = useState<MarshalRegistration[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load + subscribe to storage changes
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

  // P2.8 — Start real-time subscription once on mount
  useEffect(() => {
    realtimeManager.start();
    return () => {
      realtimeManager.stop();
    };
  }, []);

  const handleSuccessRegistration = async (newMarshal: MarshalRegistration) => {
    await storageService.saveMarshal(newMarshal);
    const updated = await storageService.getAllMarshals();
    setMarshals(updated);
    setSuccessMarshal(newMarshal);
    // If we were editing, exit edit mode
    if (editingMarshal) {
      setEditingMarshal(null);
      setActiveTab('directory');
    }
  };

  const handleDeleteMarshal = async (id: string) => {
    await storageService.deleteMarshal(id);
    const updated = await storageService.getAllMarshals();
    setMarshals(updated);
  };

  const handleEditFromDirectory = (m: MarshalRegistration) => {
    setEditingMarshal(m);
    setSelectedMarshal(null);
    setActiveTab('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingMarshal(null);
    setActiveTab('directory');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col selection:bg-amber-400 selection:text-slate-900">
      <Header
        currentTab={activeTab}
        onSelectTab={(tab) => {
          if (tab !== 'register') setEditingMarshal(null);
          setActiveTab(tab);
        }}
        totalMarshalsCount={marshals.length}
        onOpenSyncLogs={() => setShowSyncLogs(true)}
      />

      <OfflineBanner />

      <main className="flex-1 pb-16">
        {isLoading ? (
          <div className="max-w-md mx-auto my-20 p-8 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Initializing Eswatini Marshals Registry...
            </p>
          </div>
        ) : activeTab === 'dashboard' ? (
          <Dashboard marshals={marshals} />
        ) : activeTab === 'register' ? (
          <RegistrationForm
            onSuccess={handleSuccessRegistration}
            editingMarshal={editingMarshal}
            onCancelEdit={handleCancelEdit}
          />
        ) : (
          <MarshalDirectory
            marshals={marshals}
            onSelectMarshal={(m) => setSelectedMarshal(m)}
            onEditMarshal={handleEditFromDirectory}
            onDeleteMarshal={handleDeleteMarshal}
            onGoToRegister={() => {
              setEditingMarshal(null);
              setActiveTab('register');
            }}
            onBulkPrint={(list) => setBulkPrintMarshals(list)}
          />
        )}
      </main>

      {/* Modals */}
      <MarshalCardModal
        marshal={selectedMarshal}
        onClose={() => setSelectedMarshal(null)}
        onEdit={(m) => {
          setSelectedMarshal(null);
          handleEditFromDirectory(m);
        }}
      />

      <SuccessModal
        marshal={successMarshal}
        onClose={() => setSuccessMarshal(null)}
        onViewRecord={(m) => {
          setSuccessMarshal(null);
          setSelectedMarshal(m);
        }}
        onRegisterAnother={() => {
          setSuccessMarshal(null);
          setEditingMarshal(null);
          setActiveTab('register');
          window.scrollTo({ top: 0, behavior: 'smooth' });
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
}
