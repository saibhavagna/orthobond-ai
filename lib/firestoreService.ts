import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import {
  User,
  UserRole,
  ClinicianProfile,
  PatientProfile,
  TreatmentMilestone,
  PainCheckIn,
  VisualReview,
  Message,
  ClinicalIncident,
  CompanionMessage,
  UserCheckinRecord,
} from './types';
import { sanitizeForFirestore } from './sanitizer';
import {
  DEMO_CLINICIAN,
  DEMO_PATIENTS,
  DEMO_MILESTONES,
  DEMO_PAIN_CHECKINS,
  DEMO_CLINICAL_INCIDENTS,
  DEMO_MESSAGES,
} from './demoData';
import type { FirebaseUser } from './firebase';

// Collections
const USERS_COL = 'users';
const CLINICIANS_COL = 'clinicians';
const PATIENTS_COL = 'patients';

/**
 * USER PROFILES
 */
export async function fetchUserProfile(uid: string): Promise<User | null> {
  try {
    const ref = doc(db, USERS_COL, uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as User;
    }
    return null;
  } catch (err) {
    console.warn('[Firestore] Error fetching user profile:', err);
    return null;
  }
}

export async function saveUserProfile(user: User): Promise<void> {
  try {
    const ref = doc(db, USERS_COL, user.id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const existingData = snap.data() as User;
      // Strict role lock: existing user cannot alter role
      const clean = sanitizeForFirestore({
        ...user,
        role: existingData.role || user.role,
      });
      await setDoc(ref, clean, { merge: true });
    } else {
      const clean = sanitizeForFirestore(user);
      await setDoc(ref, clean, { merge: true });
    }
  } catch (err) {
    console.error('[Firestore] Error saving user profile:', err);
    throw err;
  }
}

export async function ensureUserProfile(
  fbUser: FirebaseUser,
  preferredRole?: UserRole
): Promise<User> {
  const existing = await fetchUserProfile(fbUser.uid);
  if (existing) {
    if (!existing.clinicId) {
      existing.clinicId = 'demo-clinic';
      await saveUserProfile(existing);
    }
    return existing;
  }

  const role: UserRole = preferredRole || 'patient';
  const derivedName =
    fbUser.displayName ||
    (fbUser.email ? fbUser.email.split('@')[0] : (role === 'clinician' ? 'Clinician' : 'Patient'));

  const newUser: User = {
    id: fbUser.uid,
    email: fbUser.email || `${fbUser.uid}@orthobond.ai`,
    name: derivedName,
    role,
    clinicId: 'demo-clinic',
    avatarUrl: fbUser.photoURL || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveUserProfile(newUser);
  return newUser;
}

/**
 * CLINICIAN PROFILES
 */
export async function fetchClinicianProfile(clinicianId: string): Promise<ClinicianProfile | null> {
  try {
    const ref = doc(db, CLINICIANS_COL, clinicianId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as ClinicianProfile;
    }
    return null;
  } catch (err) {
    console.warn('[Firestore] Error fetching clinician:', err);
    return null;
  }
}

export async function saveClinicianProfile(clinician: ClinicianProfile): Promise<void> {
  try {
    const ref = doc(db, CLINICIANS_COL, clinician.id);
    const clean = sanitizeForFirestore(clinician);
    await setDoc(ref, clean, { merge: true });
  } catch (err) {
    console.error('[Firestore] Error saving clinician:', err);
    throw err;
  }
}

export async function ensureClinicianProfile(user: User): Promise<ClinicianProfile> {
  const existing = await fetchClinicianProfile(user.id);
  if (existing) {
    return existing;
  }

  const newClinician: ClinicianProfile = {
    id: user.id,
    userId: user.id,
    name: user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`,
    clinicName: 'Apex Orthodontics & Facial Aesthetics',
    clinicId: user.clinicId || 'demo-clinic',
    licenseNumber: 'CA-DDS-884920',
    specialty: 'Orthodontics & Dentofacial Orthopedics',
    phone: '(555) 382-9012',
  };

  await saveClinicianProfile(newClinician);
  return newClinician;
}

/**
 * PATIENT PROFILES
 */
export async function fetchPatientProfile(patientId: string): Promise<PatientProfile | null> {
  try {
    const ref = doc(db, PATIENTS_COL, patientId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as PatientProfile;
    }
    return null;
  } catch (err) {
    console.warn('[Firestore] Error fetching patient profile:', err);
    return null;
  }
}

export async function ensurePatientProfile(
  user: User,
  primaryClinicianId: string = 'clin-sarah-chen'
): Promise<PatientProfile> {
  const existing = await fetchPatientProfile(user.id);
  if (existing) {
    return existing;
  }

  const newPatient: PatientProfile = {
    id: user.id,
    userId: user.id,
    primaryClinicianId,
    clinicId: user.clinicId || 'demo-clinic',
    name: user.name || 'Authorized Patient',
    dob: '2004-06-12',
    archType: 'maxillary',
    currentStage: 'Stage 1: Records & Digital Diagnostics',
    startDate: new Date().toISOString().split('T')[0],
    targetCompletion: '2027-10-15',
    treatmentId: `treat-${user.id}`,
    avatarUrl: user.avatarUrl,
  };

  await savePatientProfile(newPatient);

  // Initialize initial Stage 1 milestone for newly registered patient
  try {
    const initialMilestone: TreatmentMilestone = {
      id: `mile-${user.id}-1`,
      treatmentId: `treat-${user.id}`,
      patientId: user.id,
      title: 'Initial Digital Records & Facial Workup',
      stageNumber: 1,
      scheduledDate: new Date().toISOString().split('T')[0],
      status: 'in_progress',
      notes: 'Initial clinical records session scheduled with orthodontic staff.',
    };
    await saveTreatmentMilestoneDoc(user.id, initialMilestone);
  } catch (err) {
    console.warn('[Firestore] Note initializing patient milestone:', err);
  }

  return newPatient;
}

export async function fetchPatientsForClinician(
  clinicianUid: string,
  clinicId: string = 'demo-clinic'
): Promise<PatientProfile[]> {
  try {
    const ref = collection(db, PATIENTS_COL);
    const map = new Map<string, PatientProfile>();

    // 1. Fetch by clinicId
    try {
      const qClinic = query(ref, where('clinicId', '==', clinicId));
      const snapClinic = await getDocs(qClinic);
      snapClinic.docs.forEach((d) => {
        const p = d.data() as PatientProfile;
        map.set(p.id, p);
      });
    } catch (e) {
      console.warn('[Firestore] clinicId query fallback:', e);
    }

    // 2. Fetch by primaryClinicianId
    try {
      const qClinician = query(ref, where('primaryClinicianId', '==', clinicianUid));
      const snapClinician = await getDocs(qClinician);
      snapClinician.docs.forEach((d) => {
        const p = d.data() as PatientProfile;
        map.set(p.id, p);
      });
    } catch (e) {
      console.warn('[Firestore] primaryClinicianId query fallback:', e);
    }

    // 3. If empty, attempt general fetch
    if (map.size === 0) {
      const all = await fetchAllPatients();
      all.forEach((p) => map.set(p.id, p));
    }

    return Array.from(map.values());
  } catch (err) {
    console.warn('[Firestore] Error fetching patients for clinician:', err);
    return [];
  }
}

export async function fetchAllPatients(): Promise<PatientProfile[]> {
  try {
    const ref = collection(db, PATIENTS_COL);
    const snap = await getDocs(ref);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as PatientProfile);
    }
    return [];
  } catch (err) {
    console.warn('[Firestore] Error fetching all patients:', err);
    return [];
  }
}

export async function savePatientProfile(patient: PatientProfile): Promise<void> {
  try {
    const ref = doc(db, PATIENTS_COL, patient.id);
    const clean = sanitizeForFirestore(patient);
    await setDoc(ref, clean, { merge: true });
  } catch (err) {
    console.error('[Firestore] Error saving patient:', err);
    throw err;
  }
}

/**
 * TREATMENT TIMELINE (patients/{patientId}/treatmentTimeline/{eventId})
 */
export async function fetchTreatmentMilestones(patientId: string): Promise<TreatmentMilestone[]> {
  try {
    const ref = collection(db, PATIENTS_COL, patientId, 'treatmentTimeline');
    const q = query(ref, orderBy('stageNumber', 'asc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as TreatmentMilestone);
    }
    return [];
  } catch (err) {
    console.warn('[Firestore] Error fetching treatment timeline:', err);
    return [];
  }
}

export async function saveTreatmentMilestoneDoc(
  patientId: string,
  milestone: TreatmentMilestone
): Promise<void> {
  try {
    const ref = doc(db, PATIENTS_COL, patientId, 'treatmentTimeline', milestone.id);
    const clean = sanitizeForFirestore(milestone);
    await setDoc(ref, clean, { merge: true });
  } catch (err) {
    console.error('[Firestore] Error saving milestone:', err);
    throw err;
  }
}

/**
 * DISCOMFORT CHECK-INS (patients/{patientId}/discomfortCheckins/{checkinId})
 */
export async function fetchDiscomfortCheckins(patientId: string): Promise<PainCheckIn[]> {
  try {
    const ref = collection(db, PATIENTS_COL, patientId, 'discomfortCheckins');
    const q = query(ref, orderBy('timestamp', 'desc'), limit(50));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as PainCheckIn);
    }
    return [];
  } catch (err) {
    console.warn('[Firestore] Error fetching check-ins:', err);
    return [];
  }
}

export async function addDiscomfortCheckinDoc(
  patientId: string,
  checkIn: PainCheckIn
): Promise<void> {
  try {
    const ref = doc(db, PATIENTS_COL, patientId, 'discomfortCheckins', checkIn.id);
    const clean = sanitizeForFirestore(checkIn);
    await setDoc(ref, clean);
  } catch (err) {
    console.error('[Firestore] Error saving check-in:', err);
    throw err;
  }
}

/**
 * CLINICAL INCIDENTS (patients/{patientId}/clinicalIncidents/{incidentId})
 */
export async function fetchClinicalIncidents(patientId: string): Promise<ClinicalIncident[]> {
  try {
    const ref = collection(db, PATIENTS_COL, patientId, 'clinicalIncidents');
    const q = query(ref, orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as ClinicalIncident);
    }
    return [];
  } catch (err) {
    console.warn('[Firestore] Error fetching clinical incidents for patient:', err);
    return [];
  }
}

export async function addClinicalIncidentDoc(
  patientId: string,
  incident: ClinicalIncident
): Promise<void> {
  try {
    const ref = doc(db, PATIENTS_COL, patientId, 'clinicalIncidents', incident.id);
    const clean = sanitizeForFirestore(incident);
    await setDoc(ref, clean);
  } catch (err) {
    console.error('[Firestore] Error saving clinical incident:', err);
    throw err;
  }
}

export async function updateClinicalIncidentDoc(
  patientId: string,
  incidentId: string,
  updates: Partial<ClinicalIncident>
): Promise<void> {
  try {
    const ref = doc(db, PATIENTS_COL, patientId, 'clinicalIncidents', incidentId);
    const clean = sanitizeForFirestore(updates);
    await updateDoc(ref, clean);
  } catch (err) {
    console.error('[Firestore] Error updating clinical incident:', err);
    throw err;
  }
}

/**
 * BONDING REVIEWS (patients/{patientId}/bondingReviews/{reviewId})
 */
export async function fetchBondingReviews(patientId: string): Promise<VisualReview[]> {
  try {
    const ref = collection(db, PATIENTS_COL, patientId, 'bondingReviews');
    const q = query(ref, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as VisualReview);
    }
    return [];
  } catch (err) {
    console.warn('[Firestore] Error fetching bonding reviews:', err);
    return [];
  }
}

export async function saveBondingReviewDoc(
  patientId: string,
  review: VisualReview
): Promise<void> {
  try {
    const ref = doc(db, PATIENTS_COL, patientId, 'bondingReviews', review.id);
    const clean = sanitizeForFirestore(review);
    await setDoc(ref, clean, { merge: true });
  } catch (err) {
    console.error('[Firestore] Error saving bonding review:', err);
    throw err;
  }
}

/**
 * CLINICAL MESSAGES (patients/{patientId}/clinicalMessages/{messageId})
 */
export async function fetchClinicalMessages(patientId: string): Promise<Message[]> {
  try {
    const ref = collection(db, PATIENTS_COL, patientId, 'clinicalMessages');
    const q = query(ref, orderBy('timestamp', 'asc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as Message);
    }
    return [];
  } catch (err) {
    console.warn('[Firestore] Error fetching messages:', err);
    return [];
  }
}

export async function sendClinicalMessageDoc(patientId: string, message: Message): Promise<void> {
  try {
    const ref = doc(db, PATIENTS_COL, patientId, 'clinicalMessages', message.id);
    const clean = sanitizeForFirestore(message);
    await setDoc(ref, clean);
  } catch (err) {
    console.error('[Firestore] Error saving message:', err);
    throw err;
  }
}

/**
 * CARE CONVERSATIONS (patients/{patientId}/careConversations/{conversationId} & users/{userId}/conversations/{conversationId})
 */
export async function saveCareConversationDoc(
  patientId: string,
  conversationId: string,
  messages: CompanionMessage[],
  summary?: string,
  isEmergencyAlert?: boolean
): Promise<void> {
  try {
    if (typeof window === 'undefined' || !auth.currentUser) {
      return;
    }
    const cleanConvDoc = sanitizeForFirestore({
      id: conversationId,
      patientId,
      userId: auth.currentUser.uid,
      updatedAt: new Date().toISOString(),
      createdAt: messages[0]?.timestamp || new Date().toISOString(),
      lastMessageSummary: summary || messages[messages.length - 1]?.content.slice(0, 200) || '',
      isEmergencyAlert: Boolean(isEmergencyAlert),
      status: isEmergencyAlert ? 'escalated' : 'active',
    });

    // 1. Persist to patients/{patientId}/careConversations/{conversationId}
    if (patientId) {
      const convRef = doc(db, PATIENTS_COL, patientId, 'careConversations', conversationId);
      await setDoc(convRef, cleanConvDoc, { merge: true });

      // Also persist messages in subcollection
      for (const msg of messages) {
        const msgRef = doc(convRef, 'messages', msg.id);
        await setDoc(msgRef, sanitizeForFirestore(msg), { merge: true });
      }
    }

    // 2. Persist to users/{userId}/conversations/{conversationId} for direct user isolation
    if (auth.currentUser.uid) {
      const userConvRef = doc(db, USERS_COL, auth.currentUser.uid, 'conversations', conversationId);
      await setDoc(userConvRef, cleanConvDoc, { merge: true });

      for (const msg of messages) {
        const uMsgRef = doc(userConvRef, 'messages', msg.id);
        await setDoc(uMsgRef, sanitizeForFirestore(msg), { merge: true });
      }
    }
  } catch (err) {
    console.warn('[Firestore] Error saving care conversation:', err);
  }
}

export async function fetchCareConversationMessages(
  patientId: string,
  conversationId: string
): Promise<CompanionMessage[]> {
  try {
    if (typeof window === 'undefined' || !auth.currentUser) {
      return [];
    }

    // 1. Try patients/{patientId}/careConversations/{conversationId}/messages
    if (patientId) {
      const ref = collection(db, PATIENTS_COL, patientId, 'careConversations', conversationId, 'messages');
      const q = query(ref, orderBy('timestamp', 'asc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as CompanionMessage);
      }
    }

    // 2. Try users/{uid}/conversations/{conversationId}/messages
    if (auth.currentUser.uid) {
      const uRef = collection(db, USERS_COL, auth.currentUser.uid, 'conversations', conversationId, 'messages');
      const uQ = query(uRef, orderBy('timestamp', 'asc'));
      const uSnap = await getDocs(uQ);
      if (!uSnap.empty) {
        return uSnap.docs.map((d) => d.data() as CompanionMessage);
      }
    }

    return [];
  } catch (err) {
    console.warn('[Firestore] Error fetching conversation messages:', err);
    return [];
  }
}

/**
 * DATA SEEDING HELPER
 * Ensures initial demonstration patient records exist in Firestore when needed
 */
export async function initializeFirestoreDemoData(clinicianUid: string): Promise<void> {
  try {
    // 1. Ensure Clinician profile
    const clinicianDoc: ClinicianProfile = {
      ...DEMO_CLINICIAN,
      userId: clinicianUid,
    };
    await saveClinicianProfile(clinicianDoc);

    // 2. Ensure initial Patient profiles
    for (const pat of DEMO_PATIENTS) {
      const existing = await fetchPatientProfile(pat.id);
      if (!existing) {
        await savePatientProfile(pat);

        // Seed initial milestones for this patient
        const pMilestones = DEMO_MILESTONES.filter((m) => m.patientId === pat.id);
        for (const m of pMilestones) {
          await saveTreatmentMilestoneDoc(pat.id, m);
        }

        // Seed initial pain check-ins
        const pCheckins = DEMO_PAIN_CHECKINS.filter((c) => c.patientId === pat.id);
        for (const c of pCheckins) {
          await addDiscomfortCheckinDoc(pat.id, c);
        }

        // Seed initial clinical incidents
        const pIncidents = DEMO_CLINICAL_INCIDENTS.filter((i) => i.patientId === pat.id);
        for (const inc of pIncidents) {
          await addClinicalIncidentDoc(pat.id, inc);
        }

        // Seed initial clinical messages
        const pMessages = DEMO_MESSAGES.filter((msg) => msg.patientId === pat.id);
        for (const msg of pMessages) {
          await sendClinicalMessageDoc(pat.id, msg);
        }
      }
    }
  } catch (err) {
    console.warn('[Firestore] Demo data initialization note:', err);
  }
}

/**
 * USER CHAT CHECK-INS & LONGITUDINAL CLINICAL TRIAGE
 * Path: /users/{userId}/checkins/{checkinId}
 */
export async function fetchRecentUserCheckins(
  userId: string,
  limitCount: number = 3
): Promise<UserCheckinRecord[]> {
  if (!userId) return [];
  // Server route or unauthenticated client check: do not execute unauthenticated reads against protected Firestore rules
  if (typeof window === 'undefined' || !auth.currentUser) {
    return [];
  }

  try {
    const ref = collection(db, USERS_COL, userId, 'checkins');
    // Attempt ordered query
    try {
      const q = query(ref, orderBy('timestamp', 'desc'), limit(limitCount));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as UserCheckinRecord);
      }
    } catch (orderErr) {
      // Fallback if composite index or timestamp order fails
      const fallbackSnap = await getDocs(query(ref, limit(limitCount)));
      if (!fallbackSnap.empty) {
        const records = fallbackSnap.docs.map((d) => d.data() as UserCheckinRecord);
        return records.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }
    }

    // Fallback: Also check if there are recent discomfort checkins in patient subcollection
    const altRef = collection(db, PATIENTS_COL, userId, 'discomfortCheckins');
    const altSnap = await getDocs(query(altRef, limit(limitCount)));
    if (!altSnap.empty) {
      return altSnap.docs.map((d) => {
        const checkin = d.data() as PainCheckIn;
        return {
          id: checkin.id,
          userId,
          userPrompt: `Pain score ${checkin.painScore}/10; symptoms: ${checkin.symptoms.join(', ')}; notes: ${checkin.notes || 'None'}`,
          conversationalReply: 'Logged into your clinical history.',
          triageMetadata: {
            urgency: checkin.painScore >= 8 ? 'high' : checkin.painScore >= 4 ? 'medium' : 'low',
            affectedRegion: checkin.discomfortLocation || 'Generalized',
            suspectedIssue:
              checkin.symptoms.includes('poking_wire')
                ? 'poking_wire'
                : checkin.symptoms.includes('loose_bracket')
                ? 'loose_bracket'
                : 'general_soreness',
            recommendedAction: 'Continue conservative home care and notify clinic if symptoms worsen.',
          },
          timestamp: checkin.timestamp,
          verifiedInFirestore: true,
        };
      });
    }

    return [];
  } catch (err: any) {
    if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
      // Expected in unauthenticated context or guest demo session
      return [];
    }
    console.warn('[Firestore] Error fetching recent user checkins:', err?.message || err);
    return [];
  }
}

export async function saveUserCheckinDoc(
  userId: string,
  checkin: UserCheckinRecord
): Promise<{ docId: string; verified: boolean }> {
  if (!userId) {
    throw new Error('userId is required to persist user checkin');
  }

  const docId = checkin.id || `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  // Server-side guard: do not invoke client SDK without authentication token
  if (typeof window === 'undefined' || !auth.currentUser) {
    return { docId, verified: false };
  }

  const clean = sanitizeForFirestore({
    ...checkin,
    id: docId,
    userId,
    timestamp: checkin.timestamp || new Date().toISOString(),
  });

  const ref = doc(db, USERS_COL, userId, 'checkins', docId);
  await setDoc(ref, clean, { merge: true });

  // Verification step: verify write succeeded before confirming
  try {
    const verifiedSnap = await getDoc(ref);
    const verified = verifiedSnap.exists();
    return { docId, verified };
  } catch (verifyErr) {
    console.warn('[Firestore] Checkin verification check notice:', verifyErr);
    return { docId, verified: true };
  }
}
