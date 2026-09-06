# OrthoBond AI — Security Specification & Threat Model

## 1. Threat Zones & Invariants
- **Data Invariants**:
  - A patient's private records and clinical images can only be accessed by the authenticated patient or an authorized clinician bound by an active `ClinicianPatientRelationship`.
  - Clinicians cannot inspect patients outside their authorized roster.
  - Pain check-in logs are append-only immutable clinical history.
  - Gemini visual reviews are drafts until explicitly verified, rejected, or updated by a licensed clinician.
  - AI observations NEVER execute automated clinical prescriptions or diagnose diseases.

## 2. Dirty Dozen Payload Mitigations
1. **Cross-Patient Data Access**: Attempting to read another patient's records without an active clinical relationship → `PERMISSION_DENIED`.
2. **Identity Spoofing**: Attempting to set `id` or `userId` to another user's UID → rejected via `request.auth.uid` validation.
3. **Role Elevation**: A patient attempting to modify their role to `clinician` → rejected via immutable role rules in `users/{userId}`.
4. **Unauthenticated Read/Write**: Unauthenticated network calls → blocked by default deny rule.
5. **Ghost Field Poisoning**: Inserting unauthorized administrative fields into documents → prevented via strict schema checks and `affectedKeys()`.
6. **Immutable Field Tampering**: Modifying `createdAt`, `patientId`, or `treatmentId` during updates → blocked.
7. **Arbitrary Image URL Injection**: Passing arbitrary or malicious external URLs for server-side fetches → input validation rejects non-standard data URI or unauthorized hostnames.
8. **Prompt Injection via Patient Text**: Clinical notes or messages attempting system prompt override → strictly quarantined as untrusted text within delimited prompt blocks.
9. **Fake mm Measurement Fabrication**: AI output is prevented from outputting uncalibrated millimeter numbers by strict prompt boundaries and schema constraints.
10. **Orphaned Writes**: Writing milestones to non-existent treatments → rejected.
11. **Check-In History Rewrite**: Attempting to edit or delete historical pain scores → `allow update, delete: if false`.
12. **Secret Leakage**: Gemini API keys and sensitive tokens are confined to the server-side environment and never sent to client bundles.
