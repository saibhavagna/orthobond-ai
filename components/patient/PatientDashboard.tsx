'use client';

import React, { useState } from 'react';
import { useOrthoStore } from '@/lib/store';
import { CareCompanion } from './CareCompanion';
import { PatientGuidanceResponse } from '@/lib/types';
import {
  Heart,
  Smile,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Send,
  Camera,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Info,
  ChevronRight,
  PhoneCall,
  Clock,
  ArrowRight,
  Activity,
  Check,
} from 'lucide-react';

export function PatientDashboard() {
  const {
    selectedPatient,
    clinician,
    milestones,
    painCheckIns,
    messages,
    addPainCheckIn,
    sendMessage,
    activePatientTab,
    setActivePatientTab,
    currentUser,
  } = useOrthoStore();

  const patientDisplayName = currentUser?.name || selectedPatient?.name || 'Patient';
  const patientFirstName = patientDisplayName.split(' ')[0] || 'there';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const [initialCompanionPrompt, setInitialCompanionPrompt] = useState<string>('');

  // Quick Check-In Form State
  const [painScore, setPainScore] = useState<number>(3);
  const [discomfortLocation, setDiscomfortLocation] = useState<string>('Upper front teeth (incisors)');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Dull aching pressure', 'Cheek rubbing']);
  const [patientNotes, setPatientNotes] = useState<string>('');
  const [uploadedSmilePhoto, setUploadedSmilePhoto] = useState<string | null>(null);

  // Guidance result state
  const [guidanceResult, setGuidanceResult] = useState<PatientGuidanceResponse | null>(null);
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState<boolean>(false);
  const [checkInSubmitted, setCheckInSubmitted] = useState<boolean>(false);
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const [isOfflineGuidance, setIsOfflineGuidance] = useState<boolean>(false);

  // Message compose state
  const [messageText, setMessageText] = useState<string>('');
  const [messagePriority, setMessagePriority] = useState<'normal' | 'urgent'>('normal');

  const symptomOptions = [
    'Dull aching pressure',
    'Cheek rubbing from bracket',
    'Tenderness when biting',
    'Wire poking cheek or tongue',
    'Loose bracket feeling',
    'Gum sensitivity',
  ];

  const getLocalConservativeGuidance = (score: number, symptoms: string[]): PatientGuidanceResponse => {
    const isHighPain = score >= 7;
    const hasPokingWire = symptoms.some(
      (s) => s.toLowerCase().includes('poking') || s.toLowerCase().includes('wire')
    );

    return {
      assessmentCategory: isHighPain
        ? 'urgent_clinical_attention'
        : hasPokingWire
        ? 'hardware_discomfort'
        : 'expected_post_adjustment',
      headline: isHighPain
        ? 'Elevated Discomfort Logged'
        : hasPokingWire
        ? 'Hardware Friction Comfort Guidance'
        : 'Expected Orthodontic Adjustment Response',
      guidanceText:
        score <= 4
          ? 'Your check-in has been securely recorded to your treatment timeline. Mild tenderness is expected during active tooth movement.'
          : 'Your check-in has been securely recorded. Discomfort typically peaks within 24-48 hours following an appliance adjustment. Apply orthodontic wax to sensitive brackets and rinse with warm salt water.',
      comfortActions: [
        'Pinch a pea-sized ball of orthodontic relief wax and press it firmly over any rubbing bracket.',
        'Swish with mild warm salt water (1/2 tsp salt in warm water) for 30 seconds to soothe gums.',
        'Stick to softer foods (yogurt, smoothies, soft pasta) while chewing is sensitive.',
      ],
      whenToCallClinician: [
        'A wire is actively poking cheek tissues and wax does not alleviate it.',
        'A bracket is visibly loose or spinning on the archwire.',
        'Pain persists at elevated levels beyond 3-4 days without improvement.',
      ],
      isConservativeSafe: true,
    };
  };

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleSmilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedSmilePhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCheckIn(true);
    setCheckInError(null);

    let guidance: PatientGuidanceResponse = getLocalConservativeGuidance(painScore, selectedSymptoms);
    let usedOffline = false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch('/api/gemini/patient-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          painScore,
          symptoms: selectedSymptoms,
          discomfortLocation,
          notes: patientNotes,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const liveData = await res.json();
        if (liveData && liveData.guidanceText) {
          guidance = liveData;
        }
      } else {
        usedOffline = true;
      }
    } catch (err: any) {
      console.warn('Guidance fetch interrupted. Applying conservative clinical protocol:', err?.message || err);
      usedOffline = true;
    }

    try {
      addPainCheckIn({
        patientId: selectedPatient.id,
        painScore,
        discomfortLocation,
        symptoms: selectedSymptoms,
        notes: patientNotes,
        photoUrl: uploadedSmilePhoto || undefined,
        aiSummary: guidance.guidanceText,
      });

      setGuidanceResult(guidance);
      setIsOfflineGuidance(usedOffline);
      setCheckInSubmitted(true);
    } catch (persistErr: any) {
      console.error('Checkin persistence failure:', persistErr);
      setCheckInError('Failed to record check-in to your local timeline. Please try again.');
    } finally {
      setIsSubmittingCheckIn(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    sendMessage(messageText.trim(), messagePriority);
    setMessageText('');
  };

  const openCompanionWithPrompt = (promptText: string) => {
    setInitialCompanionPrompt(promptText);
    setActivePatientTab('companion');
  };

  const latestCheckIn = painCheckIns[0];

  return (
    <div className="space-y-6">
      {/* Patient Greeting & Feeling Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
              OrthoBond Connected Care
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 text-white">
              {getGreeting()}, {patientFirstName}
            </h1>
            <p className="text-sm text-slate-300 mt-1 font-medium">How are you feeling today?</p>
          </div>

          <div className="bg-slate-800/90 rounded-xl p-3.5 border border-slate-700 text-xs space-y-1.5 shrink-0">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Treatment Stage
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span className="text-white font-bold">{selectedPatient?.currentStage || 'Active Alignment'}</span>
            </div>
            <span className="text-[11px] text-slate-400 block">Orthodontist: {clinician?.name || 'Assigned Orthodontist'}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActivePatientTab('home')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              activePatientTab === 'home'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Care Overview
          </button>
          <button
            type="button"
            onClick={() => setActivePatientTab('companion')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activePatientTab === 'companion'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Care Companion AI</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePatientTab('checkin')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              activePatientTab === 'checkin'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Daily Check-In
          </button>
          <button
            type="button"
            onClick={() => setActivePatientTab('treatment')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              activePatientTab === 'treatment'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Treatment Timeline ({milestones.length})
          </button>
          <button
            type="button"
            onClick={() => setActivePatientTab('messages')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              activePatientTab === 'messages'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Messages ({messages.length})
          </button>
        </div>
      </div>

      {/* CARE COMPANION VIEW */}
      {activePatientTab === 'companion' && (
        <CareCompanion
          initialDemoPrompt={initialCompanionPrompt}
          onBackToOverview={() => {
            setInitialCompanionPrompt('');
            setActivePatientTab('home');
          }}
        />
      )}

      {/* OVERVIEW / HOME VIEW */}
      {activePatientTab === 'home' && (
        <div className="space-y-6">
          {/* 1. PRIMARY HERO CARD: Talk to OrthoBond AI */}
          <div className="bg-gradient-to-br from-white to-blue-50/60 border-2 border-blue-500/30 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Continuous Care Companion</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Talk to OrthoBond AI
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Tell me what&apos;s hurting, bothering you, or worrying you. You can describe it naturally.
                </p>

                {/* Common Scenarios to Try */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Common Situations:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openCompanionWithPrompt('My canine bracket popped off and the wire is cutting my cheek.')
                      }
                      className="text-left px-3 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs rounded-lg font-medium shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>&ldquo;Wire is poking my cheek and bracket feels loose&rdquo;</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openCompanionWithPrompt('Front teeth are sore after biting an apple.')}
                      className="text-left px-3 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs rounded-lg font-medium shadow-2xs transition-colors cursor-pointer"
                    >
                      <span>&ldquo;Front teeth sore after eating&rdquo;</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                <button
                  type="button"
                  id="patient-start-conversation-btn"
                  onClick={() => setActivePatientTab('companion')}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start a conversation</span>
                </button>
                <button
                  type="button"
                  id="patient-quick-checkin-btn"
                  onClick={() => setActivePatientTab('checkin')}
                  className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-semibold text-xs transition-colors text-center cursor-pointer"
                >
                  Quick check-in
                </button>
              </div>
            </div>
          </div>

          {/* 2. CURRENT TREATMENT (Stage and progress) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Current Treatment Stage &amp; Progress</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Started: {selectedPatient.startDate} • Target Completion: {selectedPatient.targetCompletion}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Active Stage
                </span>
                <p className="font-bold text-slate-900 text-sm">Stage 2 of 5</p>
                <p className="text-slate-600 font-medium">Direct Maxillary Bonding &amp; Initial Leveling</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Appliance Specification
                </span>
                <p className="font-bold text-slate-900 text-sm">0.022 Twin Edgewise Ceramic</p>
                <p className="text-slate-600 font-medium">Roth Prescription • Hook on Canines</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Current Active Archwire
                </span>
                <p className="font-bold text-blue-600 text-sm">0.014 NiTi Superelastic</p>
                <p className="text-slate-600 font-medium">Light continuous alignment force</p>
              </div>
            </div>

            {/* Visual Milestone Progress Bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-600">Overall Treatment Progression</span>
                <span className="text-blue-700 font-bold">35% Completed</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-[35%] transition-all"></div>
              </div>
            </div>
          </div>

          {/* 3. RECENT CHECK-INS (Pain/discomfort history) & CLINICIAN COMMUNICATION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Check-in Telemetry */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-900">Recent Check-Ins (Discomfort History)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePatientTab('checkin')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                >
                  + New Check-In
                </button>
              </div>

              {latestCheckIn ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-600 font-medium">Latest Logged Discomfort:</span>
                    <span className="font-bold text-blue-600 text-sm">{latestCheckIn.painScore} / 10</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block mb-0.5">Reported Area:</span>
                    <p className="text-slate-800 font-medium">{latestCheckIn.discomfortLocation}</p>
                  </div>
                  {latestCheckIn.aiSummary && (
                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-blue-900 leading-relaxed">
                      <strong>AI Safe Guidance:</strong> {latestCheckIn.aiSummary}
                    </div>
                  )}
                  <div className="text-[11px] text-slate-400">
                    Recorded: {new Date(latestCheckIn.timestamp).toLocaleString()}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No recent check-ins recorded yet.</p>
              )}
            </div>

            {/* 5. Clinician Communication (Messages and submitted concerns) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-900">Clinician Communication</h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  Connected
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-900 text-sm">{clinician.clinicName}</p>
                <p className="text-slate-600 font-medium">{clinician.name} • Primary Orthodontist</p>
                <p className="text-slate-500">
                  Direct message your care team if pain persists or if relief wax does not resolve sharp hardware.
                </p>

                {messages.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs mt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Latest Message:
                    </span>
                    <p className="text-slate-800 italic line-clamp-2">
                      &ldquo;{messages[0].content}&rdquo;
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActivePatientTab('messages')}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>View Messages ({messages.length})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. TREATMENT TIMELINE (Major milestones preview) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Treatment Milestones</h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePatientTab('treatment')}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                View Full Timeline ({milestones.length}) →
              </button>
            </div>

            {milestones.length === 0 ? (
              <div className="py-6 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                <p className="text-xs font-semibold text-slate-700">No milestones scheduled yet</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                  Your personalized orthodontic milestones will be added by {clinician?.name || 'your care team'} following your initial consultation and appliance placement.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {milestones.slice(0, 3).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white ${
                          m.status === 'completed'
                            ? 'bg-blue-600'
                            : m.status === 'in_progress'
                            ? 'bg-blue-600 ring-2 ring-blue-200'
                            : 'bg-slate-300 text-slate-600'
                        }`}
                      >
                        {m.status === 'completed' ? <Check className="w-3.5 h-3.5" /> : m.stageNumber}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">{m.title}</span>
                        {m.notes && <p className="text-slate-500 text-[11px]">{m.notes}</p>}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        m.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : m.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {m.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUICK CHECK-IN VIEW */}
      {activePatientTab === 'checkin' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-sm">Record Today&apos;s Discomfort Check-In</h2>
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">P1 Patient Monitoring</span>
          </div>

          <form onSubmit={handleSubmitCheckIn} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Discomfort Level: <span className="text-blue-600 font-bold text-sm">{painScore} / 10</span>
                </label>
                <span className="text-[11px] font-medium text-slate-500">
                  {painScore === 0 && 'No discomfort'}
                  {painScore >= 1 && painScore <= 3 && 'Mild pressure'}
                  {painScore >= 4 && painScore <= 6 && 'Moderate soreness'}
                  {painScore >= 7 && 'Significant pain'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={painScore}
                onChange={(e) => setPainScore(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Where do you feel the most discomfort?
              </label>
              <select
                value={discomfortLocation}
                onChange={(e) => setDiscomfortLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600"
              >
                <option value="Upper front teeth (incisors)">Upper front teeth (incisors)</option>
                <option value="Upper right canine / premolar area">Upper right canine / premolar area</option>
                <option value="Upper left canine / premolar area">Upper left canine / premolar area</option>
                <option value="Lower front teeth">Lower front teeth</option>
                <option value="Back molars (wire ends)">Back molars (wire ends)</option>
                <option value="General tooth pressure throughout mouth">General tooth pressure throughout mouth</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                What are you experiencing? (Select all that apply)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {symptomOptions.map((sym) => {
                  const isSelected = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Optional: Upload Smile or Bracket Photo
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 border border-slate-200 transition-colors">
                  <Camera className="w-4 h-4" />
                  <span>Choose Photo</span>
                  <input type="file" accept="image/*" onChange={handleSmilePhotoUpload} className="hidden" />
                </label>
                {uploadedSmilePhoto && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Photo attached
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Notes for {clinician?.name || 'Your Orthodontist'} (Optional)
              </label>
              <textarea
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                placeholder="Share any specific sensations, when it started, or if you applied wax..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>

            {checkInError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-medium">
                {checkInError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmittingCheckIn}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isSubmittingCheckIn ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Check-In...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Check-In &amp; Receive Guidance</span>
                </>
              )}
            </button>
          </form>

          {/* Guidance Result Box */}
          {checkInSubmitted && guidanceResult && (
            <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  {guidanceResult.headline}
                </span>
                <span className="text-[10px] text-blue-700 font-semibold bg-blue-100 px-2 py-0.5 rounded-full">
                  Saved to Clinical Record
                </span>
              </div>
              <p className="text-xs text-blue-900 leading-relaxed font-medium">{guidanceResult.guidanceText}</p>
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-bold text-blue-900 block">Recommended Comfort Measures:</span>
                <ul className="list-disc list-inside text-xs text-blue-800 space-y-1">
                  {guidanceResult.comfortActions.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TREATMENT TIMELINE VIEW */}
      {activePatientTab === 'treatment' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Your Orthodontic Journey
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {milestones.length > 0
                ? `Stage ${Math.min(milestones.filter((m) => m.status === 'completed').length + 1, milestones.length)} of ${milestones.length} In Progress`
                : 'Initial Consultation Stage'}
            </span>
          </div>

          {milestones.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-60" />
              <h3 className="text-sm font-bold text-slate-800">No Treatment Milestones Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Your clinical treatment timeline will update here as {clinician?.name || 'your care team'} logs each stage of your alignment and archwire progression.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      m.status === 'completed'
                        ? 'bg-blue-600 text-white'
                        : m.status === 'in_progress'
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {m.status === 'completed' ? <Check className="w-4 h-4" /> : m.stageNumber}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs text-slate-900">{m.title}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          m.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : m.status === 'in_progress'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {m.status.replace('_', ' ')}
                      </span>
                    </div>
                    {m.notes && <p className="text-xs text-slate-600 mt-1">{m.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CLINICAL MESSAGES VIEW */}
      {activePatientTab === 'messages' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-sm">Direct Clinic Messaging</h2>
            </div>
            <span className="text-xs text-slate-500">{clinician?.name || 'Primary Orthodontist'}</span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-100">
            {messages.length === 0 ? (
              <div className="py-10 text-center">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-70" />
                <p className="text-xs font-semibold text-slate-700">No messages in conversation yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Send a message directly to {clinician?.name || 'your orthodontic team'}. Your clinical care team typically responds within business hours.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.senderId === clinician.userId ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`p-3.5 rounded-2xl text-xs max-w-md ${
                      m.senderId === clinician.userId
                        ? 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                        : 'bg-blue-600 text-white rounded-br-xs'
                    }`}
                  >
                    <span className="text-[10px] font-bold block mb-1 opacity-75">
                      {m.senderId === clinician.userId ? clinician.name : 'You'} •{' '}
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <p className="leading-relaxed">{m.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Ask ${clinician?.name || 'your orthodontist'} a question...`}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
