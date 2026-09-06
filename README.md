# OrthoBond AI — Clinical Care & Visual Bracket Verification Platform

> **AI-assisted orthodontic care platform connecting continuous patient monitoring with Gemini-powered visual orthodontic review for clinicians.**

---

## 1. Product Overview

OrthoBond AI bridges the critical care gap in orthodontic treatment between office visits. It unites:

**Treatment Planning → Continuous Patient Monitoring → Gemini Multimodal Assistance → Clinician Triage & Review → Verified Outcomes**

### Connected Experiences
1. **Public Product Entry & Authentication**
   - High-trust clinical product landing page with clear value propositions, interactive feature tabs, clinical safety manifesto, and instant demo shortcuts.
   - Secure authentication supporting Google Sign-In and pre-configured clinical personas (Senior Orthodontist Dr. Sarah Chen & Orthodontic Patient Maya Lin).
   - First-time role onboarding modal (`I'm a Patient` vs. `I'm a Clinician`) with role persistence and seamless switching.

2. **Clinician Portal**
   - **Hero P0 Feature**: AI-Assisted Bracket Placement Visual Review.
   - Dual-image optical comparison: Virtual setup / indirect bonding prescription model vs. actual post-bonding intraoral clinical photograph.
   - Automated Optical Image Quality Gate (motion blur, dry field, lighting, hardware visibility).
   - Gemini Multimodal analysis generating structured findings with normalized bounding box overlays (`ymin`, `xmin`, `ymax`, `xmax` in 0–1000 coordinate space).
   - Human-in-the-Loop verification: Clinicians can verify, reject, or mark findings for in-office examination, add clinical comments, specify clinical orders, and save reviews directly to the patient's Treatment Timeline.
   - Clinical Concerns Triage Queue: Prioritize acute patient alerts (discomfort, poking wires, debonded brackets) with one-click clinical responses.
   - Interactive Treatment Timeline tracking milestones from diagnostic records through archwire progression and retention.

3. **Patient Experience**
   - **Continuous Care Companion**: Free-form natural language conversation helping patients report discomfort, check hardware concerns, and receive conservative, safe comfort guidance between appointments.
   - Daily pain & discomfort check-in with descriptive 0–10 intensity slider and anatomical location tagging.
   - Symptom checklist & optional smile photo capture.
   - Conservative, non-diagnostic AI guidance generated via Gemini with relief wax recommendations, diet adjustments, and clear red-flag clinical escalation triggers.
   - Direct two-way clinic messaging to Dr. Sarah Chen.

---

## 2. Clinical Safety Standard

OrthoBond AI strictly adheres to clinical decision support standards:
- **No Autonomous Medical Decisions**: The AI is an assistive visual screening instrument; licensed clinicians retain 100% decision authority.
- **Uncalibrated 2D Optical Reality**: The system strictly bans fabricating millimeter measurements (e.g. "displaced by 2.4 mm") from uncalibrated 2D photographs. It reports observations as *apparent visual differences*.
- **Conservative Terminology**: Uses standardized FDI two-digit notation when clearly identifiable, explicitly falling back to *"Tooth reference uncertain"* when ambiguous.
- **Human-in-the-Loop Oversight**: Visual reviews remain drafts until explicitly verified, adjusted, and signed off by the clinician.

---

## 3. Technology Stack & Architecture

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **AI Engine**: Gemini 2.5 Flash via `@google/genai` TypeScript SDK (server-side proxy routes).
- **Backend API Routes**:
  - `POST /api/gemini/bracket-verification`: Dual-image multimodal bracket placement verification with optical quality check and structured coordinate output.
  - `POST /api/gemini/patient-summary`: Conservative, non-diagnostic patient guidance and home comfort recommendations.
  - `POST /api/gemini/care-companion`: Conversational care assistant for patient triage and comfort protocols.
- **Security & Data Persistence**:
  - Zero-trust input validation (`validateImageBase64`, safe sanitization utilities).
  - Relationship-bound authorization schemas defined in `firebase-blueprint.json` and secured in `firestore.rules`.
  - Server-side secret protection: `GEMINI_API_KEY` is never exposed to browser bundles.

---

## 4. End-to-End Demo Sequence (Hackathon Presentation Flow)

1. **Product Entry**: Start at the root landing page; inspect the clinical value proposition, "How It Works" workflow, and clinical safety principles.
2. **Clinician Authentication**: Click **"Clinician Demo"** or sign in as Dr. Sarah Chen.
3. **Clinical Workspace**: View the practice overview, active patient list, and clinical triage queue.
4. **Select Patient**: Open **Maya Lin** (Stage 2 Direct Bonding).
5. **Hero Bracket Verification**:
   - Click **"Verify Bracket Bonding with Gemini"**.
   - Review the preloaded Case #1 (Upper Arch Direct Bonding) images.
   - Inspect the automated Optical Quality Gate results.
   - Run the Gemini Multimodal Bracket Verification.
   - Click findings or bounding box overlays to inspect slot angle divergence, FDI tooth tags, and adhesive flash.
   - Verify observations, enter clinical recommendations, and click **"Save Verified Review to Patient Treatment Timeline"**.
6. **Timeline Confirmation**: Verify that the review is now permanently linked to Maya Lin's treatment record.
7. **Switch to Patient**: Use the header **Demo Role** toggle to switch to **Patient** mode (Maya Lin).
8. **Care Companion**: Click **"Talk to OrthoBond AI"**, select the scenario *"Wire is poking my cheek and bracket feels loose"*, and observe the empathetic, conservative clinical guidance generated by Gemini.
9. **Daily Check-In & Messaging**: Submit a discomfort check-in and send a message to Dr. Sarah Chen.
10. **Sign Out**: Click **Sign Out** to return cleanly to the public product landing page.
