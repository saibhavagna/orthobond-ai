'use client';

import React from 'react';
import { useOrthoStore } from '@/lib/store';
import {
  User,
  ShieldCheck,
  Lock,
  Mail,
  Fingerprint,
  Calendar,
  Stethoscope,
  HeartHandshake,
  LogOut,
  X,
  Building,
  Award,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const {
    currentUser,
    role,
    isDemoMode,
    logout,
    clinician,
    selectedPatient,
    patients,
  } = useOrthoStore();

  if (!isOpen) return null;

  const isClinician = (currentUser?.role || role) === 'clinician';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shadow-sm ${
                isClinician ? 'bg-blue-600 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span>
                  {currentUser?.name
                    ? currentUser.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()
                    : isClinician
                    ? 'MD'
                    : 'PT'}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="profile-modal-title" className="font-bold text-lg text-white">
                  {currentUser?.name || (isClinician ? 'Dr. Sarah Chen' : 'Patient')}
                </h2>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isClinician
                      ? 'bg-blue-500/30 text-blue-200 border border-blue-400/40'
                      : 'bg-rose-500/30 text-rose-200 border border-rose-400/40'
                  }`}
                >
                  {isClinician ? 'Clinician' : 'Patient'}
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>{currentUser?.email || 'authenticated-user@orthobond.ai'}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          {/* Identity Source & Cryptographic Role Lock */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Identity &amp; Authorization Source
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {isDemoMode ? 'Simulated Sandbox Session' : 'Firebase Auth Verified'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Firebase Auth UID</span>
                <span className="font-mono text-[11px] text-slate-800 break-all select-all">
                  {currentUser?.id || 'simulated-uid-demo'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Authorized Role</span>
                <span className="font-semibold text-slate-800">
                  {isClinician ? 'Orthodontic Clinician (Restricted)' : 'Patient Account (Standard)'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center gap-1.5 text-[11px] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                Role is immutably bound to this account. Role switching from client is disabled.
              </span>
            </div>
          </div>

          {/* Role Specific Details */}
          {isClinician ? (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Clinical Credentials
              </h3>
              <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Practice / Clinic</span>
                  <div className="flex items-center gap-1.5 text-slate-800 font-semibold mt-0.5">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    <span>{clinician?.clinicName || 'Apex Orthodontics'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Practice License</span>
                  <div className="flex items-center gap-1.5 text-slate-800 font-semibold mt-0.5">
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    <span>{clinician?.licenseNumber || 'ORTHO-CA-94821'}</span>
                  </div>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Assigned Patient Panel:</span>
                  <span className="font-bold text-blue-700">{patients.length} Patients Assigned</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Treatment Record Association
              </h3>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Current Stage</span>
                    <span className="font-semibold text-slate-800">
                      {selectedPatient?.currentStage || 'Active Alignment Stage'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Arch Type</span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {selectedPatient?.archType ? `${selectedPatient.archType} Arch` : 'Both Arches'}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Supervising Orthodontist:</span>
                  <span className="font-bold text-blue-700">{clinician?.name || 'Dr. Sarah Chen, DDS MS'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Account</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
