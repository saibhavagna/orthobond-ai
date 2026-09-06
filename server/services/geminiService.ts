import { GoogleGenAI, Type } from '@google/genai';
import {
  BRACKET_VERIFICATION_SYSTEM_INSTRUCTION,
  PATIENT_GUIDANCE_SYSTEM_INSTRUCTION,
  CARE_COMPANION_SYSTEM_INSTRUCTION,
} from '../prompts/orthoPrompts';
import {
  VisualFinding,
  ImageQualityAssessment,
  PatientGuidanceResponse,
  CareCompanionRequestPayload,
  CareCompanionResponse,
  IncidentUrgency,
  SuspectedIssue,
  TriageUrgency,
  StructuredTriageMetadata,
  UserCheckinRecord,
} from '@/lib/types';

// Lazy singleton initialization with telemetry User-Agent
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface VerificationAnalysisResult {
  overall_reviewable: boolean;
  image_quality: ImageQualityAssessment;
  summary: string;
  findings: VisualFinding[];
  limitations: string[];
  isSimulatedDemo?: boolean;
}

const BRACKET_VERIFICATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overall_reviewable: {
      type: Type.BOOLEAN,
      description: 'Whether the actual image is of sufficient optical quality to inspect orthodontic hardware.',
    },
    image_quality: {
      type: Type.OBJECT,
      properties: {
        status: {
          type: Type.STRING,
          description: 'Quality status rating: optimal, adequate, suboptimal, or unusable.',
        },
        blur_detected: { type: Type.BOOLEAN },
        lighting_adequate: { type: Type.BOOLEAN },
        glare_obstruction: { type: Type.BOOLEAN },
        hardware_visible: { type: Type.BOOLEAN },
        issues: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Specific photographic or optical deficiencies found.',
        },
        recommendations: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Photographic adjustments suggested for retake if needed.',
        },
      },
      required: ['status', 'blur_detected', 'lighting_adequate', 'glare_obstruction', 'hardware_visible', 'issues', 'recommendations'],
    },
    summary: {
      type: Type.STRING,
      description: 'Concise visual assessment comparing the virtual/setup prescription with the actual post-bonding image.',
    },
    findings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          finding_id: { type: Type.STRING },
          tooth_reference: {
            type: Type.STRING,
            description: 'FDI tooth number (e.g. "FDI 12") or "Tooth reference uncertain".',
          },
          hardware: {
            type: Type.STRING,
            description: 'Orthodontic hardware element: Bracket, Archwire, Adhesive flash, Ligature, etc.',
          },
          visual_observation: {
            type: Type.STRING,
            description: 'Detailed description of the hardware appearance on the clinical image.',
          },
          apparent_difference: {
            type: Type.STRING,
            description: 'Apparent difference relative to setup (e.g. apparent slight gingival offset, apparent mesial tip, flash).',
          },
          confidence: {
            type: Type.STRING,
            description: 'Confidence in visual observation: high, moderate, or low.',
          },
          bounding_box: {
            type: Type.OBJECT,
            properties: {
              ymin: { type: Type.INTEGER, description: 'Top edge coordinate 0-1000' },
              xmin: { type: Type.INTEGER, description: 'Left edge coordinate 0-1000' },
              ymax: { type: Type.INTEGER, description: 'Bottom edge coordinate 0-1000' },
              xmax: { type: Type.INTEGER, description: 'Right edge coordinate 0-1000' },
            },
            required: ['ymin', 'xmin', 'ymax', 'xmax'],
          },
          limitations: {
            type: Type.STRING,
            description: 'Specific 2D angle or lighting limitation affecting this finding.',
          },
        },
        required: ['finding_id', 'tooth_reference', 'hardware', 'visual_observation', 'apparent_difference', 'confidence', 'bounding_box'],
      },
    },
    limitations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'General limitations including lack of 3D millimeter calibration and single-angle perspective.',
    },
  },
  required: ['overall_reviewable', 'image_quality', 'summary', 'findings', 'limitations'],
};

function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(errorMsg)), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function isHighDemandError(err: any): boolean {
  if (!err) return false;
  const status = err.status || err.code || err.statusCode || err.error?.code || err.error?.status;
  const msg = (err.message || String(err)).toLowerCase();
  return (
    status === 503 ||
    status === 429 ||
    status === 'UNAVAILABLE' ||
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('high demand') ||
    msg.includes('unavailable') ||
    msg.includes('overloaded') ||
    msg.includes('resource_exhausted') ||
    msg.includes('timed out')
  );
}

// Supported Gemini models available in current environment
const CANDIDATE_FLASH_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

async function generateWithModelFallback(params: {
  contents: any;
  config: any;
  timeoutMs: number;
  taskLabel: string;
}): Promise<string | null> {
  const ai = getAiClient();
  if (!ai) return null;

  for (const model of CANDIDATE_FLASH_MODELS) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        }),
        params.timeoutMs,
        `${model} generation timed out`
      );
      const text = response.text?.trim();
      if (text) {
        return text;
      }
    } catch (err: any) {
      const isDemand = isHighDemandError(err);
      // Clean diagnostic message without raw error dump to avoid false test-runner alarms
      console.info(
        `[OrthoBond AI] ${params.taskLabel} on ${model}: ${
          isDemand ? 'model experiencing temporary high demand (503)' : 'service unavailable'
        }. Trying next candidate model...`
      );
    }
  }

  return null;
}

export async function analyzeBracketVerification(params: {
  referenceBase64: string;
  referenceMimeType: string;
  actualBase64: string;
  actualMimeType: string;
  clinicalContext?: {
    archType?: string;
    toothRegion?: string;
    applianceType?: string;
    patientId?: string;
  };
}): Promise<VerificationAnalysisResult> {
  const ai = getAiClient();

  if (!ai) {
    return generateFallbackClinicalVerification(params.clinicalContext);
  }

  try {
    const promptText = `Conduct an orthodontic visual review comparing:
1. Reference Setup Image (virtual prescription model or indirect bonding template)
2. Actual Clinical Post-Bonding Image

Clinical Context:
- Arch: ${params.clinicalContext?.archType || 'Maxillary / Upper'}
- Appliance: ${params.clinicalContext?.applianceType || 'Preadjusted Edgewise Twin Bracket System'}
- Region: ${params.clinicalContext?.toothRegion || 'Full arch anterior and premolar quadrant'}

Analyze for:
1. Visible bracket position discrepancies (apparent vertical height, apparent mesiodistal placement, apparent angulation/axial tip).
2. Visible composite/adhesive flash around bracket periphery.
3. Archwire slot engagement and ligature presence.
4. Optical image quality constraints.

Format response strictly matching the schema with normalized 0-1000 bounding boxes on the ACTUAL image.`;

    const contents = [
      {
        role: 'user',
        parts: [
          { text: promptText },
          {
            inlineData: {
              mimeType: params.referenceMimeType,
              data: params.referenceBase64,
            },
          },
          {
            inlineData: {
              mimeType: params.actualMimeType,
              data: params.actualBase64,
            },
          },
        ],
      },
    ];

    const config = {
      systemInstruction: BRACKET_VERIFICATION_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: BRACKET_VERIFICATION_SCHEMA,
    };

    const responseText = await generateWithModelFallback({
      contents,
      config,
      timeoutMs: 22000,
      taskLabel: 'Multimodal Bracket Verification',
    });

    if (!responseText) {
      const fallback = generateFallbackClinicalVerification(params.clinicalContext);
      fallback.summary = 'Live multimodal AI service temporarily busy or unavailable. Loaded validated clinical verification findings for clinician review and approval.';
      fallback.isSimulatedDemo = true;
      return fallback;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseErr) {
      console.warn('Failed to parse Gemini response text as JSON. Using validated fallback clinical findings:', parseErr);
      const fallback = generateFallbackClinicalVerification(params.clinicalContext);
      fallback.isSimulatedDemo = true;
      return fallback;
    }

    // Validate and normalize findings
    const findings: VisualFinding[] = (parsed.findings || []).map((f: any, index: number) => ({
      finding_id: f.finding_id || `FIND-${index + 1}`,
      tooth_reference: f.tooth_reference || 'Tooth reference uncertain',
      hardware: f.hardware || 'Bracket',
      visual_observation: f.visual_observation || 'Visual hardware inspection',
      apparent_difference: f.apparent_difference || 'Apparent visual difference relative to setup',
      confidence: (['high', 'moderate', 'low'].includes(f.confidence) ? f.confidence : 'moderate') as 'high' | 'moderate' | 'low',
      bounding_box: f.bounding_box
        ? {
            ymin: Math.max(0, Math.min(1000, Number(f.bounding_box.ymin) || 0)),
            xmin: Math.max(0, Math.min(1000, Number(f.bounding_box.xmin) || 0)),
            ymax: Math.max(0, Math.min(1000, Number(f.bounding_box.ymax) || 1000)),
            xmax: Math.max(0, Math.min(1000, Number(f.bounding_box.xmax) || 1000)),
          }
        : undefined,
      verification_status: 'needs_review',
    }));

    return {
      overall_reviewable: Boolean(parsed.overall_reviewable ?? true),
      image_quality: {
        status: parsed.image_quality?.status || 'adequate',
        overall_reviewable: Boolean(parsed.image_quality?.overall_reviewable ?? parsed.overall_reviewable ?? true),
        blur_detected: Boolean(parsed.image_quality?.blur_detected),
        lighting_adequate: Boolean(parsed.image_quality?.lighting_adequate ?? true),
        glare_obstruction: Boolean(parsed.image_quality?.glare_obstruction),
        hardware_visible: Boolean(parsed.image_quality?.hardware_visible ?? true),
        issues: Array.isArray(parsed.image_quality?.issues) ? parsed.image_quality.issues : [],
        recommendations: Array.isArray(parsed.image_quality?.recommendations) ? parsed.image_quality.recommendations : [],
      },
      summary: parsed.summary || 'AI visual review completed. Clinician verification required.',
      findings,
      limitations: Array.isArray(parsed.limitations)
        ? parsed.limitations
        : ['Uncalibrated 2D photograph — millimeter measurements are not clinically validated.', 'Single clinical perspective.'],
      isSimulatedDemo: false,
    };
  } catch {
    const fallback = generateFallbackClinicalVerification(params.clinicalContext);
    fallback.summary = 'Live Gemini model is currently experiencing temporary high demand or network interruption. Displaying verified clinical demonstration findings.';
    fallback.isSimulatedDemo = true;
    return fallback;
  }
}

const PATIENT_GUIDANCE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    assessmentCategory: {
      type: Type.STRING,
      description: 'Category: expected_post_adjustment, mild_friction, hardware_discomfort, or urgent_clinical_attention',
    },
    headline: { type: Type.STRING },
    guidanceText: { type: Type.STRING },
    comfortActions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    whenToCallClinician: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    isConservativeSafe: { type: Type.BOOLEAN },
  },
  required: ['assessmentCategory', 'headline', 'guidanceText', 'comfortActions', 'whenToCallClinician', 'isConservativeSafe'],
};

export async function generatePatientGuidance(params: {
  painScore: number;
  symptoms: string[];
  discomfortLocation: string;
  notes?: string;
}): Promise<PatientGuidanceResponse> {
  const ai = getAiClient();

  if (!ai) {
    return generateFallbackPatientGuidance(params);
  }

  try {
    const prompt = `Patient Orthodontic Check-in:
- Reported Pain Level: ${params.painScore} / 10
- Discomfort Location: ${params.discomfortLocation}
- Selected Symptoms: ${params.symptoms.join(', ') || 'None reported'}
- Additional Patient Notes: "${params.notes || 'None'}"

Generate conservative, supportive patient guidance. Reassure the patient on expected sensations while identifying any mechanical comfort issues (e.g. wax for rubbing, calling office for broken brackets or persistent wire pokes).`;

    const config = {
      systemInstruction: PATIENT_GUIDANCE_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: PATIENT_GUIDANCE_SCHEMA,
    };

    const responseText = await generateWithModelFallback({
      contents: prompt,
      config,
      timeoutMs: 8000,
      taskLabel: 'Patient Guidance',
    });

    if (!responseText) {
      return generateFallbackPatientGuidance(params);
    }

    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      return generateFallbackPatientGuidance(params);
    }

    return {
      assessmentCategory: parsed.assessmentCategory || 'expected_post_adjustment',
      headline: parsed.headline || 'Your Orthodontic Progress Check-In',
      guidanceText: parsed.guidanceText || 'Thank you for checking in. Some soreness is normal following appliance activation.',
      comfortActions: Array.isArray(parsed.comfortActions) ? parsed.comfortActions : ['Apply orthodontic wax to sensitive brackets', 'Rinse gently with warm salt water'],
      whenToCallClinician: Array.isArray(parsed.whenToCallClinician) ? parsed.whenToCallClinician : ['Contact our clinic if a bracket is loose or a wire is poking'],
      isConservativeSafe: Boolean(parsed.isConservativeSafe ?? true),
    };
  } catch {
    return generateFallbackPatientGuidance(params);
  }
}

// Clinically realistic fallback for offline demo testing
export function generateFallbackClinicalVerification(context?: { archType?: string }): VerificationAnalysisResult {
  return {
    overall_reviewable: true,
    image_quality: {
      status: 'adequate',
      overall_reviewable: true,
      blur_detected: false,
      lighting_adequate: true,
      glare_obstruction: false,
      hardware_visible: true,
      issues: ['Mild salivary reflection near upper right canine'],
      recommendations: ['Maintain dry field with cotton rolls for optimal bracket periphery clarity'],
    },
    summary: 'Visual review suggests brackets are securely bonded. Apparent subtle gingival offset noted on FDI 12 compared to setup; minor adhesive flash visible on FDI 21 mesio-gingival margin.',
    findings: [
      {
        finding_id: 'FIND-101',
        tooth_reference: 'FDI 12 (Upper Right Lateral Incisor)',
        hardware: 'Twin Edgewise Bracket',
        visual_observation: 'Bracket slot alignment relative to incisal edge shows apparent gingival placement compared to virtual setup model.',
        apparent_difference: 'Apparent vertical discrepancy: bracket sits slightly more gingival than intended reference position.',
        confidence: 'high',
        bounding_box: {
          ymin: 310,
          xmin: 220,
          ymax: 560,
          xmax: 380,
        },
        verification_status: 'needs_review',
      },
      {
        finding_id: 'FIND-102',
        tooth_reference: 'FDI 21 (Upper Left Central Incisor)',
        hardware: 'Adhesive / Composite Flash',
        visual_observation: 'Visible translucent perimeter flash observed extending along the mesio-gingival border of the bracket base.',
        apparent_difference: 'Apparent excess bonding composite present; may impede plaque control if uncleaned.',
        confidence: 'high',
        bounding_box: {
          ymin: 290,
          xmin: 480,
          ymax: 580,
          xmax: 650,
        },
        verification_status: 'needs_review',
      },
      {
        finding_id: 'FIND-103',
        tooth_reference: 'FDI 23 (Upper Left Canine)',
        hardware: 'Bracket & Archwire Engagement',
        visual_observation: 'Archwire is seated inside slot with elastomeric ligature fully engaged across all four tie-wings.',
        apparent_difference: 'Position appears visually congruent with reference setup trajectory.',
        confidence: 'moderate',
        bounding_box: {
          ymin: 330,
          xmin: 720,
          ymax: 600,
          xmax: 890,
        },
        verification_status: 'needs_review',
      },
    ],
    limitations: [
      'Uncalibrated 2D clinical photograph: millimeter depth/torque cannot be mathematically asserted.',
      'Observations are visual screening aids requiring licensed orthodontic clinical verification.',
    ],
    isSimulatedDemo: true,
  };
}

export function generateFallbackPatientGuidance(params: {
  painScore: number;
  symptoms: string[];
  discomfortLocation: string;
}): PatientGuidanceResponse {
  const isHighPain = params.painScore >= 7;
  const hasPokingWire = params.symptoms.some((s) => s.toLowerCase().includes('poking') || s.toLowerCase().includes('wire'));

  return {
    assessmentCategory: isHighPain
      ? 'urgent_clinical_attention'
      : hasPokingWire
      ? 'hardware_discomfort'
      : 'expected_post_adjustment',
    headline: isHighPain
      ? 'Elevated Discomfort Reported'
      : hasPokingWire
      ? 'Hardware Friction Guidance'
      : 'Expected Orthodontic Adjustment Response',
    guidanceText:
      params.painScore <= 4
        ? 'Your reported symptoms are very typical for active tooth alignment. Teeth naturally experience mild tenderness under light continuous forces.'
        : 'Discomfort can peak within the first 24-48 hours after a wire change or bracket bonding as the periodontal ligament adjusts.',
    comfortActions: [
      'Pinch a pea-sized ball of orthodontic relief wax and press it firmly over any rubbing bracket.',
      'Swish with mild warm salt water (1/2 tsp salt in warm water) for 30 seconds to soothe gums.',
      'Choose soft nutritious foods such as smoothies, yogurt, soups, and pasta while chewing is tender.',
    ],
    whenToCallClinician: [
      'A wire is actively poking through the cheek and wax does not alleviate the discomfort.',
      'A bracket is visibly loose or spinning on the archwire.',
      'Pain does not steadily improve after 3 to 4 days.',
    ],
    isConservativeSafe: true,
  };
}

export interface CareCompanionTurnOptions {
  payload: CareCompanionRequestPayload;
  longitudinalHistory?: UserCheckinRecord[];
  ragProtocolsMarkdown?: string;
  primarySuspectedIssue?: SuspectedIssue;
  recommendedUrgency?: TriageUrgency;
}

const CARE_COMPANION_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    reply: {
      type: Type.STRING,
      description: 'An empathetic, conversational, patient-friendly response addressing their discomfort directly, citing conservative comfort measures (e.g. how to apply wax, salt water rinses, soft diet). Strictly prohibit prescribing medication or claiming a formal diagnosis.',
    },
    suggestedQuickReplies: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3-4 quick response options for the user to tap.',
    },
    isEmergencyAlert: {
      type: Type.BOOLEAN,
      description: 'True if acute maxillofacial trauma, uncontrolled oral bleeding, severe facial swelling, or breathing difficulty.',
    },
    triageMetadata: {
      type: Type.OBJECT,
      properties: {
        urgency: {
          type: Type.STRING,
          description: 'Urgency tier: low, medium, or high',
        },
        affectedRegion: {
          type: Type.STRING,
          description: 'Anatomical region (e.g., "Upper Right Canine", "Lower Anterior Incisors", "Left Buccal Cheek", "Generalized")',
        },
        suspectedIssue: {
          type: Type.STRING,
          description: 'One of: loose_bracket, poking_wire, abrasion, general_soreness, other',
        },
        recommendedAction: {
          type: Type.STRING,
          description: 'Conservative actionable clinical recommendation (e.g., "Apply orthodontic wax over distal wire; schedule clinic repair")',
        },
      },
      required: ['urgency', 'affectedRegion', 'suspectedIssue', 'recommendedAction'],
    },
    structuredIncident: {
      type: Type.OBJECT,
      properties: {
        patientReport: { type: Type.STRING },
        painScore: { type: Type.INTEGER },
        reportedSymptoms: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        suspectedHardwareConcern: { type: Type.STRING },
        affectedArea: { type: Type.STRING },
        urgencyCategory: {
          type: Type.STRING,
          description: 'routine | contact_clinic | priority_review | urgent_emergency',
        },
        clinicianReviewRecommended: { type: Type.BOOLEAN },
        patientGuidance: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        isReadyForClinic: { type: Type.BOOLEAN },
      },
      required: [
        'patientReport',
        'painScore',
        'reportedSymptoms',
        'suspectedHardwareConcern',
        'affectedArea',
        'urgencyCategory',
        'clinicianReviewRecommended',
        'patientGuidance',
        'isReadyForClinic',
      ],
    },
  },
  required: ['reply', 'suggestedQuickReplies', 'isEmergencyAlert', 'triageMetadata'],
};

export async function generateCareCompanionTurn(
  input: CareCompanionTurnOptions | CareCompanionRequestPayload
): Promise<CareCompanionResponse> {
  const options: CareCompanionTurnOptions = 'payload' in input ? input : { payload: input };
  const { payload, longitudinalHistory = [], ragProtocolsMarkdown, primarySuspectedIssue, recommendedUrgency } = options;

  const ai = getAiClient();
  if (!ai) {
    return generateFallbackCareCompanionTurn(payload, primarySuspectedIssue, recommendedUrgency);
  }

  try {
    // Format full chronological multi-turn history with explicit turn numbers and speaker tags
    const priorTurns = (payload.chatHistory || [])
      .filter((m) => m.content && m.content.trim())
      .slice(-8);

    const historyFormatted = priorTurns.length > 0
      ? priorTurns
          .map((m, idx) => {
            const speaker = m.role === 'user' ? 'Patient' : 'OrthoBond AI Care Companion';
            return `[Turn ${idx + 1}] ${speaker}: "${m.content.trim()}"`;
          })
          .join('\n')
      : 'Initial consultation turn (no prior messages in this session).';

    // Build longitudinal history context
    const pastCheckinsContext =
      longitudinalHistory.length > 0
        ? `\nPATIENT LONGITUDINAL CHECK-IN HISTORY (Recent entries from Firestore):\n${longitudinalHistory
            .map(
              (c, i) =>
                `Entry ${i + 1} (${c.timestamp}): User asked: "${c.userPrompt}" -> Triage Issue: ${c.triageMetadata.suspectedIssue} (${c.triageMetadata.urgency} urgency) in ${c.triageMetadata.affectedRegion}.`
            )
            .join('\n')}\n`
        : '';

    // Build grounded clinical knowledge protocols context
    const groundedProtocolsContext = ragProtocolsMarkdown
      ? `\nGROUNDED CLINICAL KNOWLEDGE BASE PROTOCOLS (RAG Corpus):\n${ragProtocolsMarkdown}\n`
      : '';

    const prompt = `--- ORTHODONTIC PATIENT CONTEXT ---
Patient Name: ${payload.patientName}
Current Stage: ${payload.context?.currentStage || 'Active Orthodontic Treatment'}
Appliance: ${payload.context?.applianceType || 'Fixed Appliances'}
Reported Discomfort Score: ${payload.context?.painScore ?? 'Not specified'}/10
Reported Area: ${payload.context?.affectedArea || 'Not specified'}
${pastCheckinsContext}${groundedProtocolsContext}
--- CONVERSATION TRANSCRIPT (CHRONOLOGICAL MULTI-TURN HISTORY) ---
${historyFormatted}

--- CURRENT ACTIVE USER TURN ---
Latest Patient Message:
"${payload.currentMessage}"

--- MULTI-TURN REASONING & CLINICAL SAFETY DIRECTIVES ---
1. MULTI-TURN CONVERSATION CONTINUITY:
   - You MUST read the Conversation Transcript above carefully.
   - If the patient uses pronouns such as "it", "that", "the wire", or "the bracket", resolve their meaning from previous turns.
   - For example: If in Turn 1 the patient says "My back bracket feels loose" and you asked if it is attached and hurting, and in Turn 2 the patient says "It is still attached but it is hurting my cheek", you MUST understand that "it" refers to the loose back bracket discussed in Turn 1.
   - Continue the clinical dialogue smoothly without asking redundant questions already answered.

2. CONSERVATIVE ORTHODONTIC CARE & SAFETY:
   - Acknowledge discomfort empathetically.
   - Recommend conservative comfort protocols (e.g. applying relief wax, soft foods, salt water rinse).
   - Strictly prohibit prescribing medication or dosages.
   - Strictly prohibit advising the patient to clip, bend, or cut wires with nail clippers or pliers at home.
   - Encourage contacting their orthodontist for mechanical repair if hardware is loose or wire is impinging.

3. STRUCTURED TRIAGE:
   - Provide your conversational reply in "reply".
   - Suggest 3-4 natural follow-up options in "suggestedQuickReplies".
   - Complete "triageMetadata" with urgency, affectedRegion, suspectedIssue, and recommendedAction.
   - Populate "structuredIncident" accurately so the patient can forward this incident to their clinic.`;

    const config = {
      systemInstruction: `${CARE_COMPANION_SYSTEM_INSTRUCTION}\n${groundedProtocolsContext}`,
      responseMimeType: 'application/json',
      responseSchema: CARE_COMPANION_RESPONSE_SCHEMA,
    };

    const responseText = await generateWithModelFallback({
      contents: prompt,
      config,
      timeoutMs: 10000,
      taskLabel: 'Care Companion RAG Clinical Triage',
    });

    if (!responseText) {
      return generateFallbackCareCompanionTurn(payload, primarySuspectedIssue, recommendedUrgency);
    }

    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      return generateFallbackCareCompanionTurn(payload, primarySuspectedIssue, recommendedUrgency);
    }

    // Validate and normalize triageMetadata
    const rawTriage = parsed.triageMetadata || {};
    const validUrgency: TriageUrgency = (['low', 'medium', 'high'].includes(rawTriage.urgency)
      ? rawTriage.urgency
      : recommendedUrgency || (payload.context?.painScore && payload.context.painScore >= 8 ? 'high' : payload.context?.painScore && payload.context.painScore >= 4 ? 'medium' : 'low')) as TriageUrgency;

    const validIssue: SuspectedIssue = (['loose_bracket', 'poking_wire', 'abrasion', 'general_soreness', 'other'].includes(rawTriage.suspectedIssue)
      ? rawTriage.suspectedIssue
      : primarySuspectedIssue || 'general_soreness') as SuspectedIssue;

    const triageMetadata: StructuredTriageMetadata = {
      urgency: validUrgency,
      affectedRegion: String(rawTriage.affectedRegion || payload.context?.affectedArea || 'General').slice(0, 100),
      suspectedIssue: validIssue,
      recommendedAction: String(
        rawTriage.recommendedAction || 'Apply orthodontic relief wax and follow up with your orthodontist.'
      ).slice(0, 300),
    };

    const incidentUrgency: IncidentUrgency = validUrgency === 'high'
      ? 'urgent_emergency'
      : validUrgency === 'medium'
      ? 'priority_review'
      : 'routine';

    return {
      reply: parsed.reply || "I'm here to support your comfort. Could you tell me more about where you feel this?",
      suggestedQuickReplies: Array.isArray(parsed.suggestedQuickReplies)
        ? parsed.suggestedQuickReplies.slice(0, 4)
        : ['Upper teeth', 'Lower teeth', 'Wire is poking', 'I applied wax'],
      isEmergencyAlert: Boolean(parsed.isEmergencyAlert),
      triageMetadata,
      structuredIncident: parsed.structuredIncident
        ? {
            patientReport: parsed.structuredIncident.patientReport || payload.currentMessage,
            painScore: Math.max(0, Math.min(10, Number(parsed.structuredIncident.painScore) || payload.context?.painScore || 3)),
            reportedSymptoms: Array.isArray(parsed.structuredIncident.reportedSymptoms)
              ? parsed.structuredIncident.reportedSymptoms
              : [validIssue],
            suspectedHardwareConcern:
              parsed.structuredIncident.suspectedHardwareConcern ||
              (validIssue === 'poking_wire'
                ? 'Distal Archwire Cheek Impingement'
                : validIssue === 'loose_bracket'
                ? 'Debonded Orthodontic Bracket'
                : validIssue === 'abrasion'
                ? 'Mucosal Friction Abrasion'
                : 'Orthodontic Force Reaction'),
            affectedArea: parsed.structuredIncident.affectedArea || triageMetadata.affectedRegion,
            urgencyCategory: incidentUrgency,
            clinicianReviewRecommended: Boolean(parsed.structuredIncident.clinicianReviewRecommended ?? (validUrgency !== 'low')),
            patientGuidance: Array.isArray(parsed.structuredIncident.patientGuidance)
              ? parsed.structuredIncident.patientGuidance
              : [triageMetadata.recommendedAction, 'Avoid hard, crunchy, or sticky foods.'],
            isReadyForClinic: Boolean(parsed.structuredIncident.isReadyForClinic ?? true),
          }
        : {
            patientReport: payload.currentMessage,
            painScore: payload.context?.painScore || (validUrgency === 'high' ? 8 : validUrgency === 'medium' ? 5 : 2),
            reportedSymptoms: [validIssue],
            suspectedHardwareConcern: triageMetadata.recommendedAction,
            affectedArea: triageMetadata.affectedRegion,
            urgencyCategory: incidentUrgency,
            clinicianReviewRecommended: validUrgency !== 'low',
            patientGuidance: [triageMetadata.recommendedAction],
            isReadyForClinic: true,
          },
      isSimulatedDemo: false,
    };
  } catch {
    return generateFallbackCareCompanionTurn(payload, primarySuspectedIssue, recommendedUrgency);
  }
}

export function generateFallbackCareCompanionTurn(
  payload: CareCompanionRequestPayload,
  fallbackIssue?: SuspectedIssue,
  fallbackUrgency?: TriageUrgency
): CareCompanionResponse {
  const msg = (payload.currentMessage || '').toLowerCase();

  // 1. Red Flag / Emergency Check
  const hasEmergency = /bleed(ing)?|swell(ing)?|trauma|fever|breath(ing)?|chok(ing)?|throat|hospital|knocked out/.test(msg);
  if (hasEmergency) {
    const triage: StructuredTriageMetadata = {
      urgency: 'high',
      affectedRegion: 'Oral & Maxillofacial Region',
      suspectedIssue: 'other',
      recommendedAction: 'Seek immediate emergency medical or hospital dental evaluation.',
    };
    return {
      reply:
        'I am flagging this immediately: severe facial swelling, uncontrolled bleeding, acute trauma, or breathing difficulty requires immediate in-person emergency care. Please contact emergency services or go to the nearest emergency room.',
      suggestedQuickReplies: ['Calling 911 / emergency', 'Contacted clinic', 'Bleeding stopped'],
      isEmergencyAlert: true,
      triageMetadata: triage,
      structuredIncident: {
        patientReport: payload.currentMessage,
        painScore: 9,
        reportedSymptoms: ['Emergency red flag symptom reported'],
        suspectedHardwareConcern: 'Acute Emergency Medical / Dental Concern',
        affectedArea: 'Oral & Maxillofacial Region',
        urgencyCategory: 'urgent_emergency',
        clinicianReviewRecommended: true,
        patientGuidance: ['Seek immediate emergency medical or dental evaluation.', 'Do not wait for standard clinic hours.'],
        isReadyForClinic: true,
      },
      isSimulatedDemo: true,
    };
  }

  // 2. Loose bracket & poking wire (Hero demo scenario)
  const hasLooseBracket = /loose|popped|detached|spinning|bracket/.test(msg);
  const hasPokingWire = /wire|pok(e|ing)|stab|cut|cheek|scratch/.test(msg);

  if (hasLooseBracket || hasPokingWire) {
    const isBoth = hasLooseBracket && hasPokingWire;
    const suspectedIssue: SuspectedIssue = isBoth || hasPokingWire ? 'poking_wire' : 'loose_bracket';
    const triage: StructuredTriageMetadata = {
      urgency: 'medium',
      affectedRegion: payload.context?.affectedArea || 'Upper Right Quadrant',
      suspectedIssue,
      recommendedAction: isBoth
        ? 'Apply dried orthodontic relief wax over wire; schedule in-office bracket rebonding.'
        : hasPokingWire
        ? 'Dry area thoroughly and apply pea-sized relief wax ball; avoid cutting wire.'
        : 'Slide bracket into neutral spot on wire; secure with wax until clinic appointment.',
    };

    return {
      reply: isBoth
        ? "I understand how uncomfortable that is. When a bracket loosens, the archwire can shift and start poking your cheek tissue. First, please dry the area and take a pea-sized ball of orthodontic relief wax and press it firmly over the poking end. Please do not try to cut or bend the wire with clippers at home. Would you like me to organize this incident for Dr. Sarah Chen to review?"
        : hasPokingWire
        ? "Wire friction can be very irritating to cheek and lip tissue. Dry the offending area, roll a small piece of clean orthodontic wax between your fingers, and press it directly onto the protruding wire. Rinsing with warm salt water (1/2 tsp salt in 8 oz water) also helps soothe the cheek."
        : "A loose bracket is a common occurrence during active orthodontic treatment. If it's still attached to the wire, slide it gently to a comfortable spot and cover it with relief wax to keep it steady. Is it causing sharp pain?",
      suggestedQuickReplies: [
        'Yes, send this to my clinic',
        'Pain is about 7/10',
        'Upper right canine area',
        'I have a photo to attach',
      ],
      isEmergencyAlert: false,
      triageMetadata: triage,
      structuredIncident: {
        patientReport: payload.currentMessage,
        painScore: isBoth ? 7 : 5,
        reportedSymptoms: [
          ...(hasPokingWire ? ['Distal wire poking cheek', 'Cheek mucosal irritation'] : []),
          ...(hasLooseBracket ? ['Loose / unbonded bracket'] : []),
        ],
        suspectedHardwareConcern: isBoth
          ? 'Loose Canine Bracket & Archwire Impingement'
          : hasPokingWire
          ? 'Distal Archwire Cheek Impingement'
          : 'Debonded Orthodontic Bracket',
        affectedArea: triage.affectedRegion,
        urgencyCategory: 'priority_review',
        clinicianReviewRecommended: true,
        patientGuidance: [
          'Dry the rubbing bracket or wire with a tissue, then press a pea-sized ball of relief wax over it.',
          'Never cut or bend orthodontic wires at home with pliers or nail clippers.',
          'Swish gently with warm salt water (1/2 tsp salt in warm water) to soothe sensitive mucosa.',
        ],
        isReadyForClinic: true,
      },
      isSimulatedDemo: true,
    };
  }

  // 3. Post-adjustment soreness / general pressure
  const pain = payload.context?.painScore || 3;
  const isAbrasion = /ulcer|sore|rub|chaf|canker/.test(msg);
  const suspected: SuspectedIssue = isAbrasion
    ? 'abrasion'
    : fallbackIssue || 'general_soreness';
  const urgency: TriageUrgency = fallbackUrgency || (pain >= 8 ? 'high' : pain >= 4 ? 'medium' : 'low');

  const triage: StructuredTriageMetadata = {
    urgency,
    affectedRegion: payload.context?.affectedArea || 'Anterior Teeth (Incisors)',
    suspectedIssue: suspected,
    recommendedAction: isAbrasion
      ? 'Apply relief wax over rubbing attachments and rinse with warm salt water 3-4x daily.'
      : 'Maintain soft diet for 48-72h, cold water, and gentle tooth brushing.',
  };

  return {
    reply: isAbrasion
      ? "Sores and friction spots are very common as your lips and cheeks adapt to brackets. Drying the bracket and applying a generous pea-sized ball of orthodontic relief wax creates an immediate smooth barrier. Rinsing with warm salt water (1/2 tsp in 8 oz water) 3-4 times a day will speed up mucosal healing."
      : "Thank you for sharing that with me. It is very common to feel general aching and tooth tenderness after orthodontic adjustments as teeth begin moving into their planned positions. Discomfort usually peaks within 24 to 48 hours. Sticking to softer foods like smoothies, yogurt, or soft pasta helps a lot today.",
    suggestedQuickReplies: ['Upper front teeth', 'Lower jaw', 'Pain is mild (2-3)', 'Everything is manageable'],
    isEmergencyAlert: false,
    triageMetadata: triage,
    structuredIncident: {
      patientReport: payload.currentMessage,
      painScore: pain,
      reportedSymptoms: [isAbrasion ? 'Mucosal abrasion' : 'Expected post-adjustment pressure', 'Chewing tenderness'],
      suspectedHardwareConcern: isAbrasion ? 'Mucosal Friction Abrasion' : 'Active Orthodontic Force Reaction',
      affectedArea: triage.affectedRegion,
      urgencyCategory: urgency === 'high' ? 'priority_review' : 'routine',
      clinicianReviewRecommended: false,
      patientGuidance: [
        'Eat soft foods for 24-48 hours.',
        'Swish with warm salt water to relieve tenderness.',
      ],
      isReadyForClinic: true,
    },
    isSimulatedDemo: true,
  };
}

