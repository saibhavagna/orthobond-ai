'use client';

import React, { useState, useRef } from 'react';
import { useOrthoStore } from '@/lib/store';
import { CLINICAL_SAMPLE_IMAGES } from '@/lib/demoData';
import { VisualFinding, VisualReview, ImageQualityAssessment } from '@/lib/types';
import {
  Upload,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Eye,
  Sliders,
  ChevronRight,
  ArrowLeft,
  Info,
  Layers,
  ZoomIn,
  X,
} from 'lucide-react';

interface BondingVerificationProps {
  onBackToTimeline: () => void;
}

export function BondingVerification({ onBackToTimeline }: BondingVerificationProps) {
  const { selectedPatient, clinician, activeTreatment, saveVisualReview, currentUser, role } = useOrthoStore();

  // Step state
  const [step, setStep] = useState<'input' | 'analyzing' | 'review' | 'saved'>('input');

  // Images state (default to Case 1 preloaded clinical images for instant demo testing)
  const [referenceImage, setReferenceImage] = useState<string>(CLINICAL_SAMPLE_IMAGES.case1_reference);
  const [actualImage, setActualImage] = useState<string>(CLINICAL_SAMPLE_IMAGES.case1_actual);

  // Optical Quality check state
  const [qualityAssessment, setQualityAssessment] = useState<ImageQualityAssessment>({
    status: 'optimal',
    overall_reviewable: true,
    blur_detected: false,
    lighting_adequate: true,
    glare_obstruction: false,
    hardware_visible: true,
    issues: [],
    recommendations: ['Field is dry and clear for bracket slot inspection'],
  });

  // Analysis result
  const [analysisSummary, setAnalysisSummary] = useState<string>('');
  const [findings, setFindings] = useState<VisualFinding[]>([]);
  const [limitations, setLimitations] = useState<string[]>([]);
  const [isSimulatedDemo, setIsSimulatedDemo] = useState<boolean>(false);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);

  // Clinician verification decision
  const [overallVerdict, setOverallVerdict] = useState<'approved' | 'reposition_needed' | 'flash_cleanup'>('reposition_needed');
  const [clinicianNotes, setClinicianNotes] = useState<string>(
    'Evaluated upper arch bonding. Tooth #12 bracket exhibits apparent gingival placement; will monitor rotation at first wire progression. Minimal composite flash at #21 to be removed with 12-fluted bur.'
  );

  // Analysis progress step description
  const [analysisPhase, setAnalysisPhase] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Handle file uploads
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'reference' | 'actual'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalysisError(null);

    if (!file.type.startsWith('image/')) {
      setAnalysisError('Please upload a valid clinical image file (JPEG, PNG, WEBP, or SVG).');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setAnalysisError('File size exceeds the 12MB limit. Please provide a standard intraoral image resolution.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      if (target === 'reference') {
        setReferenceImage(dataUri);
      } else {
        setActualImage(dataUri);
      }
    };
    reader.readAsDataURL(file);
  };

  // Run Gemini Multimodal Analysis
  const runAnalysis = async () => {
    setAnalysisError(null);
    setStep('analyzing');
    setAnalysisPhase('Validating photographic quality, dry field, and hardware visibility...');

    try {
      await new Promise((r) => setTimeout(r, 600));
      setAnalysisPhase('Transmitting dual-image multimodal inputs to Gemini Multimodal Flash...');

      const response = await fetch('/api/gemini/bracket-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ortho-role': currentUser?.role || role,
        },
        body: JSON.stringify({
          referenceImageBase64: referenceImage,
          actualImageBase64: actualImage,
          clinicalContext: {
            patientId: selectedPatient.id,
            archType: selectedPatient.archType,
            applianceType: activeTreatment?.applianceType,
          },
        }),
      });

      setAnalysisPhase('Synthesizing structured findings & computing normalized bounding coordinates...');
      await new Promise((r) => setTimeout(r, 600));

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      setQualityAssessment(data.image_quality);
      setAnalysisSummary(data.summary);
      setFindings(data.findings || []);
      setLimitations(data.limitations || []);
      setIsSimulatedDemo(Boolean(data.isSimulatedDemo));

      if (data.findings && data.findings.length > 0) {
        setSelectedFindingId(data.findings[0].finding_id);
      }

      setStep('review');
    } catch (err: any) {
      console.error('Analysis failure:', err);
      setAnalysisError(err.message || 'AI Analysis encountered an issue. Please verify connection and images.');
      setStep('input');
    }
  };

  // Update verification status for a specific finding
  const updateFindingStatus = (findingId: string, status: 'verified' | 'rejected' | 'needs_review') => {
    setFindings((prev) =>
      prev.map((f) => (f.finding_id === findingId ? { ...f, verification_status: status } : f))
    );
  };

  // Update clinician comment on a specific finding
  const updateFindingComment = (findingId: string, comment: string) => {
    setFindings((prev) =>
      prev.map((f) => (f.finding_id === findingId ? { ...f, clinician_comment: comment } : f))
    );
  };

  // Save the completed review to the treatment timeline
  const handleSaveReview = () => {
    const reviewId = `review-${Date.now()}`;
    const newReview: VisualReview = {
      id: reviewId,
      patientId: selectedPatient.id,
      clinicianId: clinician.id,
      treatmentId: selectedPatient.treatmentId,
      referenceImageUrl: referenceImage,
      actualImageUrl: actualImage,
      overall_reviewable: qualityAssessment.overall_reviewable,
      image_quality: qualityAssessment,
      summary: analysisSummary,
      findings,
      limitations,
      clinicianNotes: `[Verdict: ${
        overallVerdict === 'approved'
          ? 'Approved for current stage'
          : overallVerdict === 'reposition_needed'
          ? 'Bracket repositioning recommended'
          : 'Minor flash debridement needed'
      }] ${clinicianNotes}`,
      status: overallVerdict === 'reposition_needed' ? 'needs_followup' : 'verified',
      createdAt: new Date().toISOString(),
      isSimulatedDemo,
    };

    saveVisualReview(newReview);
    setStep('saved');
  };

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <button
              type="button"
              onClick={onBackToTimeline}
              className="hover:text-slate-800 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Patients</span>
            </button>
            <span>/</span>
            <span className="font-medium text-slate-700">{selectedPatient.name}</span>
            <span>/</span>
            <span className="font-semibold text-blue-600">Bonding Verification</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">Bonding Verification: Post-Treatment Review</h1>
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Hero Verification
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Patient: <span className="font-semibold text-slate-700">{selectedPatient.name}</span> • Primary Clinician:{' '}
            <span className="font-semibold text-slate-700">{clinician.clinicName}</span>
          </p>
        </div>

        {/* Action Controls & Clinical Assurance Banner */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToTimeline}
            className="px-4 py-2 border border-slate-200 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Discard / Back
          </button>
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-xs">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Multimodal 2D Visual Assistance</span>
          </div>
        </div>
      </div>

      {/* STEP 1: IMAGE INPUT & QUALITY CHECK */}
      {step === 'input' && (
        <div className="space-y-6">
          {/* In-UI Error Banner */}
          {analysisError && (
            <div
              id="analysis-error-banner"
              className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start justify-between gap-3 text-rose-800 shadow-2xs"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-rose-900">Verification Analysis Notice</h3>
                  <p className="text-xs text-rose-700 mt-0.5">{analysisError}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAnalysisError(null)}
                className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-100 transition-colors"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Preload Presets for instant clinical demonstration */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h2 className="font-semibold text-slate-900 text-sm">Demo Preset: Clinical Case #1 (Upper Arch Direct Bonding)</h2>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Pre-configured with high-resolution Virtual Setup Prescription vs Post-Curing Clinical Photograph (shows FDI 12 vertical offset and FDI 21 flash).
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setReferenceImage(CLINICAL_SAMPLE_IMAGES.case1_reference);
                  setActualImage(CLINICAL_SAMPLE_IMAGES.case1_actual);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
              >
                Reload Case #1 Preset
              </button>
            </div>
          </div>

          {/* Dual Upload Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Reference Setup */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Expected Reference (Digital Plan)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Virtual indirect bonding setup or target prescription model</p>
                </div>
                <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium cursor-pointer transition-colors">
                  <span>Browse...</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'reference')}
                  />
                </label>
              </div>

              {/* Preview Container with subtle geometric grid */}
              <div className="relative aspect-4/3 w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center min-h-[280px]">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
                {referenceImage ? (
                  <img
                    src={referenceImage}
                    alt="Reference Prescription Setup"
                    className="w-full h-full object-contain relative z-1"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-400 text-xs relative z-1">
                    <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Upload Reference Setup Model
                  </div>
                )}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-[10px] text-blue-300 font-mono uppercase tracking-wider z-2">
                  TARGET PRESCRIPTION
                </div>
              </div>
            </div>

            {/* Column 2: Actual Clinical Post-Bonding Image */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Actual Clinical Image (Post-Bonding)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Intraoral post-curing macro photograph with dry field</p>
                </div>
                <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium cursor-pointer transition-colors">
                  <span>Browse...</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'actual')}
                  />
                </label>
              </div>

              {/* Preview Container */}
              <div className="relative aspect-4/3 w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center min-h-[280px]">
                {actualImage ? (
                  <img
                    src={actualImage}
                    alt="Actual Clinical Post-Bonding Photo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-400 text-xs">
                    <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Upload Actual Post-Bonding Photo
                  </div>
                )}
                <div className="absolute top-3 right-3 z-10 bg-emerald-500 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow-xs uppercase tracking-wider">
                  Quality: Optimal
                </div>
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-[10px] text-emerald-300 font-mono uppercase tracking-wider">
                  ACTUAL CLINICAL
                </div>
              </div>
            </div>
          </div>

          {/* Optical Quality Pre-Check Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h2 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Automated Optical Image Quality Gate
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider mb-1">Optical Status</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Optimal (Direct Macro)
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                <span className="text-slate-500 block mb-1">Motion Blur</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> None Detected
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                <span className="text-slate-500 block mb-1">Dry Field / Saliva</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Clear Hardware View
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                <span className="text-slate-500 block mb-1">Slot Visibility</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Unobstructed
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={runAnalysis}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow-xs flex items-center gap-2 transition-all hover:shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run Gemini Multimodal Bracket Verification</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ANALYZING STATE */}
      {step === 'analyzing' && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-xl mx-auto shadow-xs space-y-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping opacity-60"></div>
            <div className="w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-blue-600">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">Conducting Multimodal Visual Analysis</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">{analysisPhase}</p>
          </div>

          <div className="space-y-2 text-left bg-slate-50 p-4 rounded-lg border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2 text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>1. Image quality gate passed (optimal resolution &amp; exposure)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>2. Multi-part payload dispatched to Gemini Multimodal Flash</span>
            </div>
            <div className="flex items-center gap-2 text-blue-700 font-medium animate-pulse">
              <Sliders className="w-4 h-4" />
              <span>3. Measuring visible slot trajectories &amp; adhesive boundaries...</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: INTERACTIVE REVIEW & OVERLAY */}
      {step === 'review' && (
        <div className="space-y-6">
          {/* Top Summary Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Visual Review Findings</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
                  {findings.length} Regions Highlighted
                </span>
                {isSimulatedDemo && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                    Demo / Simulated Analysis
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1">{analysisSummary}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition-colors"
              >
                Change Images
              </button>
            </div>
          </div>

          {/* Interactive Visual Overlay & Findings Inspector (Geometric Balance layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Image with Interactive Responsive Overlays (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Actual Image with AI Visual Overlays
                </span>
                <span className="text-[11px] text-slate-400">Click highlighted box or finding to inspect</span>
              </div>

              {/* Relative Container for Responsive Coordinate Mapping */}
              <div className="relative aspect-4/3 w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-300 select-none">
                <img
                  src={actualImage}
                  alt="Post-Bonding Actual Clinical Image"
                  className="w-full h-full object-contain pointer-events-none"
                />

                {/* Render Normalized Bounding Boxes */}
                {findings.map((f) => {
                  if (!f.bounding_box) return null;
                  const isSelected = selectedFindingId === f.finding_id;

                  const topPct = (f.bounding_box.ymin / 1000) * 100;
                  const leftPct = (f.bounding_box.xmin / 1000) * 100;
                  const heightPct = ((f.bounding_box.ymax - f.bounding_box.ymin) / 1000) * 100;
                  const widthPct = ((f.bounding_box.xmax - f.bounding_box.xmin) / 1000) * 100;

                  const isDeviation = f.apparent_difference.toLowerCase().includes('offset') || f.apparent_difference.toLowerCase().includes('deviat') || f.apparent_difference.toLowerCase().includes('discrepan') || f.apparent_difference.toLowerCase().includes('flash');
                  
                  let borderClass = isDeviation
                    ? 'border-2 border-orange-500 bg-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                    : 'border-2 border-blue-500 bg-blue-500/20';
                  
                  if (f.verification_status === 'verified') {
                    borderClass = 'border-2 border-blue-600 bg-blue-600/20';
                  } else if (f.verification_status === 'rejected') {
                    borderClass = 'border-2 border-rose-500 bg-rose-500/20';
                  }

                  return (
                    <div
                      key={f.finding_id}
                      onClick={() => setSelectedFindingId(f.finding_id)}
                      style={{
                        top: `${topPct}%`,
                        left: `${leftPct}%`,
                        height: `${heightPct}%`,
                        width: `${widthPct}%`,
                      }}
                      className={`absolute cursor-pointer rounded transition-all ${borderClass} ${
                        isSelected ? 'ring-2 ring-white scale-[1.02] z-20' : 'hover:scale-[1.01] z-10'
                      }`}
                      title={`${f.tooth_reference}: ${f.visual_observation}`}
                    >
                      <div className={`absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider whitespace-nowrap shadow-xs pointer-events-none ${
                        isDeviation ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {f.tooth_reference.split(' ')[0]}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend bar */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                <span className="font-bold text-slate-700">Legend:</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-orange-500"></span> Discrepancy / Attention Needed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-500"></span> Nominal / Verified
                </span>
              </div>
            </div>

            {/* Right Column: AI Observations List (Geometric Balance style) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">AI-Assisted Observations</h3>
                <span className="text-[10px] text-slate-400 italic font-mono">Gemini-3.8-Flash // Complete</span>
              </div>

              {/* Cards List matching Geometric Balance theme */}
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {findings.map((f) => {
                  const isSelected = selectedFindingId === f.finding_id;
                  const isDeviation = f.apparent_difference.toLowerCase().includes('offset') || f.apparent_difference.toLowerCase().includes('deviat') || f.apparent_difference.toLowerCase().includes('flash');

                  return (
                    <div
                      key={f.finding_id}
                      onClick={() => setSelectedFindingId(f.finding_id)}
                      className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                        isDeviation ? 'border-l-4 border-l-orange-500' : 'border-l-4 border-l-blue-600'
                      } ${
                        isSelected
                          ? 'border-slate-300 bg-slate-50 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                              isDeviation ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            {f.tooth_reference.match(/\d+/)?.[0] || '11'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs text-slate-800">{f.tooth_reference}</h4>
                              <span className="text-[10px] text-slate-400 font-mono">({f.finding_id})</span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">{f.visual_observation}</p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {f.verification_status === 'verified' ? (
                            <span className="px-2.5 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-md flex items-center gap-1 shadow-2xs">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          ) : f.verification_status === 'rejected' ? (
                            <span className="px-2.5 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-md flex items-center gap-1 shadow-2xs">
                              <XCircle className="w-3 h-3" /> Rejected
                            </span>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateFindingStatus(f.finding_id, 'rejected');
                                }}
                                className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md hover:bg-orange-100 hover:text-orange-700 transition-colors"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateFindingStatus(f.finding_id, 'verified');
                                }}
                                className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md border border-blue-200 hover:bg-blue-100 transition-colors"
                              >
                                Verify
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 text-xs bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="font-semibold text-slate-700">Apparent difference:</span>{' '}
                        <span className="text-slate-600">{f.apparent_difference}</span>
                      </div>

                      {/* Comment input */}
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Add clinician note for this region..."
                          value={f.clinician_comment || ''}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateFindingComment(f.finding_id, e.target.value)}
                          className="w-full text-xs px-2.5 py-1 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Clinician Synthesis & Save to Timeline (Geometric Balance Style) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Verification Summary &amp; Treatment Order</h3>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Clinical Synthesis</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xl font-bold text-slate-800">
                  {findings.length < 10 ? `0${findings.length}` : findings.length}
                </p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Total Findings</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xl font-bold text-orange-600">
                  {findings.filter((f) => f.verification_status === 'needs_review').length}
                </p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Pending Review</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xl font-bold text-blue-600">
                  {findings.filter((f) => f.verification_status === 'verified').length}
                </p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Verified Findings</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xl font-bold text-slate-600">
                  {findings.filter((f) => f.verification_status === 'rejected').length}
                </p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Rejected Findings</p>
              </div>
            </div>

            {/* Verdict selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <label
                className={`p-3 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                  overallVerdict === 'approved'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="verdict"
                  checked={overallVerdict === 'approved'}
                  onChange={() => setOverallVerdict('approved')}
                  className="hidden"
                />
                <div className="font-bold text-xs mb-0.5">Approve for Alignment Stage</div>
                <span className="text-slate-500 text-[10px]">Bonding matches virtual prescription parameters adequately</span>
              </label>

              <label
                className={`p-3 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                  overallVerdict === 'reposition_needed'
                    ? 'border-orange-600 bg-orange-50 text-orange-900 ring-1 ring-orange-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="verdict"
                  checked={overallVerdict === 'reposition_needed'}
                  onChange={() => setOverallVerdict('reposition_needed')}
                  className="hidden"
                />
                <div className="font-bold text-xs mb-0.5">Reposition Required</div>
                <span className="text-slate-500 text-[10px]">Schedule in-clinic bracket rebonding before progression</span>
              </label>

              <label
                className={`p-3 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                  overallVerdict === 'flash_cleanup'
                    ? 'border-slate-700 bg-slate-100 text-slate-900 ring-1 ring-slate-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="verdict"
                  checked={overallVerdict === 'flash_cleanup'}
                  onChange={() => setOverallVerdict('flash_cleanup')}
                  className="hidden"
                />
                <div className="font-bold text-xs mb-0.5">Flash Debridement</div>
                <span className="text-slate-500 text-[10px]">Clean excess composite at next check-in</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                Clinician Internal Observations &amp; Orders
              </label>
              <textarea
                rows={3}
                value={clinicianNotes}
                onChange={(e) => setClinicianNotes(e.target.value)}
                placeholder="Enter clinical observations, prescription updates, or instructions for the clinical team..."
                className="w-full text-xs p-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Limitations Notice */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-slate-500 space-y-0.5">
              <strong className="text-slate-700">Clinical Safety Record:</strong>
              {limitations.map((lim, idx) => (
                <div key={idx}>• {lim}</div>
              ))}
            </div>

            {/* Finalize button */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onBackToTimeline}
                className="px-4 py-2 border border-slate-200 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSaveReview}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-md shadow-slate-200 transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finalize &amp; Save Verification</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: SUCCESS CONFIRMATION */}
      {step === 'saved' && (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center max-w-lg mx-auto shadow-xs space-y-5">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs border border-blue-100">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">Verification Saved to Treatment Timeline</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              The verified bracket review, optical overlay records, and clinical orders have been permanently linked to{' '}
              <strong className="text-slate-700">{selectedPatient.name}</strong>&apos;s treatment history.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onBackToTimeline}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              View Updated Patient Timeline
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
