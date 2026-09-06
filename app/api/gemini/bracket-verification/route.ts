import { NextRequest, NextResponse } from 'next/server';
import { validateImageBase64, extractBase64Raw } from '@/lib/sanitizer';
import { analyzeBracketVerification, generateFallbackClinicalVerification } from '@/server/services/geminiService';

export async function POST(req: NextRequest) {
  let fallbackContext: any;
  try {
    const roleHeader = req.headers.get('x-ortho-role');
    if (roleHeader && roleHeader !== 'clinician') {
      return NextResponse.json(
        { error: 'Forbidden: Bracket placement verification is restricted to authorized clinicians.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { referenceImageBase64, actualImageBase64, clinicalContext } = body;
    fallbackContext = clinicalContext;

    if (!referenceImageBase64 || !actualImageBase64) {
      return NextResponse.json(
        { error: 'Both referenceImageBase64 and actualImageBase64 are required.' },
        { status: 400 }
      );
    }

    const refValidation = validateImageBase64(referenceImageBase64);
    if (!refValidation.isValid) {
      return NextResponse.json(
        { error: `Reference image validation failed: ${refValidation.error}` },
        { status: 400 }
      );
    }

    const actualValidation = validateImageBase64(actualImageBase64);
    if (!actualValidation.isValid) {
      return NextResponse.json(
        { error: `Actual clinical image validation failed: ${actualValidation.error}` },
        { status: 400 }
      );
    }

    const refRaw = extractBase64Raw(referenceImageBase64);
    const actualRaw = extractBase64Raw(actualImageBase64);

    const analysis = await analyzeBracketVerification({
      referenceBase64: refRaw.base64,
      referenceMimeType: refRaw.mimeType,
      actualBase64: actualRaw.base64,
      actualMimeType: actualRaw.mimeType,
      clinicalContext,
    });

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.warn('API bracket verification graceful fallback activation:', error?.message || error);
    const fallback = generateFallbackClinicalVerification(fallbackContext);
    fallback.isSimulatedDemo = true;
    return NextResponse.json(fallback);
  }
}
