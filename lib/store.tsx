'use client';

import React, { createContext, useContext, useState, useEffect, useSyncExternalStore } from 'react';
import {
  UserRole,
  AuthState,
  AppView,
  User,
  ClinicianProfile,
  PatientProfile,
  Treatment,
  TreatmentMilestone,
  PainCheckIn,
  VisualReview,
  Message,
  ClinicalIncident,
  CompanionMessage,
} from './types';
import {
  DEMO_CLINICIAN,
  DEMO_PATIENTS,
  DEMO_TREATMENTS,
  DEMO_MILESTONES,
  DEMO_PAIN_CHECKINS,
  DEMO_MESSAGES,
  DEMO_CLINICAL_INCIDENTS,
  DEMO_VISUAL_REVIEWS,
} from './demoData';
import { sanitizeForFirestore } from './sanitizer';
import {
  auth,
  loginWithGooglePopup,
  logoutFirebaseAuth,
  onAuthStateChanged,
  FirebaseUser,
} from './firebase';
import {
  fetchUserProfile,
  saveUserProfile,
  fetchClinicianProfile,
  fetchPatientProfile,
  fetchAllPatients,
  fetchTreatmentMilestones,
  saveTreatmentMilestoneDoc,
  fetchDiscomfortCheckins,
  addDiscomfortCheckinDoc,
  fetchClinicalIncidents,
  addClinicalIncidentDoc,
  updateClinicalIncidentDoc,
  fetchBondingReviews,
  saveBondingReviewDoc,
  fetchClinicalMessages,
  sendClinicalMessageDoc,
  saveCareConversationDoc,
  initializeFirestoreDemoData,
  ensurePatientProfile,
  ensureClinicianProfile,
  fetchPatientsForClinician,
  savePatientProfile,
} from './firestoreService';

interface OrthoStoreContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  authStatus: AuthState;
  currentUser: User | null;
  appView: AppView;
  setAppView: (view: AppView) => void;
  loginError: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithDemo: (persona: 'clinician' | 'patient') => void;
  logout: () => void;
  completeOnboarding: (selectedRole: UserRole) => Promise<void>;
  isDemoMode: boolean;
  isFirestoreSyncing: boolean;
  clinician: ClinicianProfile;
  patients: PatientProfile[];
  selectedPatient: PatientProfile;
  setSelectedPatientId: (id: string) => void;
  activeTreatment: Treatment | null;
  milestones: TreatmentMilestone[];
  painCheckIns: PainCheckIn[];
  visualReviews: VisualReview[];
  messages: Message[];
  clinicalIncidents: ClinicalIncident[];
  allClinicalIncidents: ClinicalIncident[];
  saveVisualReview: (review: VisualReview) => Promise<void>;
  addPainCheckIn: (checkIn: Omit<PainCheckIn, 'id' | 'timestamp'>) => PainCheckIn;
  addClinicalIncident: (incident: Omit<ClinicalIncident, 'id' | 'timestamp' | 'status'>) => ClinicalIncident;
  updateClinicalIncident: (id: string, updates: Partial<ClinicalIncident>) => Promise<void>;
  sendMessage: (content: string, priority?: 'normal' | 'urgent') => Message;
  persistCareConversation: (conversationId: string, messages: CompanionMessage[], summary?: string, isEmergencyAlert?: boolean) => Promise<void>;
  importDemoPatientsForClinician?: () => Promise<void>;
  resetToDemo: () => void;
  isHydrated: boolean;
  activeClinicianView: 'dashboard' | 'concerns' | 'bonding' | 'timeline' | 'messages';
  setActiveClinicianView: (view: 'dashboard' | 'concerns' | 'bonding' | 'timeline' | 'messages') => void;
  activePatientTab: 'home' | 'companion' | 'checkin' | 'treatment' | 'messages';
  setActivePatientTab: (tab: 'home' | 'companion' | 'checkin' | 'treatment' | 'messages') => void;
}

const OrthoStoreContext = createContext<OrthoStoreContextType | null>(null);

const STORAGE_KEYS = {
  ROLE: 'orthobond_role',
  AUTH_STATUS: 'orthobond_auth_status',
  AUTH_USER: 'orthobond_auth_user',
  SELECTED_PATIENT_ID: 'orthobond_selected_patient',
  IS_DEMO: 'orthobond_is_demo_mode',
};

const emptySubscribe = () => () => {};

export function OrthoStoreProvider({ children }: { children: React.ReactNode }) {
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [role, setRoleState] = useState<UserRole>('clinician');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthState>('unauthenticated');
  const [appView, setAppViewState] = useState<AppView>('landing');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isFirestoreSyncing, setIsFirestoreSyncing] = useState<boolean>(false);

  // Clinical domain state
  const [clinician, setClinician] = useState<ClinicianProfile>(DEMO_CLINICIAN);
  const [patients, setPatients] = useState<PatientProfile[]>(DEMO_PATIENTS);
  const [selectedPatientId, setSelectedPatientIdState] = useState<string>(DEMO_PATIENTS[0].id);
  const [milestones, setMilestones] = useState<TreatmentMilestone[]>(DEMO_MILESTONES);
  const [painCheckIns, setPainCheckIns] = useState<PainCheckIn[]>(DEMO_PAIN_CHECKINS);
  const [visualReviews, setVisualReviews] = useState<VisualReview[]>(DEMO_VISUAL_REVIEWS);
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [clinicalIncidents, setClinicalIncidents] = useState<ClinicalIncident[]>(DEMO_CLINICAL_INCIDENTS);

  // Navigation tab states
  const [activeClinicianView, setActiveClinicianViewState] = useState<'dashboard' | 'concerns' | 'bonding' | 'timeline' | 'messages'>('dashboard');
  const [activePatientTab, setActivePatientTab] = useState<'home' | 'companion' | 'checkin' | 'treatment' | 'messages'>('home');

  const setActiveClinicianView = (view: 'dashboard' | 'concerns' | 'bonding' | 'timeline' | 'messages') => {
    const effectiveRole = currentUser?.role || role;
    if (!isDemoMode && effectiveRole !== 'clinician') {
      console.warn('[OrthoBond Security] Unauthorized navigation attempt by patient to clinician view rejected:', view);
      return;
    }
    setActiveClinicianViewState(view);
  };

  // Load Firestore data for the selected patient
  const loadFirestoreDataForPatient = async (patientId: string) => {
    if (!patientId || patientId === 'none') {
      setMilestones([]);
      setPainCheckIns([]);
      setClinicalIncidents([]);
      setVisualReviews([]);
      setMessages([]);
      return;
    }
    try {
      await Promise.resolve();
      setIsFirestoreSyncing(true);
      const [fMilestones, fCheckins, fIncidents, fReviews, fMessages] = await Promise.all([
        fetchTreatmentMilestones(patientId),
        fetchDiscomfortCheckins(patientId),
        fetchClinicalIncidents(patientId),
        fetchBondingReviews(patientId),
        fetchClinicalMessages(patientId),
      ]);

      // Set records specifically for this patient, without mixing in other patients' records
      setMilestones((prev) => [
        ...(fMilestones || []),
        ...prev.filter((p) => p.patientId !== patientId),
      ]);
      setPainCheckIns((prev) => [
        ...(fCheckins || []),
        ...prev.filter((p) => p.patientId !== patientId),
      ]);
      setClinicalIncidents((prev) => [
        ...(fIncidents || []),
        ...prev.filter((p) => p.patientId !== patientId),
      ]);
      setVisualReviews((prev) => [
        ...(fReviews || []),
        ...prev.filter((p) => p.patientId !== patientId),
      ]);
      setMessages((prev) => [
        ...(fMessages || []),
        ...prev.filter((p) => p.patientId !== patientId),
      ]);
    } catch (err) {
      console.warn('[OrthoStore] Patient data synchronization notice:', err);
    } finally {
      setIsFirestoreSyncing(false);
    }
  };

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        setIsDemoMode(false);
        // Wipe any demo memory state so authenticated sessions are clean
        setMilestones([]);
        setPainCheckIns([]);
        setClinicalIncidents([]);
        setVisualReviews([]);
        setMessages([]);

        try {
          // Check for existing user profile in Firestore
          const profile = await fetchUserProfile(fbUser.uid);
          if (profile) {
            setCurrentUser(profile);
            setRoleState(profile.role);
            setAuthStatus('authenticated');
            setAppViewState('dashboard');

            if (profile.role === 'patient') {
              // Ensure authenticated patient document exists in Firestore
              const patientRecord = await ensurePatientProfile(profile);
              setPatients([patientRecord]);
              setSelectedPatientIdState(profile.id);
              await loadFirestoreDataForPatient(profile.id);
            } else if (profile.role === 'clinician') {
              // Ensure clinician document exists
              const clinicianRecord = await ensureClinicianProfile(profile);
              setClinician(clinicianRecord);
              const clinPatients = await fetchPatientsForClinician(fbUser.uid, profile.clinicId || 'demo-clinic');
              setPatients(clinPatients);
              if (clinPatients.length > 0) {
                setSelectedPatientIdState(clinPatients[0].id);
                await loadFirestoreDataForPatient(clinPatients[0].id);
              } else {
                setSelectedPatientIdState('');
                setMilestones([]);
                setPainCheckIns([]);
                setClinicalIncidents([]);
                setVisualReviews([]);
                setMessages([]);
              }
            }
          } else {
            // New user without profile -> trigger role onboarding with authenticated Google account identity
            const derivedName =
              fbUser.displayName ||
              (fbUser.email ? fbUser.email.split('@')[0] : 'Authorized User');
            const initialUser: User = {
              id: fbUser.uid,
              email: fbUser.email || `${fbUser.uid}@orthobond.ai`,
              name: derivedName,
              role: 'patient',
              avatarUrl: fbUser.photoURL || undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setCurrentUser(initialUser);
            setPatients([]);
            setSelectedPatientIdState(fbUser.uid);
            setAuthStatus('onboarding');
            setAppViewState('dashboard');
          }
        } catch (err) {
          console.warn('[OrthoStore] Auth state resolution note:', err);
        }
      } else {
        // If not authenticated in Firebase, check local storage demo state
        const storedDemo = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.IS_DEMO) : null;
        if (storedDemo === 'true') {
          const savedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
          const savedRole = localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole | null;
          if (savedUser && savedRole) {
            try {
              setCurrentUser(JSON.parse(savedUser));
              setRoleState(savedRole);
              setIsDemoMode(true);
              setPatients(DEMO_PATIENTS);
              setSelectedPatientIdState(DEMO_PATIENTS[0].id);
              setMilestones(DEMO_MILESTONES);
              setPainCheckIns(DEMO_PAIN_CHECKINS);
              setClinicalIncidents(DEMO_CLINICAL_INCIDENTS);
              setMessages(DEMO_MESSAGES);
              setClinician(DEMO_CLINICIAN);
              setAuthStatus('authenticated');
              setAppViewState('dashboard');
              return;
            } catch {}
          }
        }
        // Unauthenticated
        setCurrentUser(null);
        setPatients([]);
        setSelectedPatientIdState('');
        setMilestones([]);
        setPainCheckIns([]);
        setClinicalIncidents([]);
        setVisualReviews([]);
        setMessages([]);
        setAuthStatus('unauthenticated');
      }
    });

    return () => unsubscribe();
  }, [selectedPatientId]);

  // Handle selected patient change -> sync Firestore
  useEffect(() => {
    let active = true;
    if (authStatus === 'authenticated' && selectedPatientId) {
      Promise.resolve().then(() => {
        if (active) {
          loadFirestoreDataForPatient(selectedPatientId);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [selectedPatientId, authStatus]);

  const setAppView = (view: AppView) => {
    setAppViewState(view);
  };

  const loginWithGoogle = async () => {
    setLoginError(null);
    setAuthStatus('authenticating');
    try {
      const fbUser = await loginWithGooglePopup();
      if (!fbUser) {
        setLoginError('Sign in was dismissed. You can try again or use Quick Demo access below.');
        setAuthStatus('unauthenticated');
      }
      // On success, onAuthStateChanged listener handles the rest
    } catch (err: any) {
      console.warn('[OrthoBond Auth] Google login error:', err);
      const code = err?.code || '';
      if (code.includes('popup-closed-by-user') || code.includes('cancelled')) {
        setLoginError('Sign in window was closed. Please try again or use the demo options.');
      } else if (code.includes('unauthorized-domain')) {
        setLoginError('This domain is currently waiting for OAuth authorization. You can use the Quick Demo access below.');
      } else {
        setLoginError(err?.message || 'Authentication error. Please try again or select a demo persona below.');
      }
      setAuthStatus('unauthenticated');
    }
  };

  const loginWithDemo = (persona: 'clinician' | 'patient') => {
    setLoginError(null);
    setIsDemoMode(true);

    const user: User = persona === 'clinician'
      ? {
          id: DEMO_CLINICIAN.userId,
          name: DEMO_CLINICIAN.name || 'Dr. Sarah Chen',
          email: 'dr.chen@apexortho.com',
          role: 'clinician',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      : {
          id: DEMO_PATIENTS[0].userId,
          name: DEMO_PATIENTS[0].name,
          email: 'maya.lin@gmail.com',
          role: 'patient',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

    setCurrentUser(user);
    setRoleState(persona);
    setAuthStatus('authenticated');
    setAppViewState('dashboard');
    setClinician(DEMO_CLINICIAN);
    setPatients(DEMO_PATIENTS);
    setSelectedPatientIdState(DEMO_PATIENTS[0].id);
    setMilestones(DEMO_MILESTONES);
    setPainCheckIns(DEMO_PAIN_CHECKINS);
    setVisualReviews(DEMO_VISUAL_REVIEWS);
    setMessages(DEMO_MESSAGES);
    setClinicalIncidents(DEMO_CLINICAL_INCIDENTS);

    try {
      localStorage.setItem(STORAGE_KEYS.IS_DEMO, 'true');
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.AUTH_STATUS, 'authenticated');
      localStorage.setItem(STORAGE_KEYS.ROLE, persona);
    } catch {}
  };

  const logout = async () => {
    try {
      await logoutFirebaseAuth();
    } catch (err) {
      console.warn('Logout error:', err);
    }
    setIsDemoMode(false);
    setCurrentUser(null);
    setAuthStatus('unauthenticated');
    setAppViewState('landing');
    setLoginError(null);
    setPatients([]);
    setSelectedPatientIdState('');
    setMilestones([]);
    setPainCheckIns([]);
    setVisualReviews([]);
    setMessages([]);
    setClinicalIncidents([]);

    try {
      localStorage.removeItem(STORAGE_KEYS.IS_DEMO);
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      localStorage.setItem(STORAGE_KEYS.AUTH_STATUS, 'unauthenticated');
      localStorage.removeItem(STORAGE_KEYS.ROLE);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_PATIENT_ID);
    } catch {}
  };

  const completeOnboarding = async (chosenRole: UserRole) => {
    setRoleState(chosenRole);
    const derivedName =
      currentUser?.name ||
      (currentUser?.email ? currentUser.email.split('@')[0] : (chosenRole === 'clinician' ? 'Clinician' : 'Patient'));

    const updatedUser: User = {
      id: currentUser?.id || `user-${Date.now()}`,
      email: currentUser?.email || `${currentUser?.id || Date.now()}@orthobond.ai`,
      name: derivedName,
      role: chosenRole,
      avatarUrl: currentUser?.avatarUrl,
      createdAt: currentUser?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentUser(updatedUser);
    setAuthStatus('authenticated');
    setAppViewState('dashboard');

    try {
      // Persist user profile to Firestore
      await saveUserProfile(updatedUser);

      if (chosenRole === 'patient') {
        const patientRecord = await ensurePatientProfile(updatedUser);
        setPatients([patientRecord]);
        setSelectedPatientIdState(updatedUser.id);
        setMilestones([]);
        setPainCheckIns([]);
        setClinicalIncidents([]);
        setVisualReviews([]);
        setMessages([]);
        await loadFirestoreDataForPatient(updatedUser.id);
      } else if (chosenRole === 'clinician') {
        const clinicianRecord = await ensureClinicianProfile(updatedUser);
        setClinician(clinicianRecord);
        const clinPatients = await fetchPatientsForClinician(updatedUser.id);
        setPatients(clinPatients);
        if (clinPatients.length > 0) {
          setSelectedPatientIdState(clinPatients[0].id);
          await loadFirestoreDataForPatient(clinPatients[0].id);
        } else {
          setSelectedPatientIdState('');
          setMilestones([]);
          setPainCheckIns([]);
          setClinicalIncidents([]);
          setVisualReviews([]);
          setMessages([]);
        }
      }
    } catch (err) {
      console.warn('[OrthoStore] Error persisting onboarded profile to Firestore:', err);
    }
  };

  const importDemoPatientsForClinician = async () => {
    if (!currentUser || role !== 'clinician') return;
    try {
      setIsFirestoreSyncing(true);
      await initializeFirestoreDemoData(currentUser.id);
      for (const pat of DEMO_PATIENTS) {
        const linkedPat: PatientProfile = {
          ...pat,
          primaryClinicianId: currentUser.id,
        };
        await savePatientProfile(linkedPat);
      }
      const updatedList = await fetchPatientsForClinician(currentUser.id);
      if (updatedList.length > 0) {
        setPatients(updatedList);
        setSelectedPatientIdState(updatedList[0].id);
        await loadFirestoreDataForPatient(updatedList[0].id);
      }
    } catch (err) {
      console.warn('[OrthoStore] Error importing demo roster:', err);
    } finally {
      setIsFirestoreSyncing(false);
    }
  };

  const setRole = (newRole: UserRole) => {
    // If authenticated with a real Firebase user account, role is IMMUTABLE from the client
    if (authStatus === 'authenticated' && !isDemoMode && currentUser) {
      console.warn(
        `[OrthoBond Security] Unauthorized role alteration attempt rejected. Authenticated account (${currentUser.id}) has locked role: ${currentUser.role}`
      );
      return;
    }

    // In demo sandbox mode only, allow switching between simulated personas
    if (isDemoMode) {
      setRoleState(newRole);
      try {
        localStorage.setItem(STORAGE_KEYS.ROLE, newRole);
      } catch {}
    }
  };

  const setSelectedPatientId = (id: string) => {
    setSelectedPatientIdState(id);
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_PATIENT_ID, id);
    } catch {}
    if (!isDemoMode && id) {
      loadFirestoreDataForPatient(id);
    }
  };

  const fallbackPatient: PatientProfile = {
    id: currentUser?.id || 'pat-user',
    userId: currentUser?.id || 'user-default',
    primaryClinicianId: 'clin-001',
    name: currentUser?.name || 'Authorized Patient',
    dob: 'Not specified',
    archType: 'both',
    currentStage: 'Active Alignment',
    startDate: new Date().toISOString().split('T')[0],
    targetCompletion: 'To be determined',
    treatmentId: `treat-${currentUser?.id || 'default'}`,
    avatarUrl: currentUser?.avatarUrl,
  };

  const selectedPatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0] || fallbackPatient;
  const activeTreatment = selectedPatient ? DEMO_TREATMENTS.find((t) => t.id === selectedPatient.treatmentId) || null : null;

  // VISUAL REVIEWS
  const saveVisualReview = async (review: VisualReview) => {
    const cleanReview = sanitizeForFirestore(review) as VisualReview;
    cleanReview.verifiedAt = new Date().toISOString();

    const updatedReviews = [
      cleanReview,
      ...visualReviews.filter((r) => r.id !== review.id),
    ];
    setVisualReviews(updatedReviews);

    // Update milestone on the timeline
    const updatedMilestones = milestones.map((m) => {
      if (m.patientId === cleanReview.patientId && m.title.toLowerCase().includes('bonding')) {
        return {
          ...m,
          status: (cleanReview.status === 'verified' ? 'completed' : 'in_progress') as 'completed' | 'in_progress' | 'upcoming',
          completedDate: cleanReview.status === 'verified' ? new Date().toISOString().split('T')[0] : m.completedDate,
          associatedReviewId: cleanReview.id,
          notes: cleanReview.clinicianNotes || m.notes,
        };
      }
      return m;
    });
    setMilestones(updatedMilestones);

    // Persist review and updated milestone to Firestore
    try {
      await saveBondingReviewDoc(cleanReview.patientId, cleanReview);

      const targetMilestone = updatedMilestones.find(
        (m) => m.patientId === cleanReview.patientId && m.title.toLowerCase().includes('bonding')
      );
      if (targetMilestone) {
        await saveTreatmentMilestoneDoc(cleanReview.patientId, targetMilestone);
      }
    } catch (err) {
      console.warn('[OrthoStore] Firestore persistence note for visual review:', err);
    }
  };

  // PAIN CHECK-INS
  const addPainCheckIn = (checkIn: Omit<PainCheckIn, 'id' | 'timestamp'>): PainCheckIn => {
    const newRecord: PainCheckIn = {
      ...checkIn,
      id: `checkin-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    const clean = sanitizeForFirestore(newRecord) as PainCheckIn;
    setPainCheckIns((prev) => [clean, ...prev]);

    // Persist to Firestore subcollection asynchronously
    addDiscomfortCheckinDoc(clean.patientId, clean).catch((err) => {
      console.warn('[OrthoStore] Firestore persistence note for pain check-in:', err);
    });

    return clean;
  };

  // CLINICAL INCIDENTS
  const addClinicalIncident = (incident: Omit<ClinicalIncident, 'id' | 'timestamp' | 'status'>): ClinicalIncident => {
    const newIncident: ClinicalIncident = {
      ...incident,
      id: `inc-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'new',
    };

    const clean = sanitizeForFirestore(newIncident) as ClinicalIncident;
    setClinicalIncidents((prev) => [clean, ...prev]);

    // Persist to Firestore subcollection asynchronously
    addClinicalIncidentDoc(clean.patientId, clean).catch((err) => {
      console.warn('[OrthoStore] Firestore persistence note for incident:', err);
    });

    return clean;
  };

  const updateClinicalIncident = async (id: string, updates: Partial<ClinicalIncident>) => {
    setClinicalIncidents((prev) => prev.map((inc) => (inc.id === id ? { ...inc, ...updates } : inc)));

    try {
      await updateClinicalIncidentDoc(selectedPatient.id, id, updates);
    } catch (err) {
      console.warn('[OrthoStore] Firestore update note for incident:', err);
    }
  };

  // CLINICAL MESSAGES
  const sendMessage = (content: string, priority: 'normal' | 'urgent' = 'normal'): Message => {
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: role === 'clinician' ? clinician.userId : selectedPatient.userId,
      receiverId: role === 'clinician' ? selectedPatient.userId : clinician.userId,
      patientId: selectedPatient.id,
      content,
      priority,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const clean = sanitizeForFirestore(newMsg) as Message;
    setMessages((prev) => [clean, ...prev]);

    sendClinicalMessageDoc(selectedPatient.id, clean).catch((err) => {
      console.warn('[OrthoStore] Firestore send message note:', err);
    });

    return clean;
  };

  // CARE CONVERSATIONS
  const persistCareConversation = async (
    conversationId: string,
    convMessages: CompanionMessage[],
    summary?: string,
    isEmergencyAlert?: boolean
  ) => {
    try {
      await saveCareConversationDoc(
        selectedPatient.id,
        conversationId,
        convMessages,
        summary,
        isEmergencyAlert
      );
    } catch (err) {
      console.warn('[OrthoStore] Care conversation persistence note:', err);
    }
  };

  const resetToDemo = () => {
    setMilestones(DEMO_MILESTONES);
    setPainCheckIns(DEMO_PAIN_CHECKINS);
    setVisualReviews(DEMO_VISUAL_REVIEWS);
    setMessages(DEMO_MESSAGES);
    setClinicalIncidents(DEMO_CLINICAL_INCIDENTS);
    setSelectedPatientIdState(DEMO_PATIENTS[0].id);
    setRoleState('clinician');
    setActiveClinicianView('dashboard');
    setActivePatientTab('home');
    setIsDemoMode(true);
  };

  return (
    <OrthoStoreContext.Provider
      value={{
        role,
        setRole,
        authStatus,
        currentUser,
        appView,
        setAppView,
        loginError,
        loginWithGoogle,
        loginWithDemo,
        logout,
        completeOnboarding,
        isDemoMode,
        isFirestoreSyncing,
        clinician,
        patients,
        selectedPatient,
        setSelectedPatientId,
        activeTreatment,
        milestones: selectedPatient ? milestones.filter((m) => m.patientId === selectedPatient.id) : [],
        painCheckIns: selectedPatient ? painCheckIns.filter((c) => c.patientId === selectedPatient.id) : [],
        visualReviews: selectedPatient ? visualReviews.filter((r) => r.patientId === selectedPatient.id) : [],
        messages: selectedPatient ? messages.filter((m) => m.patientId === selectedPatient.id) : [],
        clinicalIncidents: selectedPatient ? clinicalIncidents.filter((inc) => inc.patientId === selectedPatient.id) : [],
        allClinicalIncidents: clinicalIncidents,
        saveVisualReview,
        addPainCheckIn,
        addClinicalIncident,
        updateClinicalIncident,
        sendMessage,
        persistCareConversation,
        importDemoPatientsForClinician,
        resetToDemo,
        isHydrated,
        activeClinicianView,
        setActiveClinicianView,
        activePatientTab,
        setActivePatientTab,
      }}
    >
      {children}
    </OrthoStoreContext.Provider>
  );
}

export function useOrthoStore() {
  const context = useContext(OrthoStoreContext);
  if (!context) {
    throw new Error('useOrthoStore must be used within an OrthoStoreProvider');
  }
  return context;
}
