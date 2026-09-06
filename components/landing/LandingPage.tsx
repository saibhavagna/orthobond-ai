'use client';

import React from 'react';
import { useOrthoStore } from '@/lib/store';
import { OrthoBondMark } from '@/components/common/OrthoBondLogo';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  HeartHandshake,
  Camera,
  Activity,
  CheckCircle2,
  Lock,
  ChevronRight,
  Eye,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

export function LandingPage() {
  const { setAppView, loginWithDemo } = useOrthoStore();

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-500/20 selection:text-blue-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <OrthoBondMark size={36} theme="navy" />
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">OrthoBond AI</span>
              <span className="ml-2 hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                Clinical Care Platform
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={scrollToHowItWorks}
              className="hover:text-slate-900 transition-colors"
            >
              How It Works
            </button>
            <a href="#care-loop" className="hover:text-slate-900 transition-colors">
              Care Loop
            </a>
            <a href="#clinical-safety" className="hover:text-slate-900 transition-colors">
              Clinical Safety
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="landing-signin-btn"
              onClick={() => setAppView('login')}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              id="landing-getstarted-btn"
              onClick={() => setAppView('login')}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/80 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI-Assisted Orthodontic Care & Continuous Monitoring</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            OrthoBond AI
          </h1>
          <p className="text-2xl sm:text-3xl font-semibold text-slate-700 mt-3 tracking-tight">
            Smarter orthodontic bonding. Better patient monitoring.
          </p>

          <p className="max-w-2xl mx-auto mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">
            From everyday discomfort to clinician review, OrthoBond AI keeps orthodontic care
            connected between appointments.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              id="hero-getstarted-primary"
              onClick={() => setAppView('login')}
              className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
            <button
              type="button"
              id="hero-seehowitworks"
              onClick={scrollToHowItWorks}
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-700 font-medium text-base rounded-xl border border-slate-300 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>See how it works</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Quick Demo Access Pills for Judges */}
          <div className="mt-8 pt-6 border-t border-slate-200/70 inline-flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">
              Live Demo Shortcuts:
            </span>
            <button
              type="button"
              onClick={() => loginWithDemo('clinician')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
              <span>Explore as Clinician (Dr. Sarah Chen)</span>
            </button>
            <button
              type="button"
              onClick={() => loginWithDemo('patient')}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-medium border border-slate-300 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
              <span>Explore as Patient (Maya Lin)</span>
            </button>
          </div>
        </div>
      </section>

      {/* The Two Sides of the Product: Connected Care Loop */}
      <section id="care-loop" className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Connected Platform Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
              One connected care loop.
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Continuous patient monitoring seamlessly connected with Gemini multimodal AI and
              clinician-led verification.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
            {/* Left: Patient Experience */}
            <div className="lg:col-span-5 bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100 flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  Patient Experience
                </span>
                <span className="text-xs text-slate-500 font-medium">Anytime • At Home</span>
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                Express what you&apos;re experiencing
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Talk naturally with the OrthoBond Care Companion, record discomfort, add evidence,
                and stay connected with your orthodontist.
              </p>

              {/* Visual mini card */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                    ML
                  </div>
                  <div className="text-xs bg-slate-100 rounded-lg p-2.5 text-slate-800 flex-1">
                    &quot;My upper canine bracket popped off and the wire is poking my inner cheek.&quot;
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-rose-600" />
                    Pain Level: <strong>7 / 10</strong>
                  </span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-100 flex items-center gap-1">
                    <Camera className="w-3 h-3" /> Photo Attached
                  </span>
                </div>

                <div className="text-xs bg-blue-50/70 border border-blue-100 rounded-lg p-2.5 text-blue-900 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-blue-950">Immediate Safe Comfort:</span> Apply
                    orthodontic relief wax immediately over the sharp wire edge. Incident synthesized for
                    Dr. Chen.
                  </div>
                </div>
              </div>
            </div>

            {/* Middle: Connected Bridge */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center py-2 lg:py-0">
              <div className="hidden lg:flex flex-col items-center gap-2 text-slate-400">
                <div className="w-px h-12 bg-slate-300"></div>
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  ↔
                </div>
                <div className="w-px h-12 bg-slate-300"></div>
              </div>
              <div className="lg:hidden flex items-center justify-center gap-2 py-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Connected Care Loop ↔
                </span>
              </div>
            </div>

            {/* Right: Clinician Experience */}
            <div className="lg:col-span-5 bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" />
                  Clinician Experience
                </span>
                <span className="text-xs text-slate-500 font-medium">Clinical Workspace</span>
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                Review what needs attention
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Monitor patient concerns, review treatment progress, and use Gemini-assisted visual
                verification.
              </p>

              {/* Visual mini card */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Maya Lin</span>
                    <span className="text-slate-500">• Stage 2 Maxillary</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                    Priority Review
                  </span>
                </div>

                <div className="text-xs text-slate-700 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                  <span className="font-semibold text-slate-900">Triage Summary:</span> Hardware
                  impingement at Tooth 13 (Canine). Archwire distal extension friction.
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <span className="text-blue-700 font-medium flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Gemini Multimodal Review Ready
                  </span>
                  <span className="text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded">
                    Human-in-the-Loop
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / 4-Step Process */}
      <section id="how-it-works" className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              How OrthoBond AI Works
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              A structured, human-in-the-loop workflow designed for clinical safety and patient peace
              of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs relative">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm flex items-center justify-center mb-4 border border-blue-100">
                01
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">
                Patient Discomfort Intake
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Patients converse naturally with the Care Companion or submit structured check-ins,
                documenting pain and photos without medical jargon.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs relative">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm flex items-center justify-center mb-4 border border-blue-100">
                02
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">
                Safe AI Guidance & Structuring
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gemini provides conservative, non-diagnostic relief actions (wax, soft diet) and
                synthesizes reported issues into structured clinical incidents.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs relative">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm flex items-center justify-center mb-4 border border-blue-100">
                03
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">
                Clinician Triage Queue
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Orthodontists review priority concerns in seconds, inspecting photos, discomfort
                trends, and responding directly to patients.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs relative">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm flex items-center justify-center mb-4 border border-blue-100">
                04
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">
                Visual Bonding Verification
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gemini compares virtual prescription setups against actual clinical photographs,
                overlaying observations for explicit clinician verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Trust & Safety Boundary */}
      <section id="clinical-safety" className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Core Design Philosophy</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            &quot;AI assists. Clinician decides.&quot;
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            OrthoBond AI does not replace professional orthodontic judgment. The AI provides visual
            assistance, conservative relief instructions, and structured documentation. Every visual
            observation and treatment decision requires clinician verification.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Non-diagnostic patient guidance
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Human-in-the-loop visual review
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Authenticated patient data privacy
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <OrthoBondMark size={24} variant="badge" theme="blue" />
            <span>OrthoBond AI</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-normal">Orthodontic Visual Review & Patient Monitoring Platform</span>
          </div>
          <p className="text-slate-500 text-center sm:text-right">
            Built for Google AI Studio Build. Strictly for clinical demonstration and evaluation.
          </p>
        </div>
      </footer>
    </div>
  );
}
