'use client';

import React, { useState } from 'react';
import { useOrthoStore } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { OrthoBondMark } from '@/components/common/OrthoBondLogo';
import {
  HeartHandshake,
  Stethoscope,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Lock,
  Building,
  Award,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

const VALID_CLINICIAN_ACCESS_KEYS = [
  'ORTHO-2026',
  'ORTHOBOND-CLINICIAN',
  'CLINIC-KEY-2026',
  'ORTHO-EVAL',
  'CLINICIAN-DEMO',
];

export function RoleOnboardingModal() {
  const { completeOnboarding, currentUser } = useOrthoStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');

  // Clinician verification fields
  const [accessKey, setAccessKey] = useState('');
  const [clinicName, setClinicName] = useState('Apex Orthodontics & Facial Aesthetics');
  const [licenseNumber, setLicenseNumber] = useState('CA-DDS-884920');
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const handleConfirm = () => {
    setVerificationError(null);

    if (selectedRole === 'clinician') {
      const normalizedKey = accessKey.trim().toUpperCase();
      const userEmail = (currentUser?.email || '').toLowerCase();
      const isAllowlistedEmail =
        userEmail.endsWith('@orthobond.ai') ||
        userEmail.includes('ortho') ||
        userEmail === 'ksaibhavagna@gmail.com';

      const isValidKey = VALID_CLINICIAN_ACCESS_KEYS.includes(normalizedKey) || isAllowlistedEmail;

      if (!isValidKey) {
        setVerificationError(
          'Clinical Verification Required: Please enter an authorized evaluation access code (e.g. ORTHO-2026) to verify clinical credentials, or select "I\'m a Patient".'
        );
        return;
      }
    }

    completeOnboarding(selectedRole);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <OrthoBondMark size={48} theme="navy" />
          </div>
          <h2 id="onboarding-title" className="text-2xl font-bold text-slate-900 tracking-tight">
            How will you use OrthoBond AI?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Welcome, <strong className="text-slate-800">{currentUser?.name || 'Orthodontic User'}</strong>! Select
            your authorized role to configure your dedicated workspace.
          </p>
        </div>

        {/* Verification Error Alert */}
        {verificationError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <p className="font-semibold">Access Authorization Failed</p>
              <p className="mt-0.5 text-rose-700">{verificationError}</p>
            </div>
          </div>
        )}

        {/* Role Selection Cards */}
        <div className="space-y-3">
          {/* Patient Card */}
          <button
            type="button"
            onClick={() => {
              setSelectedRole('patient');
              setVerificationError(null);
            }}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 cursor-pointer ${
              selectedRole === 'patient'
                ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-600/10'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selectedRole === 'patient' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-slate-900">I&apos;m a Patient</span>
                {selectedRole === 'patient' && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Track your orthodontic journey, converse with the Care Companion AI, record daily
                comfort check-ins, and communicate with your orthodontist.
              </p>
            </div>
          </button>

          {/* Clinician Card */}
          <button
            type="button"
            onClick={() => {
              setSelectedRole('clinician');
              setVerificationError(null);
            }}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 cursor-pointer ${
              selectedRole === 'clinician'
                ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-600/10'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selectedRole === 'clinician' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-slate-900">I&apos;m a Clinician</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Restricted
                  </span>
                </div>
                {selectedRole === 'clinician' && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Review assigned patients, prioritize acute concerns in the clinical triage queue, and
                perform Gemini multimodal visual bonding verification.
              </p>
            </div>
          </button>
        </div>

        {/* Clinician Credential & Verification Inputs (Visible when Clinician is selected) */}
        {selectedRole === 'clinician' && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5 animate-in fade-in duration-150 text-xs">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold uppercase tracking-wider text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Clinical Identity Verification</span>
            </div>

            <div>
              <label htmlFor="clinician-access-key" className="block font-semibold text-slate-700 mb-1">
                Clinician Authorization Key <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="clinician-access-key"
                  type="text"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="Enter code (e.g. ORTHO-2026)"
                  className="w-full px-3 py-2 pl-9 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 uppercase"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                For evaluation/demo review, use authorization code: <strong className="text-blue-700">ORTHO-2026</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="clinician-clinic-name" className="block font-medium text-slate-700 mb-1">
                  Practice / Clinic Name
                </label>
                <div className="relative">
                  <input
                    id="clinician-clinic-name"
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="Apex Orthodontics"
                    className="w-full px-2.5 py-1.5 pl-8 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div>
                <label htmlFor="clinician-license-num" className="block font-medium text-slate-700 mb-1">
                  Orthodontic License ID
                </label>
                <div className="relative">
                  <input
                    id="clinician-license-num"
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="CA-DDS-884920"
                    className="w-full px-2.5 py-1.5 pl-8 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <Award className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Button */}
        <div className="pt-2">
          <button
            type="button"
            id="onboarding-confirm-btn"
            onClick={handleConfirm}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Confirm &amp; Launch Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Security & Immutability Notice */}
        <div className="text-center pt-1">
          <div className="text-[11px] text-slate-500 inline-flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Role is locked to your authenticated Firebase UID and protected by security rules.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
