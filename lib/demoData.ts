import { User, ClinicianProfile, PatientProfile, Treatment, TreatmentMilestone, PainCheckIn, VisualReview, Message, ClinicalIncident } from './types';

// High-fidelity SVG-based clinical dental arch imagery with orthodontic brackets and archwire
export const CLINICAL_SAMPLE_IMAGES = {
  case1_reference: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 650" width="1000" height="650">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
        <linearGradient id="toothGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f8fafc"/>
          <stop offset="60%" stop-color="#f1f5f9"/>
          <stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
        <linearGradient id="gumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#e11d48" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#be123c" stop-opacity="0.9"/>
        </linearGradient>
        <linearGradient id="bracketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#cbd5e1"/>
          <stop offset="50%" stop-color="#94a3b8"/>
          <stop offset="100%" stop-color="#64748b"/>
        </linearGradient>
      </defs>
      <rect width="1000" height="650" fill="url(#bgGrad)"/>
      <text x="40" y="50" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="20" font-weight="600">VIRTUAL SETUP / PRESCRIPTION TARGET [UPPER ARCH]</text>
      <text x="40" y="75" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14">Ideal Slot Heights: Central 4.5mm • Lateral 4.0mm • Canine 5.0mm (Reference Guide)</text>
      
      <!-- Gingival Contour -->
      <path d="M 120 220 Q 250 160 500 150 Q 750 160 880 220 C 850 190 700 130 500 130 C 300 130 150 190 120 220 Z" fill="url(#gumGrad)"/>
      
      <!-- Maxillary Teeth (14, 13, 12, 11, 21, 22, 23, 24) -->
      <!-- FDI 13 Upper Right Canine -->
      <path d="M 160 300 Q 150 210 210 200 Q 270 210 260 330 Q 210 390 160 300 Z" fill="url(#toothGrad)" stroke="#cbd5e1" stroke-width="2"/>
      <!-- FDI 12 Upper Right Lateral -->
      <path d="M 270 320 Q 270 210 340 210 Q 400 220 390 340 Q 330 380 270 320 Z" fill="url(#toothGrad)" stroke="#cbd5e1" stroke-width="2"/>
      <!-- FDI 11 Upper Right Central -->
      <path d="M 400 340 Q 400 200 485 200 Q 500 220 495 380 Q 440 395 400 340 Z" fill="url(#toothGrad)" stroke="#cbd5e1" stroke-width="2"/>
      <!-- FDI 21 Upper Left Central -->
      <path d="M 505 380 Q 500 220 515 200 Q 600 200 600 340 Q 560 395 505 380 Z" fill="url(#toothGrad)" stroke="#cbd5e1" stroke-width="2"/>
      <!-- FDI 22 Upper Left Lateral -->
      <path d="M 610 340 Q 600 220 660 210 Q 730 210 730 320 Q 670 380 610 340 Z" fill="url(#toothGrad)" stroke="#cbd5e1" stroke-width="2"/>
      <!-- FDI 23 Upper Left Canine -->
      <path d="M 740 330 Q 730 210 790 200 Q 850 210 840 300 Q 790 390 740 330 Z" fill="url(#toothGrad)" stroke="#cbd5e1" stroke-width="2"/>

      <!-- Facial Axis of Clinical Crown & FA Point Crosshairs (Virtual Setup) -->
      <!-- Tooth 12 crosshair -->
      <line x1="310" y1="230" x2="350" y2="350" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="3,3"/>
      <line x1="290" y1="285" x2="370" y2="295" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="3,3"/>
      <!-- Tooth 11 crosshair -->
      <line x1="435" y1="220" x2="465" y2="360" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="3,3"/>
      <line x1="410" y1="290" x2="490" y2="290" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="3,3"/>
      <!-- Tooth 21 crosshair -->
      <line x1="565" y1="220" x2="535" y2="360" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="3,3"/>
      <line x1="510" y1="290" x2="590" y2="290" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="3,3"/>

      <!-- Prescribed Brackets (Ideal Placement) -->
      <!-- Bracket 13 -->
      <rect x="195" y="270" width="34" height="34" rx="4" fill="url(#bracketGrad)" stroke="#f8fafc" stroke-width="1"/>
      <line x1="190" y1="287" x2="234" y2="287" stroke="#0284c7" stroke-width="2"/>
      <!-- Bracket 12 (Target: exactly 4.0mm from incisal edge) -->
      <rect x="313" y="275" width="34" height="34" rx="4" fill="url(#bracketGrad)" stroke="#f8fafc" stroke-width="1"/>
      <line x1="308" y1="292" x2="352" y2="292" stroke="#0284c7" stroke-width="2"/>
      <text x="315" y="325" fill="#38bdf8" font-size="10" font-family="monospace">IDEAL</text>
      <!-- Bracket 11 -->
      <rect x="433" y="273" width="38" height="36" rx="4" fill="url(#bracketGrad)" stroke="#f8fafc" stroke-width="1"/>
      <line x1="428" y1="291" x2="476" y2="291" stroke="#0284c7" stroke-width="2"/>
      <!-- Bracket 21 -->
      <rect x="529" y="273" width="38" height="36" rx="4" fill="url(#bracketGrad)" stroke="#f8fafc" stroke-width="1"/>
      <line x1="524" y1="291" x2="572" y2="291" stroke="#0284c7" stroke-width="2"/>
      <!-- Bracket 22 -->
      <rect x="653" y="275" width="34" height="34" rx="4" fill="url(#bracketGrad)" stroke="#f8fafc" stroke-width="1"/>
      <line x1="648" y1="292" x2="692" y2="292" stroke="#0284c7" stroke-width="2"/>
      <!-- Bracket 23 -->
      <rect x="771" y="270" width="34" height="34" rx="4" fill="url(#bracketGrad)" stroke="#f8fafc" stroke-width="1"/>
      <line x1="766" y1="287" x2="810" y2="287" stroke="#0284c7" stroke-width="2"/>

      <!-- Prescribed Archwire Trajectory (Continuous smooth parabolic arch) -->
      <path d="M 150 285 Q 500 310 850 285" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6,4"/>
      <text x="40" y="600" fill="#64748b" font-family="sans-serif" font-size="13">Model: OrthoBond 3D Virtual Prescription • Patient Arch: Maxillary • Resolution: Calibrated 1000x650</text>
    </svg>
  `)}`,

  case1_actual: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 650" width="1000" height="650">
      <defs>
        <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
        <linearGradient id="toothGradReal" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#fdfbf7"/>
          <stop offset="50%" stop-color="#f8f4eb"/>
          <stop offset="100%" stop-color="#eadecb"/>
        </linearGradient>
        <linearGradient id="gumGradReal" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#be185d"/>
          <stop offset="100%" stop-color="#9d174d"/>
        </linearGradient>
        <linearGradient id="bracketSteel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f1f5f9"/>
          <stop offset="40%" stop-color="#94a3b8"/>
          <stop offset="70%" stop-color="#475569"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
        <filter id="flashGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#38bdf8" flood-opacity="0.6"/>
        </filter>
      </defs>
      <rect width="1000" height="650" fill="url(#bgGrad2)"/>
      <text x="40" y="50" fill="#10b981" font-family="system-ui, sans-serif" font-size="20" font-weight="600">ACTUAL CLINICAL POST-BONDING PHOTOGRAPH [UPPER ARCH]</text>
      <text x="40" y="75" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14">Patient: Maya Lin • Intraoral Micro-Lens Shot • Post-Curing Direct View</text>
      
      <!-- Natural Gingiva -->
      <path d="M 120 220 Q 250 160 500 150 Q 750 160 880 220 C 850 190 700 130 500 130 C 300 130 150 190 120 220 Z" fill="url(#gumGradReal)"/>
      
      <!-- Maxillary Teeth with Natural Shading -->
      <!-- FDI 13 -->
      <path d="M 160 300 Q 150 210 210 200 Q 270 210 260 330 Q 210 390 160 300 Z" fill="url(#toothGradReal)" stroke="#d6cfbe" stroke-width="2"/>
      <!-- FDI 12 -->
      <path d="M 270 320 Q 270 210 340 210 Q 400 220 390 340 Q 330 380 270 320 Z" fill="url(#toothGradReal)" stroke="#d6cfbe" stroke-width="2"/>
      <!-- FDI 11 -->
      <path d="M 400 340 Q 400 200 485 200 Q 500 220 495 380 Q 440 395 400 340 Z" fill="url(#toothGradReal)" stroke="#d6cfbe" stroke-width="2"/>
      <!-- FDI 21 -->
      <path d="M 505 380 Q 500 220 515 200 Q 600 200 600 340 Q 560 395 505 380 Z" fill="url(#toothGradReal)" stroke="#d6cfbe" stroke-width="2"/>
      <!-- FDI 22 -->
      <path d="M 610 340 Q 600 220 660 210 Q 730 210 730 320 Q 670 380 610 340 Z" fill="url(#toothGradReal)" stroke="#d6cfbe" stroke-width="2"/>
      <!-- FDI 23 -->
      <path d="M 740 330 Q 730 210 790 200 Q 850 210 840 300 Q 790 390 740 330 Z" fill="url(#toothGradReal)" stroke="#d6cfbe" stroke-width="2"/>

      <!-- Bonded Brackets with Natural Variances -->
      <!-- Bracket 13 (Well Placed) -->
      <rect x="195" y="270" width="34" height="34" rx="3" fill="url(#bracketSteel)" stroke="#94a3b8" stroke-width="1.5"/>
      <ellipse cx="212" cy="287" rx="14" ry="14" fill="none" stroke="#60a5fa" stroke-width="2.5"/> <!-- Ligature -->

      <!-- Bracket 12 (Apparent Discrepancy: Bonded noticeably more GINGIVAL - y=250 instead of 275) -->
      <rect x="313" y="250" width="34" height="34" rx="3" fill="url(#bracketSteel)" stroke="#f59e0b" stroke-width="2"/>
      <ellipse cx="330" cy="267" rx="14" ry="14" fill="none" stroke="#60a5fa" stroke-width="2.5"/>
      <!-- Visual deviation highlight point -->
      <circle cx="330" cy="275" r="3" fill="#f59e0b"/>

      <!-- Bracket 11 (Well Placed) -->
      <rect x="433" y="273" width="38" height="36" rx="3" fill="url(#bracketSteel)" stroke="#94a3b8" stroke-width="1.5"/>
      <ellipse cx="452" cy="291" rx="15" ry="15" fill="none" stroke="#60a5fa" stroke-width="2.5"/>

      <!-- Bracket 21 (Apparent Discrepancy: Visible Adhesive/Composite Flash along Mesial Margin) -->
      <rect x="529" y="273" width="38" height="36" rx="3" fill="url(#bracketSteel)" stroke="#94a3b8" stroke-width="1.5"/>
      <!-- Excess Composite Flash -->
      <path d="M 526 270 Q 515 285 524 312 Q 528 315 530 305 Z" fill="#fed7aa" opacity="0.85" stroke="#f97316" stroke-width="1"/>
      <ellipse cx="548" cy="291" rx="15" ry="15" fill="none" stroke="#60a5fa" stroke-width="2.5"/>

      <!-- Bracket 22 (Well Placed) -->
      <rect x="653" y="275" width="34" height="34" rx="3" fill="url(#bracketSteel)" stroke="#94a3b8" stroke-width="1.5"/>
      <ellipse cx="670" cy="292" rx="14" ry="14" fill="none" stroke="#60a5fa" stroke-width="2.5"/>

      <!-- Bracket 23 (Well Placed) -->
      <rect x="771" y="270" width="34" height="34" rx="3" fill="url(#bracketSteel)" stroke="#94a3b8" stroke-width="1.5"/>
      <ellipse cx="788" cy="287" rx="14" ry="14" fill="none" stroke="#60a5fa" stroke-width="2.5"/>

      <!-- Actual Archwire (0.014 NiTi engaged in slots) -->
      <path d="M 150 287 Q 212 287 330 267 Q 452 291 548 291 Q 670 292 788 287 L 850 287" fill="none" stroke="#e2e8f0" stroke-width="3.5"/>

      <text x="40" y="600" fill="#64748b" font-family="sans-serif" font-size="13">High-Definition Macro Sensor • True Color Gamut • Uncalibrated 2D Intraoral Presentation</text>
    </svg>
  `)}`,
};

export const DEMO_CLINICIAN: ClinicianProfile = {
  id: 'clin-sarah-chen',
  userId: 'user-clin-1',
  name: 'Dr. Sarah Chen',
  clinicName: 'Apex Orthodontics & Facial Aesthetics',
  licenseNumber: 'CA-ORTHO-88412',
  specialty: 'Orthodontics & Dentofacial Orthopedics',
  phone: '(415) 890-2104',
};

export const DEMO_PATIENTS: PatientProfile[] = [
  {
    id: 'pat-maya-lin',
    userId: 'user-pat-maya',
    primaryClinicianId: 'clin-sarah-chen',
    name: 'Maya Lin',
    dob: '2005-04-12',
    archType: 'maxillary',
    currentStage: 'Initial Bonding & Leveling (Stage 1 of 5)',
    startDate: '2026-08-14',
    targetCompletion: '2027-10-15',
    treatmentId: 'treat-maya-01',
  },
  {
    id: 'pat-marcus-vance',
    userId: 'user-pat-marcus',
    primaryClinicianId: 'clin-sarah-chen',
    name: 'Marcus Vance',
    dob: '1998-11-23',
    archType: 'both',
    currentStage: 'Stage 2: Transverse Expansion & Alignment',
    startDate: '2026-06-02',
    targetCompletion: '2027-08-20',
    treatmentId: 'treat-marcus-02',
  },
  {
    id: 'pat-elena-rostova',
    userId: 'user-pat-elena',
    primaryClinicianId: 'clin-sarah-chen',
    name: 'Elena Rostova',
    dob: '2009-02-18',
    archType: 'maxillary',
    currentStage: 'Stage 3: Space Consolidation & Arch Coordination',
    startDate: '2026-01-10',
    targetCompletion: '2027-04-30',
    treatmentId: 'treat-elena-03',
  },
];

export const DEMO_TREATMENTS: Treatment[] = [
  {
    id: 'treat-maya-01',
    patientId: 'pat-maya-lin',
    clinicianId: 'clin-sarah-chen',
    diagnosis: 'Angle Class I Malocclusion with moderate maxillary anterior crowding (4.5mm) and rotated canine #13.',
    applianceType: '0.022 Twin Edgewise Ceramic Brackets (Roth Prescription)',
    prescription: 'Roth .022 Slot with hook on Canines and Premolars',
    wireSequence: '0.014 NiTi → 0.018 NiTi → 0.016x0.022 BioForce NiTi → 0.019x0.025 SS Finishing',
    status: 'active',
    createdAt: '2026-08-14T09:30:00Z',
  },
  {
    id: 'treat-marcus-02',
    patientId: 'pat-marcus-vance',
    clinicianId: 'clin-sarah-chen',
    diagnosis: 'Class II Division 1 with deep overbite (60%) and constricted maxillary arch.',
    applianceType: 'Self-Ligating Passive Bracket System (0.022 Slot)',
    prescription: 'High Torque Upper Anterior, Standard Torque Lower',
    wireSequence: '0.014 Copper NiTi → 0.018 CuNiTi → 0.014x0.025 CuNiTi → 0.019x0.025 TMA',
    status: 'active',
    createdAt: '2026-06-02T11:00:00Z',
  },
  {
    id: 'treat-elena-03',
    patientId: 'pat-elena-rostova',
    clinicianId: 'clin-sarah-chen',
    diagnosis: 'Class I Bimaxillary Protrusion, post-premolar extraction space closure in final detailing phase.',
    applianceType: '0.018 Low-Profile Metal Brackets with Class II intermaxillary elastics',
    prescription: 'MBT .018 Slot with power chain space closure',
    wireSequence: '0.016x0.022 SS Posted Archwires → 0.017x0.025 Braided Steel Finishing',
    status: 'active',
    createdAt: '2026-01-10T08:30:00Z',
  },
];

export const DEMO_MILESTONES: TreatmentMilestone[] = [
  // Maya Lin
  {
    id: 'mile-maya-1',
    treatmentId: 'treat-maya-01',
    patientId: 'pat-maya-lin',
    title: 'Initial Comprehensive Records & 3D Virtual Setup',
    stageNumber: 1,
    scheduledDate: '2026-08-14',
    status: 'completed',
    completedDate: '2026-08-14',
    notes: 'Cephalometric, panoramic, intraoral scan, and facial photography completed.',
  },
  {
    id: 'mile-maya-2',
    treatmentId: 'treat-maya-01',
    patientId: 'pat-maya-lin',
    title: 'Maxillary Direct Bonding & Gemini Visual Verification',
    stageNumber: 2,
    scheduledDate: '2026-08-28',
    status: 'in_progress',
    notes: 'Direct bonding 15 to 25. High-resolution reference setup compared with post-curing intraoral photo.',
  },
  {
    id: 'mile-maya-3',
    treatmentId: 'treat-maya-01',
    patientId: 'pat-maya-lin',
    title: '1st Archwire Activation (0.018 NiTi Progression)',
    stageNumber: 3,
    scheduledDate: '2026-10-10',
    status: 'upcoming',
    notes: 'Assess canine derotation and slot engagement.',
  },
  {
    id: 'mile-maya-4',
    treatmentId: 'treat-maya-01',
    patientId: 'pat-maya-lin',
    title: 'Mandibular Bonding & Arch Coordination',
    stageNumber: 4,
    scheduledDate: '2026-11-20',
    status: 'upcoming',
  },

  // Marcus Vance
  {
    id: 'mile-marcus-1',
    treatmentId: 'treat-marcus-02',
    patientId: 'pat-marcus-vance',
    title: 'Initial Clinical Diagnostic Workup & Digital Ceph',
    stageNumber: 1,
    scheduledDate: '2026-06-02',
    status: 'completed',
    completedDate: '2026-06-02',
    notes: 'Comprehensive airway analysis, transverse dimension assessment, and bite registration.',
  },
  {
    id: 'mile-marcus-2',
    treatmentId: 'treat-marcus-02',
    patientId: 'pat-marcus-vance',
    title: 'Dual Arch Passive Self-Ligating Bonding',
    stageNumber: 2,
    scheduledDate: '2026-06-20',
    status: 'completed',
    completedDate: '2026-06-20',
    notes: 'Full bonding maxillary and mandibular arches with 0.014 CuNiTi light expansion archwires.',
  },
  {
    id: 'mile-marcus-3',
    treatmentId: 'treat-marcus-02',
    patientId: 'pat-marcus-vance',
    title: 'Transverse Archwire Expansion (0.018 CuNiTi)',
    stageNumber: 3,
    scheduledDate: '2026-09-02',
    status: 'in_progress',
    notes: 'Current active stage. Lateral expansion progression; replace lower power chain as needed.',
  },
  {
    id: 'mile-marcus-4',
    treatmentId: 'treat-marcus-02',
    patientId: 'pat-marcus-vance',
    title: 'Overbite Correction & Rectangular Archwire Progression',
    stageNumber: 4,
    scheduledDate: '2026-11-15',
    status: 'upcoming',
    notes: 'Introduce reverse curve of Spee wire for deep bite reduction.',
  },

  // Elena Rostova
  {
    id: 'mile-elena-1',
    treatmentId: 'treat-elena-03',
    patientId: 'pat-elena-rostova',
    title: 'Extraction Space Management & Alignment',
    stageNumber: 1,
    scheduledDate: '2026-01-10',
    status: 'completed',
    completedDate: '2026-01-10',
    notes: 'Premolar extraction healing verified; initial levelling complete.',
  },
  {
    id: 'mile-elena-2',
    treatmentId: 'treat-elena-03',
    patientId: 'pat-elena-rostova',
    title: 'En-Masse Canine & Anterior Retraction',
    stageNumber: 2,
    scheduledDate: '2026-04-18',
    status: 'completed',
    completedDate: '2026-04-18',
    notes: 'Space closure completed with posted stainless steel archwires and NiTi closing coils.',
  },
  {
    id: 'mile-elena-3',
    treatmentId: 'treat-elena-03',
    patientId: 'pat-elena-rostova',
    title: 'Space Consolidation & Arch Coordination',
    stageNumber: 3,
    scheduledDate: '2026-07-25',
    status: 'in_progress',
    notes: 'Final micro-space closure between #12 and #13. Excellent patient elastic compliance.',
  },
  {
    id: 'mile-elena-4',
    treatmentId: 'treat-elena-03',
    patientId: 'pat-elena-rostova',
    title: 'Final Detailing & Debonding Preparation',
    stageNumber: 4,
    scheduledDate: '2026-10-05',
    status: 'upcoming',
    notes: 'Braided wire finishing and 3D retention digital scan.',
  },
];

export const DEMO_PAIN_CHECKINS: PainCheckIn[] = [
  // Maya Lin
  {
    id: 'checkin-maya-1',
    patientId: 'pat-maya-lin',
    painScore: 3,
    discomfortLocation: 'Upper front incisors and premolars',
    symptoms: ['Dull aching pressure', 'Mild tenderness when chewing'],
    notes: 'Teeth feel a bit tight after initial bonding yesterday, but chewing soft pasta is fine.',
    aiSummary: 'Normal initial adaptation response. Light continuous forces naturally create temporary mild periodontal tightness.',
    timestamp: '2026-08-29T19:30:00Z',
  },
  {
    id: 'checkin-maya-2',
    patientId: 'pat-maya-lin',
    painScore: 2,
    discomfortLocation: 'Right upper canine region',
    symptoms: ['Slight cheek friction'],
    notes: 'Applied wax over bracket 13 and feeling much better.',
    aiSummary: 'Appropriate self-management with orthodontic relief wax.',
    timestamp: '2026-08-31T14:15:00Z',
  },

  // Marcus Vance
  {
    id: 'checkin-marcus-1',
    patientId: 'pat-marcus-vance',
    painScore: 4,
    discomfortLocation: 'Lower molar area (right side)',
    symptoms: ['Cheek rubbing', 'Tender when biting hard food'],
    notes: 'Wire change yesterday caused moderate pressure on the lower molars. Taking ibuprofen.',
    aiSummary: 'Standard post-activation soreness. Recommend soft foods for 48 hours and relief wax.',
    timestamp: '2026-09-02T20:10:00Z',
  },
  {
    id: 'checkin-marcus-2',
    patientId: 'pat-marcus-vance',
    painScore: 3,
    discomfortLocation: 'Lower right quadrant',
    symptoms: ['Broken power chain', 'Mild rubbing'],
    notes: 'Lower elastic snapped during dinner. Not very painful, just feels loose.',
    aiSummary: 'Hardware detachment noted. Clinician review ticket generated.',
    timestamp: '2026-09-04T18:40:00Z',
  },

  // Elena Rostova
  {
    id: 'checkin-elena-1',
    patientId: 'pat-elena-rostova',
    painScore: 1,
    discomfortLocation: 'Upper incisors',
    symptoms: ['Minimal pressure'],
    notes: 'Everything feels comfortable. Wearing elastics 22 hours daily as instructed.',
    aiSummary: 'Optimal adaptation and excellent treatment adherence. No active interventions required.',
    timestamp: '2026-09-01T10:15:00Z',
  },
  {
    id: 'checkin-elena-2',
    patientId: 'pat-elena-rostova',
    painScore: 0,
    discomfortLocation: 'None',
    symptoms: [],
    notes: 'No discomfort at all. Eating normally and elastics are very easy to change.',
    aiSummary: 'Zero discomfort reported. Treatment progression on schedule.',
    timestamp: '2026-09-03T16:00:00Z',
  },
];

export const DEMO_MESSAGES: Message[] = [
  // Maya Lin
  {
    id: 'msg-1',
    senderId: 'user-pat-maya',
    receiverId: 'user-clin-1',
    patientId: 'pat-maya-lin',
    content: 'Hi Dr. Chen! The orthodontic wax helped a lot with the canine hook. Is it normal to feel a bit of clicking when brushing around bracket 12?',
    priority: 'normal',
    timestamp: '2026-08-31T15:20:00Z',
    read: true,
  },
  {
    id: 'msg-2',
    senderId: 'user-clin-1',
    receiverId: 'user-pat-maya',
    patientId: 'pat-maya-lin',
    content: 'Hi Maya, great job using the wax! Light brushing with a soft-bristled brush is perfect. We have our visual review on file and will evaluate tooth 12 closely at your next visit.',
    priority: 'normal',
    timestamp: '2026-08-31T16:05:00Z',
    read: true,
  },

  // Marcus Vance
  {
    id: 'msg-marcus-1',
    senderId: 'user-pat-marcus',
    receiverId: 'user-clin-1',
    patientId: 'pat-marcus-vance',
    content: 'Dr. Chen, my lower elastic chain snapped on the right side. Should I stop wearing the rubber bands until Thursday?',
    priority: 'normal',
    timestamp: '2026-09-04T19:00:00Z',
    read: true,
  },
  {
    id: 'msg-marcus-2',
    senderId: 'user-clin-1',
    receiverId: 'user-pat-marcus',
    patientId: 'pat-marcus-vance',
    content: 'Hi Marcus, continue wearing your night elastics on the left side only. We will replace the chain Thursday at 2:15 PM.',
    priority: 'normal',
    timestamp: '2026-09-04T19:35:00Z',
    read: true,
  },

  // Elena Rostova
  {
    id: 'msg-elena-1',
    senderId: 'user-pat-elena',
    receiverId: 'user-clin-1',
    patientId: 'pat-elena-rostova',
    content: 'Good morning Dr. Chen! I am down to my last bag of medium 3/16 elastics. Can I pick up another packet tomorrow?',
    priority: 'normal',
    timestamp: '2026-09-02T11:00:00Z',
    read: true,
  },
  {
    id: 'msg-elena-2',
    senderId: 'user-clin-1',
    receiverId: 'user-pat-elena',
    patientId: 'pat-elena-rostova',
    content: 'Hi Elena! Yes, front desk has a fresh pack ready at reception anytime between 8 AM and 5 PM.',
    priority: 'normal',
    timestamp: '2026-09-02T11:22:00Z',
    read: true,
  },
];

export const DEMO_CLINICAL_INCIDENTS: ClinicalIncident[] = [
  // Maya Lin: Active Priority Incident
  {
    id: 'inc-maya-hero-1',
    patientId: 'pat-maya-lin',
    patientName: 'Maya Lin',
    patientReport: 'Wire is poking my cheek and bracket feels loose after eating lunch.',
    painScore: 7,
    reportedSymptoms: ['Wire poking cheek', 'Loose bracket feeling', 'Acute cheek irritation'],
    suspectedHardwareConcern: 'Loose Canine Bracket (FDI 13) & Distal Archwire Impingement',
    affectedArea: 'Upper Right Quadrant',
    photoUrl: CLINICAL_SAMPLE_IMAGES.case1_actual,
    urgencyCategory: 'priority_review',
    clinicianReviewRecommended: true,
    patientGuidance: [
      'Apply a generous pea-sized ball of orthodontic relief wax over the poking wire end.',
      'Do not attempt to cut or bend the archwire at home.',
      'Rinse with warm salt water to soothe irritated cheek mucosa.',
    ],
    uncertainty: 'Patient reported loose feel; visual verification recommended to confirm bonding integrity.',
    status: 'new',
    timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(), // 18 min ago
  },

  // Marcus Vance: Reviewed Non-Critical Incident
  {
    id: 'inc-marcus-2',
    patientId: 'pat-marcus-vance',
    patientName: 'Marcus Vance',
    patientReport: 'Elastic chain feels like it snapped between lower molars.',
    painScore: 3,
    reportedSymptoms: ['Broken power chain', 'Mild rubbing'],
    suspectedHardwareConcern: 'Fractured Power Chain / Displaced Ligature',
    affectedArea: 'Lower Right Arch',
    urgencyCategory: 'contact_clinic',
    clinicianReviewRecommended: true,
    patientGuidance: [
      'If loose elastic is causing friction, remove only the detached fragment with clean tweezers.',
      'Schedule a brief 10-minute chairside tie-in at your convenience.',
    ],
    status: 'reviewed',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    clinicianActionTaken: 'Re-tie scheduled for Thursday 2:15 PM with orthodontic assistant.',
  },
  // Note: Elena Rostova has 0 incidents, demonstrating clean check-in history!
];

export const DEMO_VISUAL_REVIEWS: VisualReview[] = [
  {
    id: 'rev-maya-01',
    patientId: 'pat-maya-lin',
    clinicianId: 'clin-sarah-chen',
    treatmentId: 'treat-maya-01',
    referenceImageUrl: CLINICAL_SAMPLE_IMAGES.case1_reference,
    actualImageUrl: CLINICAL_SAMPLE_IMAGES.case1_actual,
    overall_reviewable: true,
    image_quality: {
      status: 'optimal',
      overall_reviewable: true,
      blur_detected: false,
      lighting_adequate: true,
      glare_obstruction: false,
      hardware_visible: true,
      issues: [],
      recommendations: ['Intraoral field dry, sharp bracket-to-enamel interface resolution.'],
    },
    summary: 'Direct visual comparison indicates apparent slightly gingival bracket position at FDI 12 (Upper Right Lateral Incisor) relative to virtual setup crosshairs, with slight composite adhesive flash around distal margin of FDI 21.',
    findings: [
      {
        finding_id: 'find-maya-1',
        tooth_reference: 'FDI 12 (Upper Right Lateral Incisor)',
        hardware: 'Bracket',
        visual_observation: 'Bracket slot center appears positioned slightly gingival (~0.4mm apparent displacement) relative to the FA point designated on the 3D virtual plan.',
        apparent_difference: 'Apparent gingival position compared to virtual prescription',
        confidence: 'high',
        bounding_box: { ymin: 400, xmin: 300, ymax: 560, xmax: 370 },
        verification_status: 'verified',
        clinician_comment: 'Verified chairside. Slight gingival positioning noted; acceptable for initial levelling, will monitor rotation at 0.018 NiTi wire change.',
      },
      {
        finding_id: 'find-maya-2',
        tooth_reference: 'FDI 21 (Upper Left Central Incisor)',
        hardware: 'Adhesive Flash',
        visual_observation: 'Visible excess composite adhesive resin extending beyond gingivo-distal bracket base perimeter.',
        apparent_difference: 'Excess adhesive flash at margin',
        confidence: 'moderate',
        bounding_box: { ymin: 420, xmin: 520, ymax: 580, xmax: 590 },
        verification_status: 'verified',
        clinician_comment: 'Smooth cleanup performed with 12-fluted carbide bur.',
      },
    ],
    limitations: [
      '2D intraoral photograph lacks micro-calibrated metric depth scaling.',
      'Minor salivary reflection near tooth 22 incisal third.',
    ],
    clinicianNotes: 'Verified bracket heights. Tooth 12 will derotate predictably with light continuous wire engagement.',
    status: 'verified',
    createdAt: '2026-08-28T16:30:00Z',
    verifiedAt: '2026-08-28T16:45:00Z',
  },
  {
    id: 'rev-marcus-01',
    patientId: 'pat-marcus-vance',
    clinicianId: 'clin-sarah-chen',
    treatmentId: 'treat-marcus-02',
    referenceImageUrl: CLINICAL_SAMPLE_IMAGES.case1_reference,
    actualImageUrl: CLINICAL_SAMPLE_IMAGES.case1_actual,
    overall_reviewable: true,
    image_quality: {
      status: 'adequate',
      overall_reviewable: true,
      blur_detected: false,
      lighting_adequate: true,
      glare_obstruction: false,
      hardware_visible: true,
      issues: [],
      recommendations: ['Adequate illumination, good buccal exposure.'],
    },
    summary: 'Pre-expansion verification confirms passive bracket slot alignment. Archwire fully seated across premolars.',
    findings: [
      {
        finding_id: 'find-marcus-1',
        tooth_reference: 'FDI 14 (Upper Right First Premolar)',
        hardware: 'Self-Ligating Bracket',
        visual_observation: 'Door clip closed securely; slot alignment congruent with prescribed transverse trajectory.',
        apparent_difference: 'Well aligned with setup',
        confidence: 'high',
        verification_status: 'verified',
        clinician_comment: 'Confirmed door closure and wire engagement.',
      },
    ],
    limitations: ['Minor buccal fold shadow on terminal molars.'],
    clinicianNotes: 'All self-ligating doors secured. Patient tolerating transverse wire sequence well.',
    status: 'verified',
    createdAt: '2026-06-20T14:15:00Z',
    verifiedAt: '2026-06-20T14:25:00Z',
  },
  {
    id: 'rev-elena-01',
    patientId: 'pat-elena-rostova',
    clinicianId: 'clin-sarah-chen',
    treatmentId: 'treat-elena-03',
    referenceImageUrl: CLINICAL_SAMPLE_IMAGES.case1_reference,
    actualImageUrl: CLINICAL_SAMPLE_IMAGES.case1_actual,
    overall_reviewable: true,
    image_quality: {
      status: 'optimal',
      overall_reviewable: true,
      blur_detected: false,
      lighting_adequate: true,
      glare_obstruction: false,
      hardware_visible: true,
      issues: [],
      recommendations: ['Dry field, excellent contrast and focus.'],
    },
    summary: 'Finishing stage visual review confirms space closure without significant axial tipping.',
    findings: [
      {
        finding_id: 'find-elena-1',
        tooth_reference: 'FDI 13 & 12 Contact',
        hardware: 'Interdental Space',
        visual_observation: 'Proximal contact closed securely under continuous elastic chain retraction.',
        apparent_difference: 'Complete space closure achieved',
        confidence: 'high',
        verification_status: 'verified',
        clinician_comment: 'Contact flosses firmly. Ready for final finishing archwire.',
      },
    ],
    limitations: ['2D occlusal aspect only.'],
    clinicianNotes: 'Spaces closed. Retainers planned for next appointment.',
    status: 'verified',
    createdAt: '2026-07-25T11:00:00Z',
    verifiedAt: '2026-07-25T11:15:00Z',
  },
];

