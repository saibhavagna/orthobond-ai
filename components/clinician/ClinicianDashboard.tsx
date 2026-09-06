'use client';

import React, { useState } from 'react';
import { useOrthoStore } from '@/lib/store';
import { BondingVerification } from './BondingVerification';
import { ConcernsQueue } from './ConcernsQueue';
import {
  Sparkles,
  Calendar,
  Clock,
  Activity,
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle2,
  Check,
  ChevronRight,
  ShieldCheck,
  FileText,
  Eye,
  User,
  ExternalLink,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';

export function ClinicianDashboard() {
  const {
    role,
    currentUser,
    isDemoMode,
    setActivePatientTab,
    selectedPatient,
    patients,
    setSelectedPatientId,
    activeTreatment,
    milestones,
    painCheckIns,
    visualReviews,
    messages,
    sendMessage,
    allClinicalIncidents,
    activeClinicianView,
    setActiveClinicianView,
  } = useOrthoStore();

  const [selectedReviewForModal, setSelectedReviewForModal] = useState<any>(null);
  const [newReplyMessage, setNewReplyMessage] = useState<string>('');

  const effectiveRole = currentUser?.role || role;
  if (!isDemoMode && effectiveRole !== 'clinician') {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 shadow-xs text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Clinician Workspace Restricted</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Access to this clinical workstation is restricted to authorized orthodontists and clinical staff.
          Your authenticated account is registered as a <strong>Patient</strong>.
        </p>
        <button
          type="button"
          onClick={() => setActivePatientTab('home')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          Return to Patient Portal
        </button>
      </div>
    );
  }

  const priorityIncidentsCount = allClinicalIncidents.filter(
    (inc) => inc.urgencyCategory === 'priority_review' && inc.status !== 'resolved'
  ).length;

  if (activeClinicianView === 'bonding') {
    return (
      <BondingVerification
        onBackToTimeline={() => setActiveClinicianView('timeline')}
      />
    );
  }

  const latestCheckIn = painCheckIns[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyMessage.trim()) return;
    sendMessage(newReplyMessage.trim());
    setNewReplyMessage('');
  };

  const handleOpenBondingVerification = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveClinicianView('bonding');
  };

  const handleOpenMessaging = (patientId: string, prefill?: string) => {
    setSelectedPatientId(patientId);
    if (prefill) {
      setNewReplyMessage(prefill);
    }
    setActiveClinicianView('messages');
  };

  return (
    <div className="space-y-6">
      {/* Patient Header & Quick Stats */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Patient Details */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xl shrink-0">
              {selectedPatient.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900">{selectedPatient.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
                  {selectedPatient.currentStage}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                DOB: {selectedPatient.dob} • Treatment Start: {selectedPatient.startDate} • Target Completion:{' '}
                {selectedPatient.targetCompletion}
              </p>
              <p className="text-xs text-slate-700 mt-1 font-medium">
                {activeTreatment?.applianceType || 'Twin Edgewise Fixed Appliance (0.022" slot)'}
              </p>
            </div>
          </div>

          {/* Primary Action Button: P0 Hero */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveClinicianView('concerns')}
              className={`px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                priorityIncidentsCount > 0
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Attention Queue ({priorityIncidentsCount} Urgent)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveClinicianView('bonding')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 transition-all hover:shadow-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Verify Bracket Bonding with Gemini</span>
            </button>
          </div>
        </div>

        {/* Prescription & Clinical Diagnosis Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Diagnosis</span>
            <span className="text-slate-800 font-medium leading-relaxed">{activeTreatment?.diagnosis}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Prescription &amp; Slot</span>
            <span className="text-slate-800 font-medium leading-relaxed">{activeTreatment?.prescription}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Wire Progression Sequence</span>
            <span className="text-slate-800 font-medium leading-relaxed">{activeTreatment?.wireSequence}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveClinicianView('concerns')}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeClinicianView === 'concerns'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Patients Needing Attention</span>
            {priorityIncidentsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-rose-700 font-bold">
                {priorityIncidentsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveClinicianView('timeline')}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-all ${
              activeClinicianView === 'timeline' || activeClinicianView === 'dashboard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Treatment Timeline ({milestones.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveClinicianView('bonding')}
            className="px-3.5 py-2 rounded-md text-xs font-semibold transition-all text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini Bonding Verification</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveClinicianView('messages')}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-all ${
              activeClinicianView === 'messages'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Clinical Messaging ({messages.length})
          </button>
        </div>

        {/* Selected Patient Selector Switch */}
        <div className="flex items-center gap-2 text-xs shrink-0">
          <span className="text-slate-400 hidden sm:inline uppercase tracking-wider text-[10px] font-bold">Patient:</span>
          {patients.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPatientId(p.id)}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                p.id === selectedPatient.id
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW: CONCERNS QUEUE */}
      {activeClinicianView === 'concerns' && (
        <ConcernsQueue
          onOpenBondingVerification={handleOpenBondingVerification}
          onOpenMessaging={handleOpenMessaging}
        />
      )}

      {/* VIEW: TREATMENT TIMELINE & REVIEWS */}
      {(activeClinicianView === 'timeline' || activeClinicianView === 'dashboard') && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Active Orthodontic Progression Timeline
              </h2>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                Chronological Clinical Milestones
              </span>
            </div>

            {/* Milestones Vertical Steps */}
            <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 ml-3">
              {milestones.map((m) => {
                const isCompleted = m.status === 'completed';
                const isInProgress = m.status === 'in_progress';
                const isUpcoming = m.status === 'upcoming';
                const hasReview = visualReviews.find((r) => r.patientId === m.patientId);

                return (
                  <div key={m.id} className="relative group">
                    {/* Circle marker */}
                    <div
                      className={`absolute -left-[31px] top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white ${
                        isCompleted
                          ? 'bg-blue-600 text-white'
                          : isInProgress
                          ? 'bg-blue-600 text-white animate-pulse'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : m.stageNumber}
                    </div>

                    {/* Milestone Card */}
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 transition-all hover:bg-slate-50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            Stage {m.stageNumber}
                          </span>
                          <h3 className="font-semibold text-slate-900 text-sm">{m.title}</h3>
                          {m.notes && <p className="text-xs text-slate-600 mt-1">{m.notes}</p>}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                              isCompleted
                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                : isInProgress
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-200/80 text-slate-600'
                            }`}
                          >
                            {isCompleted
                              ? `Completed (${m.completedDate || m.scheduledDate})`
                              : isInProgress
                              ? 'Active / In Verification'
                              : `Scheduled ${m.scheduledDate}`}
                          </span>
                        </div>
                      </div>

                      {/* Associated Visual Review Attachment (if bonded milestone) */}
                      {m.title.toLowerCase().includes('bonding') && visualReviews.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200/60">
                          {visualReviews.map((rev) => (
                            <div
                              key={rev.id}
                              className="bg-white border border-blue-200 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-slate-900 rounded-md overflow-hidden border border-slate-300 shrink-0">
                                  <img
                                    src={rev.actualImageUrl}
                                    alt="Review thumbnail"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-blue-900">
                                      Gemini Visual Review #{rev.id.slice(-5)}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-100">
                                      {rev.status}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{rev.summary}</p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setSelectedReviewForModal(rev)}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect Findings &amp; Overlays</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Telemetry Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Patient Check-In Telemetry
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-400 font-medium">Latest Discomfort Score</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-slate-900">
                    {latestCheckIn ? latestCheckIn.painScore : 0}
                  </span>
                  <span className="text-xs text-slate-500">/ 10</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-400 font-medium">Discomfort Location</span>
                <p className="text-xs font-semibold text-slate-900 mt-1">
                  {latestCheckIn?.discomfortLocation || 'None reported'}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-400 font-medium">Total Check-Ins</span>
                <p className="text-2xl font-bold text-slate-900 mt-1">{painCheckIns.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: CLINICAL MESSAGING */}
      {activeClinicianView === 'messages' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-semibold text-slate-900 text-sm">Secure Patient-Clinician Dialogue</h2>
              <p className="text-xs text-slate-500">Direct clinical communication with {selectedPatient.name}</p>
            </div>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto p-1">
            {messages.map((msg) => {
              const isClinicianSender = msg.senderId === 'user-clin-1';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isClinicianSender ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isClinicianSender
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {isClinicianSender ? 'Dr. Sarah Chen' : selectedPatient.name} •{' '}
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSendReply} className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={newReplyMessage}
              onChange={(e) => setNewReplyMessage(e.target.value)}
              placeholder={`Send clinical advice or instructions to ${selectedPatient.name}...`}
              className="flex-1 text-xs px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* INSPECT REVIEW MODAL */}
      {selectedReviewForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Verified Bracket Verification Record</h2>
                <span className="text-xs text-slate-500">
                  Recorded on {new Date(selectedReviewForModal.createdAt).toLocaleDateString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReviewForModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="aspect-4/3 bg-slate-950 rounded-lg overflow-hidden border border-slate-200">
                <img
                  src={selectedReviewForModal.referenceImageUrl}
                  alt="Reference"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="aspect-4/3 bg-slate-950 rounded-lg overflow-hidden border border-slate-200 relative">
                <img
                  src={selectedReviewForModal.actualImageUrl}
                  alt="Actual"
                  className="w-full h-full object-contain"
                />
                {/* Overlays */}
                {selectedReviewForModal.findings?.map((f: any) => {
                  if (!f.bounding_box) return null;
                  return (
                    <div
                      key={f.finding_id}
                      style={{
                        top: `${(f.bounding_box.ymin / 1000) * 100}%`,
                        left: `${(f.bounding_box.xmin / 1000) * 100}%`,
                        height: `${((f.bounding_box.ymax - f.bounding_box.ymin) / 1000) * 100}%`,
                        width: `${((f.bounding_box.xmax - f.bounding_box.xmin) / 1000) * 100}%`,
                      }}
                      className="absolute border-2 border-amber-400 bg-amber-400/20 rounded pointer-events-none"
                    />
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-2">
              <span className="font-semibold text-slate-900 block">Clinician Verified Notes:</span>
              <p className="text-slate-700">{selectedReviewForModal.clinicianNotes}</p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedReviewForModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
