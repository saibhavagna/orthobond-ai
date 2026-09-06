'use client';

import React from 'react';
import { OrthoStoreProvider, useOrthoStore } from '@/lib/store';
import { LandingPage } from '@/components/landing/LandingPage';
import { LoginPage } from '@/components/auth/LoginPage';
import { RoleOnboardingModal } from '@/components/auth/RoleOnboardingModal';
import { Header } from '@/components/common/Header';
import { OrthoBondMark } from '@/components/common/OrthoBondLogo';
import { ClinicianDashboard } from '@/components/clinician/ClinicianDashboard';
import { PatientDashboard } from '@/components/patient/PatientDashboard';
import { ShieldAlert } from 'lucide-react';

function AppContent() {
  const { role, currentUser, isDemoMode, isHydrated, appView, authStatus } = useOrthoStore();

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 gap-4">
        <OrthoBondMark size={44} theme="navy" className="animate-pulse" />
        <div className="flex items-center gap-2.5 text-slate-600 text-xs font-medium">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading OrthoBond Clinical Environment...</span>
        </div>
      </div>
    );
  }

  // 1. Landing View
  if (appView === 'landing') {
    return <LandingPage />;
  }

  // 2. Login View
  if (appView === 'login') {
    return <LoginPage />;
  }

  // 3. Authenticated Dashboard Workspace: effective role locked to authenticated user
  const effectiveRole = (!isDemoMode && currentUser?.role) ? currentUser.role : role;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* If newly authenticated without a role, show role selection onboarding */}
      {authStatus === 'onboarding' && <RoleOnboardingModal />}

      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {effectiveRole === 'clinician' ? <ClinicianDashboard /> : <PatientDashboard />}
      </main>

      {/* Clinical Disclaimer & Regulatory Integrity Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Clinical Decision Support Notice:</strong> OrthoBond AI provides visual assistive screening.
              All bracket positioning decisions, appliance adjustments, and diagnoses are the sole responsibility of the licensed orthodontist.
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Gemini Multimodal Flash AI</span>
            <span>•</span>
            <span>HIPAA-Conscious Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <OrthoStoreProvider>
      <AppContent />
    </OrthoStoreProvider>
  );
}
