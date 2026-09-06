/**
 * OrthoBond AI — Verified Orthodontic Clinical Knowledge Base (RAG Corpus)
 * 
 * Authoritative, conservative clinical protocols for orthodontic discomfort,
 * acute hardware triage, patient self-management, and clinical escalation criteria.
 * 
 * Strict Clinical Safety Directives:
 * - Conservative home comfort measures only (relief wax, warm salt water, soft diet).
 * - Strictly prohibit prescribing or recommending specific prescription medications.
 * - Strictly prohibit making definitive diagnostic claims or orthodontic treatment plan alterations.
 * - Strictly prohibit patient cutting or bending of archwires at home with nail clippers or pliers.
 * - Clearly distinguish between benign self-limiting adjustment pressure and emergency trauma.
 */

import { SuspectedIssue, TriageUrgency } from '@/lib/types';

export interface KnowledgeProtocol {
  id: string;
  category: 'acute_hardware' | 'relief_protocols' | 'pain_triage_tiers' | 'emergency_classification';
  title: string;
  suspectedIssue: SuspectedIssue;
  urgency: TriageUrgency;
  keywords: string[];
  clinicalSummary: string;
  conservativeGuidance: string[];
  prohibitedActions: string[];
  whenToEscalate: string[];
}

export const ORTHODONTIC_KNOWLEDGE_BASE: KnowledgeProtocol[] = [
  // 1. POKING ARCHWIRE / EXTENDED DISTAL WIRE
  {
    id: 'kb-poking-wire',
    category: 'acute_hardware',
    title: 'Poking Archwire & Distal Extension Cheek Impingement',
    suspectedIssue: 'poking_wire',
    urgency: 'medium',
    keywords: [
      'wire',
      'poke',
      'poking',
      'pokey',
      'scratch',
      'scratching',
      'cutting',
      'stab',
      'stabbing',
      'sharp',
      'cheek',
      'distal',
      'molar',
      'end',
      'impingement',
      'lip',
    ],
    clinicalSummary:
      'Archwire displacement or distal extension past the terminal buccal tube/molar bracket, causing mechanical mucosal friction, cheek abrasions, or puncture.',
    conservativeGuidance: [
      'Dry the irritating wire end and molar bracket thoroughly with a clean tissue or cotton roll (wax will not stick to wet enamel or metal).',
      'Roll a pea-sized ball of orthodontic relief wax between clean fingers to warm and soften it.',
      'Press the wax firmly over the protruding wire end to form a smooth protective barrier.',
      'If a soft thin ligature wire is pointing outwards, use the clean eraser end of a pencil or a cotton swab to gently tuck the wire flush against the tooth surface.',
      'Rinse with warm salt water (1/2 tsp salt in 8 oz warm water) 3-4 times daily to soothe irritated cheek mucosa.',
    ],
    prohibitedActions: [
      'NEVER attempt to cut orthodontic wires at home with nail clippers, wire cutters, or scissors (severe risk of swallowing/aspirating wire fragments, enamel chipping, or debonding adjacent brackets).',
      'Do not pull or forcefully yank on the archwire.',
    ],
    whenToEscalate: [
      'The wire has pierced through oral tissue and cannot be dislodged with wax.',
      'Wax falls off repeatedly and sharp pain prevents normal chewing or sleeping.',
      'Significant ulceration, bleeding, or signs of localized infection appear.',
    ],
  },

  // 2. DEBONDED / LOOSE ORTHODONTIC BRACKET
  {
    id: 'kb-loose-bracket',
    category: 'acute_hardware',
    title: 'Debonded or Loose Orthodontic Bracket',
    suspectedIssue: 'loose_bracket',
    urgency: 'medium',
    keywords: [
      'bracket',
      'loose',
      'popped',
      'popped off',
      'spinning',
      'sliding',
      'detached',
      'came off',
      'unbonded',
      'broke off',
      'broken bracket',
      'floating',
    ],
    clinicalSummary:
      'Failure of the composite adhesive interface causing a bracket to separate from the enamel surface. The bracket may slide freely along the archwire or flip.',
    conservativeGuidance: [
      'If the loose bracket remains secured to the archwire, slide it gently along the wire into a neutral, comfortable position between teeth.',
      'Dry the bracket and apply a generous ball of orthodontic relief wax over it to anchor it temporarily to adjacent teeth and stop movement.',
      'If the bracket has completely detached from the wire, carefully remove it from the mouth, place it in a clean envelope or plastic bag, and bring it to your next clinical appointment.',
      'Avoid biting into hard, chewy, or crunchy foods on the affected side.',
    ],
    prohibitedActions: [
      'NEVER attempt to re-glue the bracket with superglue, household adhesives, or temporary filling materials (toxic chemicals and enamel damage).',
      'Do not forcefully twist or pry the bracket off the wire if it is attached by an elastomeric ligature.',
    ],
    whenToEscalate: [
      'The loose bracket is lodged painfully into the gum or cheek tissue.',
      'The bracket was accidentally swallowed with symptoms of coughing, choking, or chest pain (requires immediate emergency medical evaluation).',
      'Multiple brackets have debonded simultaneously following biting trauma.',
    ],
  },

  // 3. BROKEN LIGATURE / UNTUCKED WIRE TIE / BROKEN POWER CHAIN
  {
    id: 'kb-broken-ligature',
    category: 'acute_hardware',
    title: 'Displaced Ligature Tie, Untucked Pigtail, or Broken Power Chain',
    suspectedIssue: 'loose_bracket',
    urgency: 'low',
    keywords: [
      'rubber band',
      'elastic',
      'ligature',
      'o-ring',
      'color band',
      'power chain',
      'chain',
      'ring',
      'untucked',
      'tie',
      'pigtail',
    ],
    clinicalSummary:
      'Loss of elastomeric ring or steel tie-wire that secures the archwire into the bracket slot, or breakage of an elastomeric chain used for space closure.',
    conservativeGuidance: [
      'If an elastic ligature falls off and the wire remains inside the bracket slot without discomfort, notify your orthodontist at your next visit or send a message for staff advice.',
      'If a wire pigtail is untucked and scratching, use a clean pencil eraser or cotton swab to gently push the end flush under the archwire.',
      'Apply orthodontic relief wax over the tie-wing if friction occurs.',
    ],
    prohibitedActions: [
      'Do not attempt to re-engage elastics with household tweezers or sharp sewing needles.',
      'Do not stretch random household rubber bands onto dental brackets.',
    ],
    whenToEscalate: [
      'The archwire has completely popped out of the slot and is protruding outward into oral tissue.',
    ],
  },

  // 4. MUCOSAL ABRASION & APHTHOUS IRRITATION
  {
    id: 'kb-mucosal-abrasion',
    category: 'relief_protocols',
    title: 'Mucosal Friction, Lip Ulceration, & Orthodontic Abrasions',
    suspectedIssue: 'abrasion',
    urgency: 'low',
    keywords: [
      'abrasion',
      'ulcer',
      'sore',
      'canker',
      'friction',
      'rubbing',
      'irritation',
      'blister',
      'raw',
      'chafing',
      'lips',
      'mucosa',
      'salt water',
      'wax',
    ],
    clinicalSummary:
      'Mechanical friction from brackets, hooks, or appliance edges against oral mucosa leading to localized hyperkeratosis, erosions, or aphthous ulcerations.',
    conservativeGuidance: [
      'Dry the specific bracket, hook, or attachment causing the friction with a tissue.',
      'Apply a generous layer of orthodontic relief wax over the hardware before speaking or sleeping.',
      'Prepare warm salt water: mix 1/2 teaspoon of table salt into 8 ounces of warm water. Swish gently for 30 seconds and expectorate. Repeat 3 to 4 times daily.',
      'Ensure adequate hydration to maintain saliva flow, which provides natural oral tissue lubrication.',
    ],
    prohibitedActions: [
      'Avoid acidic, spicy, highly salty, or citrus foods/beverages while ulcers are open and healing.',
      'Do not pick, scratch, or aggressively rub ulcerated tissue.',
    ],
    whenToEscalate: [
      'Ulceration does not heal after 10-14 days despite wax usage and soft diet.',
      'Severe pain prevents fluid intake leading to dehydration.',
      'Spreading white patches or signs of oral fungal/bacterial infection.',
    ],
  },

  // 5. GENERAL POST-ADJUSTMENT SORENESS / PDL FORCE TENSION
  {
    id: 'kb-general-soreness',
    category: 'pain_triage_tiers',
    title: 'Expected Post-Adjustment Periodontal Tenderness & Force Tension',
    suspectedIssue: 'general_soreness',
    urgency: 'low',
    keywords: [
      'sore',
      'tender',
      'aching',
      'teeth hurt',
      'pressure',
      'tight',
      'tightness',
      'chewing',
      'eating',
      'adjustment',
      'wire change',
      'new wire',
      'activation',
      'dull ache',
    ],
    clinicalSummary:
      'Physiological inflammatory response within the periodontal ligament (PDL) and alveolar bone remodeling following orthodontic force application. Discomfort typically peaks 24 to 48 hours after adjustment and steadily resolves over 3 to 5 days.',
    conservativeGuidance: [
      'Maintain a soothing, soft diet for 48-72 hours: chilled smoothies, Greek yogurt, blended soups, pureed squash, scrambled eggs, mashed potatoes, and soft pasta.',
      'Drink cold water or gently hold crushed ice in the mouth (do not chew ice), as cool temperatures provide temporary vasoconstrictive relief.',
      'Chew gently on sugar-free chewing gum or an orthodontic silicone bite-wafer for brief periods during the first 24 hours to stimulate PDL circulation and reduce ischemic soreness.',
      'Continue gentle tooth brushing with an extra-soft toothbrush to prevent plaque accumulation around swollen marginal gingiva.',
    ],
    prohibitedActions: [
      'Do not bite directly into whole apples, raw carrots, hard bagels, or tough meats with anterior incisors.',
      'Do not avoid oral hygiene; unbrushed plaque significantly worsens inflammation and soreness.',
    ],
    whenToEscalate: [
      'Intense, throbbing pain that does not improve after 5 days or steadily worsens.',
      'A single tooth is exquisitely sensitive to gentle tapping or cold/hot stimulation (possible pulpal pathology).',
    ],
  },

  // 6. ORTHODONTIC RELIEF WAX APPLICATION PROTOCOL
  {
    id: 'kb-wax-protocol',
    category: 'relief_protocols',
    title: 'Standard Clinical Relief Wax Application Technique',
    suspectedIssue: 'abrasion',
    urgency: 'low',
    keywords: ['wax', 'how to use wax', 'relief wax', 'apply wax', 'wax protocol', 'put wax'],
    clinicalSummary:
      'Step-by-step clinical methodology for using orthodontic grade paraffin/silicone wax to isolate rubbing brackets or archwires from delicate oral soft tissues.',
    conservativeGuidance: [
      'Step 1 (Clean Hands): Wash hands thoroughly with soap and water.',
      'Step 2 (Locate & Dry): Identify the exact bracket or wire edge causing irritation. Dry the area completely using a cotton swab, tissue, or clean cloth. Wax will slide off wet surfaces.',
      'Step 3 (Pinch & Warm): Pinch off a small, pea-sized piece of wax. Roll it between clean fingers for 5-10 seconds until it softens and becomes pliable.',
      'Step 4 (Press & Mold): Press the wax ball directly onto the dry bracket or wire, molding it gently around the tie-wings and edges until it forms a smooth, protective dome.',
      'Step 5 (Maintenance): Remove wax before eating or brushing teeth. Reapply clean, fresh wax afterwards as needed. (Accidental swallowing of orthodontic wax is harmless as it is medical-grade and non-toxic).',
    ],
    prohibitedActions: [
      'Do not reuse dirty wax that fell on the floor or was previously chewed.',
      'Do not apply chewing gum or candle wax as a substitute.',
    ],
    whenToEscalate: [
      'Wax fails to adhere despite thorough drying and hardware continues cutting tissue.',
    ],
  },

  // 7. EMERGENCY VS. NON-EMERGENCY CLINICAL TRIAGE CLASSIFICATION
  {
    id: 'kb-emergency-triage',
    category: 'emergency_classification',
    title: 'Emergency vs. Non-Emergency Orthodontic Triage Matrix',
    suspectedIssue: 'other',
    urgency: 'high',
    keywords: [
      'emergency',
      'urgent',
      'bleeding',
      'bleed',
      'swelling',
      'swollen',
      'fever',
      'trauma',
      'accident',
      'hit',
      'fall',
      'knocked out',
      'avulsed',
      'breathing',
      'swallow',
      'hospital',
      '911',
    ],
    clinicalSummary:
      'Clinical demarcation between routine orthodontic mechanical issues managed at home versus acute maxillofacial emergencies requiring immediate in-person intervention.',
    conservativeGuidance: [
      'NON-EMERGENCY (Manage at home, notify clinic during regular business hours): Dull generalized tooth ache after adjustment, loose bracket anchored on wire, manageable poking wire covered with wax, broken elastic tie, slight speech changes.',
      'URGENT CLINICAL EVALUATION (Contact orthodontic clinic for same-day priority appointment): Wire puncturing deeply into cheek, intense pain not relieved by conservative care, loose band spinning on molar, loose bracket with sharp edges.',
      'TRUE MEDICAL/DENTAL EMERGENCY (Call 911 or visit Emergency Department immediately): Severe or continuous oral bleeding, acute traumatic impact resulting in facial fracture or displaced/knocked-out permanent tooth, rapidly spreading swelling of the face, neck, or submandibular space, or difficulty breathing/swallowing.',
    ],
    prohibitedActions: [
      'Never delay emergency room care for life-threatening airway compromise or uncontrolled hemorrhaging to wait for orthodontic office hours.',
    ],
    whenToEscalate: [
      'Any red flag symptom (fever + swelling, breathing difficulty, severe facial trauma, profuse bleeding).',
    ],
  },
];

/**
 * RAG Matching & Retrieval Engine
 * 
 * Analyzes patient query, reported symptoms, and discomfort level to score
 * and retrieve the most clinically relevant knowledge base protocols.
 */
export function retrieveClinicalProtocols(
  queryText: string,
  symptoms: string[] = [],
  painScore?: number
): {
  matchedProtocols: KnowledgeProtocol[];
  contextMarkdown: string;
  primarySuspectedIssue: SuspectedIssue;
  recommendedUrgency: TriageUrgency;
} {
  const normalizedQuery = (queryText || '').toLowerCase();
  const normalizedSymptoms = symptoms.map((s) => s.toLowerCase());
  const combinedText = `${normalizedQuery} ${normalizedSymptoms.join(' ')}`;

  // Emergency / Red flag fast match
  const isEmergency = /bleed(ing)?|swell(ing)?|trauma|fever|breath(ing)?|chok(ing)?|throat|hospital|knocked out|hit in the mouth/.test(
    combinedText
  );

  // Score each protocol based on keyword frequency and relevance
  const scored = ORTHODONTIC_KNOWLEDGE_BASE.map((protocol) => {
    let score = 0;

    for (const keyword of protocol.keywords) {
      if (combinedText.includes(keyword.toLowerCase())) {
        score += 3;
      }
    }

    // Category weighting
    if (isEmergency && protocol.category === 'emergency_classification') {
      score += 20;
    }

    if (
      (combinedText.includes('poke') || combinedText.includes('wire') || combinedText.includes('cut')) &&
      protocol.suspectedIssue === 'poking_wire'
    ) {
      score += 10;
    }

    if (
      (combinedText.includes('loose') || combinedText.includes('bracket') || combinedText.includes('popped')) &&
      protocol.suspectedIssue === 'loose_bracket'
    ) {
      score += 10;
    }

    if (
      (combinedText.includes('rub') || combinedText.includes('ulcer') || combinedText.includes('sore')) &&
      protocol.suspectedIssue === 'abrasion'
    ) {
      score += 8;
    }

    if (
      (combinedText.includes('tight') || combinedText.includes('chew') || combinedText.includes('sore') || combinedText.includes('ache')) &&
      protocol.suspectedIssue === 'general_soreness'
    ) {
      score += 6;
    }

    // Pain score heuristic weighting
    if (painScore !== undefined) {
      if (painScore >= 8 && (protocol.urgency === 'high' || protocol.category === 'emergency_classification')) {
        score += 8;
      } else if (painScore >= 4 && painScore < 8 && protocol.urgency === 'medium') {
        score += 5;
      } else if (painScore <= 3 && protocol.urgency === 'low') {
        score += 4;
      }
    }

    return { protocol, score };
  });

  // Sort descending by relevance score
  scored.sort((a, b) => b.score - a.score);

  // Take top matching protocols (at least 2, up to 3)
  const topMatches = scored.slice(0, 3).map((item) => item.protocol);

  // Always include wax protocol if wax or friction is mentioned
  if (
    (combinedText.includes('wax') || combinedText.includes('poke') || combinedText.includes('rub') || combinedText.includes('bracket')) &&
    !topMatches.some((p) => p.id === 'kb-wax-protocol')
  ) {
    const waxProto = ORTHODONTIC_KNOWLEDGE_BASE.find((p) => p.id === 'kb-wax-protocol');
    if (waxProto) {
      topMatches.push(waxProto);
    }
  }

  // Derive suspected issue & urgency
  let primarySuspectedIssue: SuspectedIssue = 'general_soreness';
  let recommendedUrgency: TriageUrgency = 'low';

  if (isEmergency || (painScore !== undefined && painScore >= 8)) {
    primarySuspectedIssue = 'other';
    recommendedUrgency = 'high';
  } else if (combinedText.includes('wire') && (combinedText.includes('poke') || combinedText.includes('cut') || combinedText.includes('stab'))) {
    primarySuspectedIssue = 'poking_wire';
    recommendedUrgency = 'medium';
  } else if (combinedText.includes('bracket') || combinedText.includes('loose') || combinedText.includes('popped')) {
    primarySuspectedIssue = 'loose_bracket';
    recommendedUrgency = 'medium';
  } else if (combinedText.includes('ulcer') || combinedText.includes('chaf') || combinedText.includes('rub')) {
    primarySuspectedIssue = 'abrasion';
    recommendedUrgency = 'low';
  } else if (painScore && painScore >= 4) {
    recommendedUrgency = 'medium';
  }

  // Format as structured Markdown for Gemini grounding
  const contextMarkdown = topMatches
    .map(
      (p) => `### Clinical Protocol: ${p.title} (${p.category})
- **Suspected Concern**: ${p.suspectedIssue} | **Urgency Level**: ${p.urgency}
- **Clinical Summary**: ${p.clinicalSummary}
- **Conservative Actions to Recommend**:
${p.conservativeGuidance.map((g) => `  * ${g}`).join('\n')}
- **Strictly Prohibited Patient Actions**:
${p.prohibitedActions.map((a) => `  * ${a}`).join('\n')}
- **Escalation / Clinical Contact Trigger**:
${p.whenToEscalate.map((e) => `  * ${e}`).join('\n')}`
    )
    .join('\n\n');

  return {
    matchedProtocols: topMatches,
    contextMarkdown,
    primarySuspectedIssue,
    recommendedUrgency,
  };
}
