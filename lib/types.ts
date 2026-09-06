export type UserRole = 'clinician' | 'patient';
export type AuthState = 'unauthenticated' | 'authenticating' | 'authenticated' | 'onboarding';
export type AppView = 'landing' | 'login' | 'dashboard';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clinicId?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicianProfile {
  id: string;
  userId: string;
  name?: string;
  clinicName: string;
  clinicId?: string;
  licenseNumber: string;
  specialty: string;
  phone?: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  primaryClinicianId: string;
  clinicId?: string;
  name: string;
  dob: string;
  archType: 'maxillary' | 'mandibular' | 'both';
  currentStage: string;
  startDate: string;
  targetCompletion: string;
  treatmentId: string;
  avatarUrl?: string;
}

export interface Treatment {
  id: string;
  patientId: string;
  clinicianId: string;
  diagnosis: string;
  applianceType: string;
  prescription: string;
  wireSequence: string;
  status: 'planned' | 'active' | 'completed';
  createdAt: string;
}

export interface TreatmentMilestone {
  id: string;
  treatmentId: string;
  patientId: string;
  title: string;
  stageNumber: number;
  scheduledDate: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  notes?: string;
  completedDate?: string;
  associatedReviewId?: string;
}

export interface PainCheckIn {
  id: string;
  patientId: string;
  painScore: number; // 0 to 10
  discomfortLocation: string;
  symptoms: string[];
  notes?: string;
  photoUrl?: string;
  aiSummary?: string;
  timestamp: string;
}

export interface BoundingBox {
  ymin: number; // 0 to 1000 normalized
  xmin: number; // 0 to 1000 normalized
  ymax: number; // 0 to 1000 normalized
  xmax: number; // 0 to 1000 normalized
}

export type FindingVerificationStatus = 'verified' | 'rejected' | 'needs_review';

export interface VisualFinding {
  finding_id: string;
  tooth_reference: string; // e.g. "FDI 12 (Upper Right Lateral Incisor)" or "Tooth reference uncertain"
  hardware: string; // e.g. "Bracket", "Archwire", "Adhesive flash", "Ligature"
  visual_observation: string;
  apparent_difference: string; // e.g. "Apparent slightly gingival position compared to virtual setup"
  confidence: 'high' | 'moderate' | 'low';
  bounding_box?: BoundingBox;
  verification_status: FindingVerificationStatus;
  clinician_comment?: string;
}

export interface ImageQualityAssessment {
  status: 'optimal' | 'adequate' | 'suboptimal' | 'unusable';
  overall_reviewable: boolean;
  blur_detected: boolean;
  lighting_adequate: boolean;
  glare_obstruction: boolean;
  hardware_visible: boolean;
  issues: string[];
  recommendations: string[];
}

export interface VisualReview {
  id: string;
  patientId: string;
  clinicianId: string;
  treatmentId: string;
  referenceImageUrl: string;
  actualImageUrl: string;
  overall_reviewable: boolean;
  image_quality: ImageQualityAssessment;
  summary: string;
  findings: VisualFinding[];
  limitations: string[];
  clinicianNotes: string;
  status: 'draft' | 'verified' | 'rejected' | 'needs_followup';
  createdAt: string;
  verifiedAt?: string;
  isSimulatedDemo?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  patientId: string;
  content: string;
  priority: 'normal' | 'urgent';
  timestamp: string;
  read?: boolean;
}

export interface VerificationRequestPayload {
  patientId: string;
  referenceImageBase64: string; // data URI or raw base64
  actualImageBase64: string;
  archType?: 'maxillary' | 'mandibular' | 'both';
  toothRegion?: string;
  applianceType?: string;
}

export interface PatientGuidanceRequestPayload {
  painScore: number;
  symptoms: string[];
  discomfortLocation: string;
  notes?: string;
  currentMilestone?: string;
  daysSinceAdjustment?: number;
}

export interface PatientGuidanceResponse {
  assessmentCategory: 'expected_post_adjustment' | 'mild_friction' | 'hardware_discomfort' | 'urgent_clinical_attention';
  headline: string;
  guidanceText: string;
  comfortActions: string[];
  whenToCallClinician: string[];
  isConservativeSafe: boolean;
}

export type IncidentUrgency = 'routine' | 'contact_clinic' | 'priority_review' | 'urgent_emergency';
export type IncidentStatus = 'new' | 'reviewed' | 'resolved';

export type TriageUrgency = 'low' | 'medium' | 'high';
export type SuspectedIssue = 'loose_bracket' | 'poking_wire' | 'abrasion' | 'general_soreness' | 'other';

export interface StructuredTriageMetadata {
  urgency: TriageUrgency;
  affectedRegion: string;
  suspectedIssue: SuspectedIssue;
  recommendedAction: string;
}

export interface UserCheckinRecord {
  id: string;
  userId: string;
  userPrompt: string;
  conversationalReply: string;
  triageMetadata: StructuredTriageMetadata;
  timestamp: string;
  verifiedInFirestore?: boolean;
}

export interface ClinicalIncident {
  id: string;
  patientId: string;
  patientName: string;
  patientReport: string;
  painScore: number; // 0 to 10
  reportedSymptoms: string[];
  suspectedHardwareConcern: string; // e.g. "Loose Canine Bracket & Archwire Impingement"
  affectedArea: string; // e.g. "Upper Right Quadrant"
  photoUrl?: string;
  urgencyCategory: IncidentUrgency;
  clinicianReviewRecommended: boolean;
  patientGuidance: string[];
  uncertainty?: string;
  status: IncidentStatus;
  timestamp: string;
  clinicianActionTaken?: string;
  isSimulatedDemo?: boolean;
}

export interface CompanionMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  quickReplies?: string[];
  isEmergencyAlert?: boolean;
  triageMetadata?: StructuredTriageMetadata;
}

export interface CareCompanionRequestPayload {
  patientId: string;
  userId?: string;
  patientName: string;
  currentMessage: string;
  chatHistory: { role: 'user' | 'assistant'; content: string }[];
  context?: {
    currentStage?: string;
    applianceType?: string;
    painScore?: number;
    affectedArea?: string;
    photoAttached?: boolean;
    symptoms?: string[];
  };
}

export interface CareCompanionResponse {
  reply: string;
  suggestedQuickReplies: string[];
  isEmergencyAlert: boolean;
  triageMetadata?: StructuredTriageMetadata;
  structuredIncident?: {
    patientReport: string;
    painScore: number;
    reportedSymptoms: string[];
    suspectedHardwareConcern: string;
    affectedArea: string;
    urgencyCategory: IncidentUrgency;
    clinicianReviewRecommended: boolean;
    patientGuidance: string[];
    isReadyForClinic: boolean;
  };
  checkinDocId?: string;
  persistedToFirestore?: boolean;
  longitudinalContextCount?: number;
  matchedProtocolsCount?: number;
  isSimulatedDemo?: boolean;
}

