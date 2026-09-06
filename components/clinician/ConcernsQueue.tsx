'use client';

import React, { useState } from 'react';
import { useOrthoStore } from '@/lib/store';
import { ClinicalIncident } from '@/lib/types';
import {
  AlertTriangle,
  Clock,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Camera,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  X,
  Eye,
  Info,
} from 'lucide-react';

interface ConcernsQueueProps {
  onOpenBondingVerification: (patientId: string) => void;
  onOpenMessaging: (patientId: string, prefill?: string) => void;
}

export function ConcernsQueue({ onOpenBondingVerification, onOpenMessaging }: ConcernsQueueProps) {
  const { allClinicalIncidents, updateClinicalIncident, setSelectedPatientId, selectedPatient } = useOrthoStore();

  const [filter, setFilter] = useState<'all' | 'priority' | 'active' | 'resolved'>('all');
  const [inspectedPhotoUrl, setInspectedPhotoUrl] = useState<string | null>(null);

  const filteredIncidents = allClinicalIncidents.filter((inc) => {
    if (filter === 'priority') return inc.urgencyCategory === 'priority_review';
    if (filter === 'active') return inc.status !== 'resolved';
    if (filter === 'resolved') return inc.status === 'resolved';
    return true;
  });

  const priorityCount = allClinicalIncidents.filter(
    (inc) => inc.urgencyCategory === 'priority_review' && inc.status !== 'resolved'
  ).length;

  const handleLaunchVerification = (incident: ClinicalIncident) => {
    setSelectedPatientId(incident.patientId);
    onOpenBondingVerification(incident.patientId);
  };

  const handleReply = (incident: ClinicalIncident) => {
    setSelectedPatientId(incident.patientId);
    const prefill = `Hi ${incident.patientName.split(' ')[0]}, I reviewed your report regarding the ${
      incident.suspectedHardwareConcern.toLowerCase()
    }. Continue applying orthodontic wax to prevent rubbing. We have an opening to adjust this today.`;
    onOpenMessaging(incident.patientId, prefill);
  };

  const handleAcknowledge = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'new' ? 'reviewed' : 'resolved';
    updateClinicalIncident(id, { status: nextStatus as any });
  };

  return (
    <div className="space-y-5">
      {/* Top Attention Alert Banner */}
      {priorityCount > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-5 text-rose-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-rose-950">
                  {priorityCount} Patient{priorityCount > 1 ? 's' : ''} Requiring Immediate In-Office Attention
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-200 text-rose-800">
                  Priority Review
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                Acute hardware impingement reported via Care Companion intake. Review clinical photo and launch
                Gemini visual verification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setFilter('priority')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Filter Priority ({priorityCount})
            </button>
          </div>
        </div>
      )}

      {/* Triage Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Incidents ({allClinicalIncidents.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('priority')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filter === 'priority'
                ? 'bg-rose-600 text-white'
                : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
            }`}
          >
            <span>Priority Review</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/30 font-bold">
              {allClinicalIncidents.filter((i) => i.urgencyCategory === 'priority_review').length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              filter === 'active'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Active / Unresolved ({allClinicalIncidents.filter((i) => i.status !== 'resolved').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              filter === 'resolved'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Resolved
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
          <span>Care Companion AI Triage</span>
        </div>
      </div>

      {/* Incidents Card List */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Incidents in this Queue</h3>
            <p className="text-xs text-slate-500">All patient concerns have been triaged and resolved.</p>
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const isPriority = incident.urgencyCategory === 'priority_review';
            const isEmergency = incident.urgencyCategory === 'urgent_emergency';
            const isContact = incident.urgencyCategory === 'contact_clinic';

            return (
              <div
                key={incident.id}
                className={`bg-white border rounded-xl p-5 shadow-xs transition-all space-y-4 ${
                  isPriority
                    ? 'border-rose-300 ring-2 ring-rose-500/10'
                    : isEmergency
                    ? 'border-red-400 bg-red-50/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Header: Patient details & Urgency badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0 ${
                        isPriority ? 'bg-rose-600' : 'bg-blue-600'
                      }`}
                    >
                      {incident.patientName.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{incident.patientName}</h3>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-600 font-medium">{incident.affectedArea}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                        {new Date(incident.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isPriority
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isEmergency
                          ? 'bg-red-600 text-white'
                          : isContact
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {incident.urgencyCategory.replace('_', ' ')}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        incident.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : incident.status === 'reviewed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {incident.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Patient Statement */}
                  <div className="md:col-span-2 space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Patient Verbatim Report
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                          incident.painScore >= 7
                            ? 'bg-rose-100 text-rose-800'
                            : incident.painScore >= 4
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        Pain: {incident.painScore} / 10
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900 text-xs italic leading-relaxed">
                      &ldquo;{incident.patientReport}&rdquo;
                    </p>

                    <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-500 mr-1">Reported Symptoms:</span>
                      {incident.reportedSymptoms.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-[11px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Triage & Hardware Assessment */}
                  <div className="space-y-2 bg-blue-50/50 p-3.5 rounded-lg border border-blue-200/80">
                    <div className="flex items-center gap-1.5 text-blue-900 font-bold text-[11px] uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>AI Triage Analysis</span>
                    </div>
                    <p className="font-semibold text-slate-900 leading-snug">
                      {incident.suspectedHardwareConcern}
                    </p>

                    {incident.photoUrl ? (
                      <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded bg-slate-900 overflow-hidden border border-slate-300 shrink-0">
                            <img src={incident.photoUrl} alt="Patient photo" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5" /> 1 Photo
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setInspectedPhotoUrl(incident.photoUrl || null)}
                          className="text-xs text-blue-700 hover:underline font-semibold"
                        >
                          View Image
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 block pt-1">No intraoral photo attached</span>
                    )}
                  </div>
                </div>

                {/* Conservative Advice Already Provided */}
                {incident.patientGuidance && incident.patientGuidance.length > 0 && (
                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-200 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800">Home comfort advice provided by AI: </span>
                      <span>{incident.patientGuidance.join(' • ')}</span>
                    </div>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAcknowledge(incident.id, incident.status)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition-colors cursor-pointer"
                    >
                      {incident.status === 'new' ? 'Mark Reviewed' : incident.status === 'reviewed' ? 'Mark Resolved' : 'Re-open Incident'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReply(incident)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message Patient</span>
                    </button>
                  </div>

                  {/* Primary Hero Verification Button */}
                  <button
                    type="button"
                    onClick={() => handleLaunchVerification(incident)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-2 transition-all hover:shadow-md cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Verify Bracket Bonding with Gemini</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Image Inspection Lightbox */}
      {inspectedPhotoUrl && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-2xl w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-sm">Patient Submitted Clinical Photo</span>
              <button
                type="button"
                onClick={() => setInspectedPhotoUrl(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-4/3 max-h-[60vh] bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <img src={inspectedPhotoUrl} alt="Clinical evidence" className="w-full h-full object-contain" />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setInspectedPhotoUrl(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
