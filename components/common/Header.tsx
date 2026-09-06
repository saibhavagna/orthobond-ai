'use client';

import React, { useState } from 'react';
import { useOrthoStore } from '@/lib/store';
import { ProfileModal } from './ProfileModal';
import { OrthoBondMark } from './OrthoBondLogo';
import {
  Stethoscope,
  HeartHandshake,
  LogOut,
  Sparkles,
  ShieldCheck,
  Layers,
  ChevronDown,
  AlertTriangle,
  Home,
  MessageSquare,
  Calendar,
  Activity,
  User,
  RefreshCw,
  Clock,
} from 'lucide-react';

export function Header() {
  const {
    role,
    currentUser,
    clinician,
    logout,
    selectedPatient,
    setSelectedPatientId,
    patients,
    clinicalIncidents,
    isDemoMode,
    loginWithDemo,
    activeClinicianView,
    setActiveClinicianView,
    activePatientTab,
    setActivePatientTab,
    resetToDemo,
  } = useOrthoStore();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Identity is derived from currentUser when authenticated, or fallback to role in demo mode
  const effectiveRole = currentUser?.role || role;
  const isClinician = effectiveRole === 'clinician';

  // Unresolved priority incidents count for clinician badge
  const priorityIncidentsCount = (clinicalIncidents || []).filter(
    (inc) => inc.status !== 'resolved' && (inc.urgencyCategory === 'priority_review' || inc.urgencyCategory === 'urgent_emergency')
  ).length;

  return (
    <>
      {/* 1. Global Demo Mode Notice Bar (Displayed ONLY in Demo Mode) */}
      {isDemoMode && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between border-b border-amber-600">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-100 text-[10px] font-bold uppercase tracking-wider">
                Demo Mode (Simulated)
              </span>
              <span className="hidden sm:inline text-amber-950 font-medium">
                Non-authenticated sandbox session with fictional evaluation data. Real accounts are strictly role-locked.
              </span>
            </div>

            {/* Sandbox persona switch (ONLY in demo mode) */}
            <div className="flex items-center gap-1.5 bg-amber-600/30 px-2 py-0.5 rounded-lg border border-amber-600/40">
              <span className="text-[10px] uppercase font-bold text-amber-950">Simulated Persona:</span>
              <button
                type="button"
                id="demo-persona-clinician"
                onClick={() => loginWithDemo('clinician')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  isClinician
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-amber-950 hover:bg-amber-600/40'
                }`}
              >
                Dr. Chen (Clinician)
              </button>
              <button
                type="button"
                id="demo-persona-patient"
                onClick={() => loginWithDemo('patient')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  !isClinician
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-amber-950 hover:bg-amber-600/40'
                }`}
              >
                Maya Lin (Patient)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Navigation Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
            {/* Left: Brand Identity + Role Badge */}
            <div className="flex items-center gap-3 shrink-0">
              <OrthoBondMark size={36} theme={isClinician ? 'navy' : 'blue'} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-none">
                    OrthoBond <span className="text-blue-600">AI</span>
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isClinician
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {isClinician ? 'Clinician Workspace' : 'Patient Portal'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 hidden md:block font-medium mt-1 leading-tight">
                  Orthodontic Visual Review & Patient Monitoring Platform
                </p>
              </div>
            </div>

            {/* Middle: Role-Specific Navigation (Patient vs Clinician) */}
            <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
              {isClinician ? (
                /* CLINICIAN NAVIGATION */
                <>
                  <button
                    type="button"
                    id="nav-clinician-dashboard"
                    onClick={() => setActiveClinicianView('timeline')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeClinicianView === 'timeline'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    type="button"
                    id="nav-clinician-patients"
                    onClick={() => setActiveClinicianView('dashboard')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeClinicianView === 'dashboard'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Patients ({patients.length})</span>
                  </button>

                  <button
                    type="button"
                    id="nav-clinician-concerns"
                    onClick={() => setActiveClinicianView('concerns')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeClinicianView === 'concerns'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Patient Concerns</span>
                    {priorityIncidentsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-rose-700 font-bold">
                        {priorityIncidentsCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    id="nav-clinician-bonding"
                    onClick={() => setActiveClinicianView('bonding')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeClinicianView === 'bonding'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Bonding Verification</span>
                  </button>

                  <button
                    type="button"
                    id="nav-clinician-messages"
                    onClick={() => setActiveClinicianView('messages')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeClinicianView === 'messages'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Clinical Messages</span>
                  </button>
                </>
              ) : (
                /* PATIENT NAVIGATION */
                <>
                  <button
                    type="button"
                    id="nav-patient-home"
                    onClick={() => setActivePatientTab('home')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activePatientTab === 'home'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Home</span>
                  </button>

                  <button
                    type="button"
                    id="nav-patient-companion"
                    onClick={() => setActivePatientTab('companion')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activePatientTab === 'companion'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Care Companion</span>
                  </button>

                  <button
                    type="button"
                    id="nav-patient-checkin"
                    onClick={() => setActivePatientTab('checkin')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activePatientTab === 'checkin'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Check-in</span>
                  </button>

                  <button
                    type="button"
                    id="nav-patient-treatment"
                    onClick={() => setActivePatientTab('treatment')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activePatientTab === 'treatment'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Treatment Timeline</span>
                  </button>
                </>
              )}
            </nav>

            {/* Right: Active Patient Selector (Clinician only) + Profile + Sign Out */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Clinician Patient Selector */}
              {isClinician && patients.length > 0 && (
                <div className="relative hidden xl:block">
                  <select
                    id="header-clinician-patient-select"
                    value={selectedPatient?.id}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg pl-3 pr-8 py-1.5 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        Patient: {p.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}

              {/* Profile Trigger Button */}
              <button
                type="button"
                id="header-profile-btn"
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer text-left"
                title="View Profile and Authorized Credentials"
              >
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                      isClinician ? 'bg-blue-600' : 'bg-rose-600'
                    }`}
                  >
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
                  </div>
                )}
                <div className="hidden sm:block leading-none">
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                    {currentUser?.name || (isClinician ? clinician?.name || 'Dr. Sarah Chen' : 'Patient')}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {isClinician ? 'Clinician' : 'Patient'} • Profile
                  </p>
                </div>
              </button>

              {/* Reset Demo State Button (Visible ONLY in demo mode) */}
              {isDemoMode && (
                <button
                  type="button"
                  id="header-reset-demo"
                  onClick={() => {
                    if (confirm('Reset application state back to initial clinical demo data?')) {
                      resetToDemo();
                    }
                  }}
                  title="Reset Demo Data"
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}

              {/* Sign Out / Logout */}
              <button
                type="button"
                id="header-logout-btn"
                onClick={logout}
                title="Sign Out"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Sub-Bar */}
          <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-100 gap-2">
            {isClinician ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveClinicianView('timeline')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 ${
                    activeClinicianView === 'timeline' ? 'bg-blue-600 text-white' : 'text-slate-600'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => setActiveClinicianView('concerns')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 ${
                    activeClinicianView === 'concerns' ? 'bg-rose-600 text-white' : 'text-slate-600'
                  }`}
                >
                  Concerns
                </button>
                <button
                  type="button"
                  onClick={() => setActiveClinicianView('bonding')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 ${
                    activeClinicianView === 'bonding' ? 'bg-blue-600 text-white' : 'text-blue-700'
                  }`}
                >
                  Bonding
                </button>
                <button
                  type="button"
                  onClick={() => setActiveClinicianView('messages')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 ${
                    activeClinicianView === 'messages' ? 'bg-blue-600 text-white' : 'text-slate-600'
                  }`}
                >
                  Messages
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActivePatientTab('home')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 ${
                    activePatientTab === 'home' ? 'bg-blue-600 text-white' : 'text-slate-600'
                  }`}
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => setActivePatientTab('companion')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 ${
                    activePatientTab === 'companion' ? 'bg-blue-600 text-white' : 'text-blue-700'
                  }`}
                >
                  Care Companion
                </button>
                <button
                  type="button"
                  onClick={() => setActivePatientTab('checkin')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 ${
                    activePatientTab === 'checkin' ? 'bg-blue-600 text-white' : 'text-slate-600'
                  }`}
                >
                  Check-in
                </button>
                <button
                  type="button"
                  onClick={() => setActivePatientTab('treatment')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 ${
                    activePatientTab === 'treatment' ? 'bg-blue-600 text-white' : 'text-slate-600'
                  }`}
                >
                  Timeline
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 3. Account Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
}
