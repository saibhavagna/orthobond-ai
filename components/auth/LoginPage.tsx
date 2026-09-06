'use client';

import React from 'react';
import { useOrthoStore } from '@/lib/store';
import { OrthoBondMark } from '@/components/common/OrthoBondLogo';
import {
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Stethoscope,
  HeartHandshake,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export function LoginPage() {
  const {
    loginWithGoogle,
    loginWithDemo,
    authStatus,
    loginError,
    setAppView,
  } = useOrthoStore();

  const isAuthenticating = authStatus === 'authenticating';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      {/* Top return button */}
      <div className="max-w-4xl w-full mx-auto mb-4">
        <button
          type="button"
          onClick={() => setAppView('landing')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to OrthoBond AI Home</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Visual Brand Area */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <OrthoBondMark size={40} theme="blue" />
              <span className="font-bold text-xl tracking-tight text-white">OrthoBond AI</span>
            </div>

            <div className="space-y-4">
              <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-blue-300 bg-blue-900/60 px-2.5 py-0.5 rounded-full border border-blue-700/50">
                Connected Orthodontics
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Your orthodontic care, connected.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Seamless collaboration between everyday patient comfort reports and clinical
                decision making.
              </p>
            </div>

            {/* Simple Visual Diagram: Patient → AI → Clinician */}
            <div className="mt-8 pt-6 border-t border-slate-700/60 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Connected Care Architecture
              </div>

              <div className="space-y-2 text-xs">
                {/* Step 1: Patient */}
                <div className="flex items-center gap-3 bg-slate-800/80 rounded-lg p-2.5 border border-slate-700">
                  <div className="w-7 h-7 rounded-md bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Patient Check-In</div>
                    <div className="text-[11px] text-slate-400">Talk naturally, record discomfort & photos</div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="text-center text-slate-500 text-xs">↓</div>

                {/* Step 2: AI */}
                <div className="flex items-center gap-3 bg-blue-950/40 rounded-lg p-2.5 border border-blue-800/50">
                  <div className="w-7 h-7 rounded-md bg-blue-600/30 text-blue-300 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-blue-200">Gemini Multimodal Triage</div>
                    <div className="text-[11px] text-blue-300/80">Structured findings & safe guidance</div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="text-center text-slate-500 text-xs">↓</div>

                {/* Step 3: Clinician */}
                <div className="flex items-center gap-3 bg-slate-800/80 rounded-lg p-2.5 border border-slate-700">
                  <div className="w-7 h-7 rounded-md bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Clinician Verification</div>
                    <div className="text-[11px] text-slate-400">Human decision, verified timeline updates</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom badge */}
          <div className="mt-8 pt-4 border-t border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>AI assists. Clinician decides.</span>
          </div>
        </div>

        {/* Right Authentication Panel */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">Welcome to OrthoBond AI</h1>
              <p className="text-sm text-slate-600">
                Sign in securely to access your orthodontic care records or clinical workspace.
              </p>
            </div>

            {/* Error banner if any */}
            {loginError && (
              <div className="mt-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">{loginError}</p>
                </div>
              </div>
            )}

            {/* Primary Google Auth Button */}
            <div className="mt-6 space-y-4">
              <button
                type="button"
                id="btn-google-signin"
                disabled={isAuthenticating}
                onClick={() => loginWithGoogle()}
                className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
              >
                {/* SVG Google icon */}
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isAuthenticating ? 'Connecting...' : 'Continue with Google'}</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] uppercase tracking-wider font-semibold text-slate-400 shrink-0">
                  Or use demo access for review
                </span>
                <div className="border-t border-slate-200 w-full"></div>
              </div>

              {/* Quick Persona Access Cards */}
              <div className="space-y-2.5">
                {/* Clinician Demo Button */}
                <button
                  type="button"
                  id="btn-demo-clinician"
                  onClick={() => loginWithDemo('clinician')}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/50 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      SC
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">Dr. Sarah Chen</span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                          Clinician
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Apex Orthodontics • Triage Queue & Bonding Verification
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Patient Demo Button */}
                <button
                  type="button"
                  id="btn-demo-patient"
                  onClick={() => loginWithDemo('patient')}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-rose-300 bg-slate-50/70 hover:bg-rose-50/50 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      ML
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">Maya Lin</span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                          Patient
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Stage 2 Maxillary • Care Companion & Daily Discomfort Tracking
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Trust statement */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Your personal care information is protected by authenticated access.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
