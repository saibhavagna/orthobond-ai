import { NextRequest, NextResponse } from 'next/server';
import { generateCareCompanionTurn, generateFallbackCareCompanionTurn } from '@/server/services/geminiService';
import { CareCompanionRequestPayload, UserCheckinRecord, StructuredTriageMetadata } from '@/lib/types';
import { retrieveClinicalProtocols } from '@/server/knowledgeBase';

export async function POST(req: NextRequest) {
  let fallbackPayload: CareCompanionRequestPayload = {
    patientId: 'unknown',
    patientName: 'Patient',
    currentMessage: '',
    chatHistory: [],
  };

  try {
    const body = await req.json().catch(() => ({}));
    const { userId, patientId, patientName, currentMessage, chatHistory, context, longitudinalHistory } = body || {};

    if (!currentMessage || typeof currentMessage !== 'string' || !currentMessage.trim()) {
      return NextResponse.json(
        { error: 'A non-empty patient message is required' },
        { status: 400 }
      );
    }

    // Resolve stable identity for user checkins
    const resolvedUid = (typeof userId === 'string' && userId.trim())
      ? userId.trim()
      : (typeof patientId === 'string' && patientId.trim())
      ? patientId.trim()
      : 'patient_1';

    fallbackPayload = {
      patientId: resolvedUid,
      patientName: typeof patientName === 'string' && patientName.trim() ? patientName.trim() : 'Patient',
      currentMessage: currentMessage.trim().slice(0, 1000),
      chatHistory: Array.isArray(chatHistory)
        ? chatHistory.slice(-10).map((m: any) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: String(m.content || '').slice(0, 1000),
          }))
        : [],
      context: context && typeof context === 'object' ? context : undefined,
    };

    // 1. Ingest longitudinal context supplied from authenticated client session or clinical store
    const recentCheckins: UserCheckinRecord[] = Array.isArray(longitudinalHistory)
      ? longitudinalHistory.slice(0, 5)
      : [];

    // 2. Ingest clinical knowledge: RAG retrieval from structured orthodontic corpus
    const painScore = typeof context?.painScore === 'number' ? context.painScore : undefined;
    const symptoms = Array.isArray(context?.symptoms) ? context.symptoms : [];
    const { matchedProtocols, contextMarkdown, primarySuspectedIssue, recommendedUrgency } = retrieveClinicalProtocols(
      currentMessage,
      symptoms,
      painScore
    );

    // 3. Grounded Gemini Multi-Turn Generation
    const response = await generateCareCompanionTurn({
      payload: fallbackPayload,
      longitudinalHistory: recentCheckins,
      ragProtocolsMarkdown: contextMarkdown,
      primarySuspectedIssue,
      recommendedUrgency,
    });

    // 4. Extract and sanitize structured triage record
    const triage: StructuredTriageMetadata = response.triageMetadata || {
      urgency: recommendedUrgency,
      affectedRegion: context?.affectedArea || 'Generalized',
      suspectedIssue: primarySuspectedIssue,
      recommendedAction: 'Apply orthodontic relief wax over offending area and contact clinic if discomfort persists.',
    };

    const checkinDocId = `chk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // 5. Return response with triage metadata and telemetry for client-side persistence
    return NextResponse.json({
      ...response,
      triageMetadata: triage,
      checkinDocId,
      ragContext: {
        matchedProtocolsCount: matchedProtocols.length,
        longitudinalHistoryCount: recentCheckins.length,
        primarySuspectedIssue,
        recommendedUrgency,
      },
    });
  } catch (error: any) {
    console.warn('API Warning in care-companion, returning conservative clinical triage:', error?.message || error);
    const fallback = generateFallbackCareCompanionTurn(fallbackPayload);
    return NextResponse.json(fallback);
  }
}
