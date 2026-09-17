import React, { useState } from 'react';
import { MarshalRegistration } from '../types';
import { storageService } from '../services/storage';
import { PublicHeader } from '../components/PublicHeader';
import { OfflineBanner } from '../components/OfflineBanner';
import { RegistrationForm } from '../components/RegistrationForm';
import { SuccessModal } from '../components/SuccessModal';
import { MarshalCardModal } from '../components/MarshalCardModal';

/**
 * Public-facing page for marshals.
 * Only the registration form is available — no dashboard or directory.
 */
export const RegistrationPage: React.FC = () => {
  const [successMarshal, setSuccessMarshal] = useState<MarshalRegistration | null>(null);
  const [viewMarshal, setViewMarshal] = useState<MarshalRegistration | null>(null);

  const handleSuccess = async (newMarshal: MarshalRegistration) => {
    await storageService.saveMarshal(newMarshal);
    setSuccessMarshal(newMarshal);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col selection:bg-amber-400 selection:text-slate-900">
      <PublicHeader />
      <OfflineBanner />

      <main className="flex-1 pb-16">
        <RegistrationForm onSuccess={handleSuccess} />
      </main>

      <SuccessModal
        marshal={successMarshal}
        onClose={() => setSuccessMarshal(null)}
        onViewRecord={(m) => {
          setSuccessMarshal(null);
          setViewMarshal(m);
        }}
        onRegisterAnother={() => {
          setSuccessMarshal(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <MarshalCardModal
        marshal={viewMarshal}
        onClose={() => setViewMarshal(null)}
      />
    </div>
  );
};
