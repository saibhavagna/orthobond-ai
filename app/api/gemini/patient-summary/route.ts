import { NextRequest, NextResponse } from 'next/server';
import { generatePatientGuidance, generateFallbackPatientGuidance } from '@/server/services/geminiService';

export async function POST(req: NextRequest) {
  let fallbackParams = {
    painScore: 3,
    symptoms: [] as string[],
    discomfortLocation: 'General dental arch',
    notes: undefined as string | undefined,
  };

  try {
    const body = await req.json().catch(() => ({}));
    const { painScore, symptoms, discomfortLocation, notes } = body || {};

    const parsedPain = typeof painScore === 'number' && !isNaN(painScore)
      ? Math.max(0, Math.min(10, Math.round(painScore)))
      : 3;
    const parsedSymptoms = Array.isArray(symptoms) ? symptoms.filter((s) => typeof s === 'string') : [];
    const parsedLocation = typeof discomfortLocation === 'string' && discomfortLocation.trim()
      ? discomfortLocation.trim()
      : 'General dental arch';
    const parsedNotes = typeof notes === 'string' && notes.trim() ? notes.trim().slice(0, 1000) : undefined;

    fallbackParams = {
      painScore: parsedPain,
      symptoms: parsedSymptoms,
      discomfortLocation: parsedLocation,
      notes: parsedNotes,
    };

    const guidance = await generatePatientGuidance(fallbackParams);
    return NextResponse.json(guidance);
  } catch (error: any) {
    console.warn('API Warning in patient summary, returning safe conservative guidance:', error?.message || error);
    const fallbackGuidance = generateFallbackPatientGuidance(fallbackParams);
    return NextResponse.json(fallbackGuidance);
  }
}
