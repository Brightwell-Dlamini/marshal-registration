/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MarshalRegistration } from './types';
import { storageService } from './services/storage';
import { Header } from './components/Header';
import { OfflineBanner } from './components/OfflineBanner';
import { RegistrationForm } from './components/RegistrationForm';
import { MarshalDirectory } from './components/MarshalDirectory';
import { MarshalCardModal } from './components/MarshalCardModal';
import { SuccessModal } from './components/SuccessModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'register' | 'directory'>('register');
  const [marshals, setMarshals] = useState<MarshalRegistration[]>([]);
  const [selectedMarshal, setSelectedMarshal] = useState<MarshalRegistration | null>(null);
  const [successMarshal, setSuccessMarshal] = useState<MarshalRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load marshals on mount and subscribe to changes
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

  const handleSuccessRegistration = async (newMarshal: MarshalRegistration) => {
    await storageService.saveMarshal(newMarshal);
    const updated = await storageService.getAllMarshals();
    setMarshals(updated);
    setSuccessMarshal(newMarshal);
  };

  const handleDeleteMarshal = async (id: string) => {
    await storageService.deleteMarshal(id);
    const updated = await storageService.getAllMarshals();
    setMarshals(updated);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-900">
      {/* Top Header with Offline Indicator, Sync Trigger & View Tabs */}
      <Header
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        totalMarshalsCount={marshals.length}
      />

      {/* Persistent Offline / Unsynced Notice */}
      <OfflineBanner />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {isLoading ? (
          <div className="max-w-md mx-auto my-20 p-8 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-600">
              Initializing Eswatini Marshals Registry...
            </p>
          </div>
        ) : activeTab === 'register' ? (
          <RegistrationForm onSuccess={handleSuccessRegistration} />
        ) : (
          <MarshalDirectory
            marshals={marshals}
            onSelectMarshal={(m) => setSelectedMarshal(m)}
            onDeleteMarshal={handleDeleteMarshal}
            onGoToRegister={() => setActiveTab('register')}
          />
        )}
      </main>

      {/* Modals */}
      <MarshalCardModal
        marshal={selectedMarshal}
        onClose={() => setSelectedMarshal(null)}
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
          setActiveTab('register');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

