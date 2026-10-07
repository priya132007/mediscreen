export type Priority = "normal" | "medium" | "high";
export type ReviewState = "pending" | "accepted" | "corrected" | "rejected";
export type AppointmentType = "immediate" | "normal" | "follow-up";

export type Patient = {
  id: string;
  name: string;
  initials: string;
  age: number;
  sex: string;
  patientId: string;
  preferredLanguage: string;
  lastUpdated: string;
  queueStatus: "new" | "reviewed" | "follow-up";
};

export type SymptomAnswer = {
  questionId: string;
  question: string;
  answer: string;
  answeredAt: string;
};

export type Question = {
  id: string;
  prompt: string;
  helper?: string;
  options?: string[];
  required?: boolean;
};

export type MedicalDocument = {
  id: string;
  name: string;
  type: "Prescription" | "Lab report" | "Discharge summary" | "Medical document";
  date: string;
  status: "processing" | "ready" | "needs-review";
  extractedCount: number;
  reviewState: ReviewState;
};

export type ExtractedEntity = {
  id: string;
  category: "Diagnosis" | "Medicine" | "Dosage" | "Lab test" | "Lab value" | "Date" | "Procedure" | "Symptom";
  value: string;
  source: string;
  confidence: number;
  reviewState: ReviewState;
};

export type TimelineEvent = {
  id: string;
  date: string;
  year: string;
  title: string;
  detail: string;
  source: string;
  tone: "teal" | "amber" | "navy";
};

export type LabTrend = {
  label: string;
  unit: string;
  values: { year: string; value: number }[];
  interpretation: string;
  tone: "up" | "stable";
};

export type RedFlag = {
  id: string;
  title: string;
  detail: string;
  evidence: string;
  severity: "high" | "medium";
  reviewState: ReviewState;
};

export type PriorityAssessment = {
  level: Priority;
  label: string;
  reasons: string[];
  disclaimer: string;
};

export type MedicationReview = {
  medicine: string;
  context: string;
  status: "review" | "clear";
  note: string;
};

export type AppointmentDecision = {
  type: AppointmentType;
  followUpDate?: string;
  note: string;
  savedAt?: string;
};

export type PatientDashboardData = {
  patient: Patient;
  symptoms: string[];
  currentSymptomText: string;
  intakeComplete: boolean;
  intakeNote: string;
  questions: Question[];
  answers: SymptomAnswer[];
  documents: MedicalDocument[];
  entities: ExtractedEntity[];
  timeline: TimelineEvent[];
  trends: LabTrend[];
  redFlags: RedFlag[];
  priority: PriorityAssessment;
  medicationReview: MedicationReview[];
  medications: string[];
  allergies: string[];
  summary: string;
  summaryReviewState: ReviewState;
  feedback: DoctorFeedback | null;
  appointment: AppointmentDecision | null;
};

export type DoctorFeedback = {
  priorityCorrect: boolean | null;
  extractionCorrect: boolean | null;
  missingInformation: string;
  incorrectInformation: string;
  suggestedCorrection: string;
};

export type DashboardResponse = {
  dashboard: PatientDashboardData;
  generatedAt: string;
  source: "demo-data" | "database";
};
