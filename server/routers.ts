import { z } from "zod";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { User } from "../drizzle/schema";
import { COOKIE_NAME } from "@shared/const";
import type { DashboardResponse, DoctorFeedback, PatientDashboardData, AppointmentType, Question, ReviewState } from "@shared/mediscreen";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { notifyPatient } from "./_core/patientNotifications";
import { createPatientVisit, getMediscreenSnapshot, getUserByEmail, getUserByResetToken, getVisitsByUserId, upsertMediscreenSnapshot, upsertUser } from "./db";

const reviewStateSchema = z.enum(["pending", "accepted", "corrected", "rejected"]);

const demoDashboard: PatientDashboardData = {
  patient: {
    id: "patient-anita-rao",
    name: "Anita Rao",
    initials: "AR",
    age: 58,
    sex: "Female",
    patientId: "MRN-2184",
    preferredLanguage: "English",
    lastUpdated: "Today, 09:42",
    queueStatus: "new",
  },
  symptoms: ["Chest discomfort", "Breathlessness on exertion", "Fatigue"],
  currentSymptomText: "Pressure-like discomfort in the center of my chest since yesterday evening. I feel short of breath when walking.",
  intakeComplete: false,
  intakeNote: "",
  questions: [
    { id: "duration", prompt: "When did the discomfort begin?", helper: "Use your best estimate.", options: ["Today", "Yesterday", "More than 2 days ago"] },
    { id: "location", prompt: "Where do you feel the discomfort?", options: ["Center of chest", "Left side", "Right side", "Other"] },
    { id: "severity", prompt: "How strong is it right now?", helper: "0 means no discomfort, 10 means the worst you can imagine.", options: ["1–3 · Mild", "4–6 · Moderate", "7–10 · Severe"] },
    { id: "type", prompt: "How would you describe the feeling?", options: ["Pressure / heaviness", "Sharp", "Burning", "Other"] },
    { id: "radiation", prompt: "Does it move to another area?", options: ["No", "Arm or shoulder", "Back", "Jaw or neck"] },
    { id: "breathlessness", prompt: "Do you feel short of breath?", options: ["No", "Only with activity", "Even while resting"] },
    { id: "sweating", prompt: "Have you had unusual sweating or nausea?", options: ["No", "Sweating", "Nausea", "Both"] },
    { id: "cardiac-history", prompt: "Have you had heart problems before?", options: ["No", "Yes", "I am not sure"] },
  ],
  answers: [
    { questionId: "duration", question: "When did the discomfort begin?", answer: "Yesterday", answeredAt: "09:31" },
    { questionId: "location", question: "Where do you feel the discomfort?", answer: "Center of chest", answeredAt: "09:32" },
    { questionId: "severity", question: "How strong is it right now?", answer: "4–6 · Moderate", answeredAt: "09:33" },
    { questionId: "breathlessness", question: "Do you feel short of breath?", answer: "Only with activity", answeredAt: "09:34" },
  ],
  documents: [
    { id: "doc-1", name: "discharge_summary_2025.pdf", type: "Discharge summary", date: "18 Nov 2025", status: "ready", extractedCount: 12, reviewState: "accepted" },
    { id: "doc-2", name: "lab_report_jun_2026.jpg", type: "Lab report", date: "12 Jun 2026", status: "needs-review", extractedCount: 8, reviewState: "pending" },
    { id: "doc-3", name: "prescription_may_2026.pdf", type: "Prescription", date: "04 May 2026", status: "ready", extractedCount: 6, reviewState: "corrected" },
  ],
  entities: [
    { id: "entity-1", category: "Diagnosis", value: "Type 2 diabetes mellitus", source: "discharge_summary_2025.pdf · p.1", confidence: 0.97, reviewState: "accepted" },
    { id: "entity-2", category: "Medicine", value: "Metformin 500 mg", source: "prescription_may_2026.pdf · p.1", confidence: 0.95, reviewState: "accepted" },
    { id: "entity-3", category: "Dosage", value: "500 mg · twice daily", source: "prescription_may_2026.pdf · p.1", confidence: 0.94, reviewState: "accepted" },
    { id: "entity-4", category: "Lab test", value: "HbA1c", source: "lab_report_jun_2026.jpg · p.1", confidence: 0.91, reviewState: "pending" },
    { id: "entity-5", category: "Lab value", value: "8.2 %", source: "lab_report_jun_2026.jpg · p.1", confidence: 0.89, reviewState: "pending" },
    { id: "entity-6", category: "Date", value: "12 Jun 2026", source: "lab_report_jun_2026.jpg · p.1", confidence: 0.96, reviewState: "pending" },
    { id: "entity-7", category: "Procedure", value: "Coronary angiography · 2023", source: "discharge_summary_2025.pdf · p.2", confidence: 0.84, reviewState: "pending" },
    { id: "entity-8", category: "Symptom", value: "Exertional breathlessness", source: "Patient symptom check-in", confidence: 0.99, reviewState: "accepted" },
  ],
  timeline: [
    { id: "event-1", date: "14 Aug 2023", year: "2023", title: "Coronary angiography", detail: "Procedure recorded in discharge summary", source: "discharge_summary_2025.pdf", tone: "navy" },
    { id: "event-2", date: "18 Nov 2025", year: "2025", title: "Medication review", detail: "Metformin 500 mg continued; allergy list unchanged", source: "discharge_summary_2025.pdf", tone: "teal" },
    { id: "event-3", date: "04 May 2026", year: "2026", title: "Prescription uploaded", detail: "Metformin 500 mg · Atorvastatin 20 mg", source: "prescription_may_2026.pdf", tone: "teal" },
    { id: "event-4", date: "12 Jun 2026", year: "2026", title: "HbA1c result", detail: "8.2% · increasing from prior records", source: "lab_report_jun_2026.jpg", tone: "amber" },
    { id: "event-5", date: "Today", year: "2026", title: "New symptom check-in", detail: "Chest discomfort and exertional breathlessness", source: "Patient symptom check-in", tone: "amber" },
  ],
  trends: [
    { label: "HbA1c", unit: "%", values: [{ year: "2024", value: 6.8 }, { year: "2025", value: 7.4 }, { year: "2026", value: 8.2 }], interpretation: "Increasing over three records · review diabetes control", tone: "up" },
    { label: "Blood pressure", unit: "mmHg", values: [{ year: "2024", value: 138 }, { year: "2025", value: 136 }, { year: "2026", value: 137 }], interpretation: "Stable in available records", tone: "stable" },
  ],
  redFlags: [
    { id: "flag-1", title: "Chest discomfort with breathlessness", detail: "The current symptom check-in contains both signals.", evidence: "Patient symptom check-in · Today", severity: "high", reviewState: "pending" },
    { id: "flag-2", title: "Previous cardiac procedure", detail: "Coronary angiography is present in the medical history.", evidence: "discharge_summary_2025.pdf · 14 Aug 2023", severity: "medium", reviewState: "pending" },
    { id: "flag-3", title: "HbA1c increasing", detail: "8.2% is higher than the 6.8% and 7.4% prior records.", evidence: "lab_report_jun_2026.jpg · 12 Jun 2026", severity: "medium", reviewState: "pending" },
  ],
  priority: {
    level: "high",
    label: "High · immediate clinical review",
    reasons: ["Chest discomfort reported", "Breathlessness on exertion", "Previous cardiac procedure in history", "HbA1c trend needs review"],
    disclaimer: "Preliminary decision support only. A doctor or authorized clinical staff member must verify the evidence and make the final decision.",
  },
  medicationReview: [
    { medicine: "Metformin 500 mg", context: "Current medication · Type 2 diabetes", status: "clear", note: "No allergy match found in the available record." },
    { medicine: "Atorvastatin 20 mg", context: "Current medication · previous prescription", status: "review", note: "Review against current medication list and liver history before consultation." },
  ],
  medications: ["Metformin 500 mg · twice daily", "Atorvastatin 20 mg · nightly"],
  allergies: ["Penicillin · rash"],
  summary: "Anita Rao is a 58-year-old patient with Type 2 diabetes and a history of coronary angiography. She reports new center-chest discomfort since yesterday with breathlessness on activity. Available records show a rising HbA1c trend (6.8% → 7.4% → 8.2%). Potential red flags are highlighted for immediate clinician review; this summary does not diagnose or recommend treatment.",
  summaryReviewState: "pending",
  feedback: null,
  appointment: null,
};

const state: PatientDashboardData = structuredClone(demoDashboard);

const genericQuestions: Question[] = [
  { id: "generic-duration", prompt: "When did this symptom begin?", options: ["Today", "Yesterday", "More than 2 days ago"] },
  { id: "generic-severity", prompt: "How strong is it right now?", options: ["Mild", "Moderate", "Severe"] },
  { id: "generic-change", prompt: "Is it getting better, worse, or staying the same?", options: ["Getting better", "Getting worse", "About the same"] },
  { id: "generic-history", prompt: "Have you had this symptom before?", options: ["No", "Yes", "I am not sure"] },
];

function buildAdaptiveQuestions(symptoms: string[], symptomText: string) {
  const context = [...symptoms, symptomText].join(" ").toLowerCase();
  return context.includes("chest") || context.includes("breath") || context.includes("heart") ? demoDashboard.questions : genericQuestions;
}

function recomputeClinicalSignals() {
  const context = [state.currentSymptomText, ...state.symptoms, ...state.answers.map(answer => answer.answer)].join(" ").toLowerCase();
  const previousFlags = new Map(state.redFlags.map(flag => [flag.id, flag.reviewState]));
  const flags: PatientDashboardData["redFlags"] = [];
  const addFlag = (id: string, title: string, detail: string, evidence: string, severity: "high" | "medium") => flags.push({ id, title, detail, evidence, severity, reviewState: previousFlags.get(id) ?? "pending" });

  if ((context.includes("chest") || context.includes("pressure")) && context.includes("breath")) {
    addFlag("rule-chest-breathlessness", "Chest discomfort with breathlessness", "Two symptoms in the current check-in may need prompt clinical review.", "Rule check · current symptom check-in", "high");
  }
  if (context.includes("weakness") && (context.includes("speech") || context.includes("slur"))) {
    addFlag("rule-neurological", "Sudden weakness with speech difficulty", "This symptom combination is a potential urgent signal.", "Rule check · current symptom check-in", "high");
  }
  const hba1c = state.trends.find(trend => trend.label === "HbA1c");
  if (hba1c && hba1c.values.at(-1)!.value > hba1c.values[0].value) {
    addFlag("rule-lab-trend", "HbA1c increasing", "The latest value is higher than earlier available records.", "Rule check · HbA1c trend", "medium");
  }
  if (state.entities.some(entity => entity.category === "Lab value" && Number.parseFloat(entity.value) >= 9)) {
    addFlag("rule-abnormal-lab", "Very abnormal laboratory value", "A lab value crossed the demo review threshold and needs clinician interpretation.", "Rule check · extracted laboratory values", "high");
  }
  if (state.timeline.some(event => event.title.toLowerCase().includes("angiography") || event.detail.toLowerCase().includes("cardiac"))) {
    addFlag("rule-serious-history", "Relevant serious medical history", "A previous cardiac procedure is present in the available records.", "Rule check · medical timeline", "medium");
  }

  state.redFlags = flags;
  const high = flags.some(flag => flag.severity === "high");
  state.priority = {
    level: high ? "high" : flags.length ? "medium" : "normal",
    label: high ? "High · immediate clinical review" : flags.length ? "Medium · timely clinical review" : "Normal · routine consultation",
    reasons: flags.length ? flags.map(flag => flag.title) : ["No rule-based red flags were found in the available information"],
    disclaimer: "Preliminary decision support only. A doctor or authorized clinical staff member must verify the evidence and make the final decision.",
  };

  const allergyContext = state.allergies.join(" ").toLowerCase();
  state.medicationReview = state.medications.map(medicine => {
    const normalized = medicine.toLowerCase();
    const allergyMatch = allergyContext.split(/[·,]/).some(token => token.trim().length > 2 && normalized.includes(token.trim()));
    const review = allergyMatch || normalized.includes("atorvastatin");
    return {
      medicine: medicine.split(" · ")[0],
      context: medicine.includes(" · ") ? medicine.split(" · ").slice(1).join(" · ") : "Current medication",
      status: review ? "review" : "clear",
      note: allergyMatch ? "Possible allergy match — clinician review required." : review ? "Review against current medication list and relevant history." : "No allergy match found in the available record.",
    };
  });
}

async function getDashboardState(): Promise<{ dashboard: PatientDashboardData; source: DashboardResponse["source"] }> {
  const persisted = await getMediscreenSnapshot();
  if (!persisted) {
    state.questions = buildAdaptiveQuestions(state.symptoms, state.currentSymptomText);
    recomputeClinicalSignals();
    return { dashboard: state, source: "demo-data" };
  }
  try {
    const dashboard = JSON.parse(persisted.payload) as PatientDashboardData;
    Object.assign(state, dashboard);
    state.intakeComplete ??= false;
    state.intakeNote ??= "";
    state.summaryReviewState ??= "pending";
    state.feedback ??= null;
    state.questions = buildAdaptiveQuestions(state.symptoms, state.currentSymptomText);
    recomputeClinicalSignals();
    return { dashboard: state, source: "database" };
  } catch {
    state.questions = buildAdaptiveQuestions(state.symptoms, state.currentSymptomText);
    recomputeClinicalSignals();
    return { dashboard: state, source: "demo-data" };
  }
}

async function persistDashboard() {
  recomputeClinicalSignals();
  const saved = await upsertMediscreenSnapshot(JSON.stringify(state));
  return saved ? "database" : "demo-data";
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
};
const verifyPassword = (password: string, stored: string) => {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, "hex"));
};
const requireUser = (user: User | null) => {
  if (!user) throw new Error("Authentication required");
  return user;
};
const publicUser = (user: User | null) => user && ({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, createdAt: user.createdAt });

const reviewStateUpdate = (section: string, reviewState: ReviewState) => {
  if (section === "entities") state.entities = state.entities.map(entity => ({ ...entity, reviewState }));
  if (section === "redFlags") state.redFlags = state.redFlags.map(flag => ({ ...flag, reviewState }));
  if (section === "documents") state.documents = state.documents.map(document => ({ ...document, reviewState }));
  if (section === "summary") state.summaryReviewState = reviewState;
};

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => publicUser(opts.ctx.user)),
    signup: publicProcedure.input(z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().min(7), password: z.string().min(8) })).mutation(async ({ input, ctx }) => {
      const email = normalizeEmail(input.email);
      if (await getUserByEmail(email)) throw new Error("An account with this email already exists");
      const openId = `local:${createHash("sha256").update(email).digest("hex").slice(0, 48)}`;
      await upsertUser({ openId, name: input.name.trim(), email, phone: input.phone.trim(), passwordHash: hashPassword(input.password), loginMethod: "password" });
      const token = await (await import("./_core/sdk")).sdk.createSessionToken(openId, { name: input.name.trim() });
      ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: 31_536_000_000 });
      return { success: true } as const;
    }),
    login: publicProcedure.input(z.object({ email: z.string().email(), password: z.string().min(1) })).mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(normalizeEmail(input.email));
      if (!user?.passwordHash || !verifyPassword(input.password, user.passwordHash)) throw new Error("Invalid email or password");
      const token = await (await import("./_core/sdk")).sdk.createSessionToken(user.openId, { name: user.name ?? "" });
      ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: 31_536_000_000 });
      return { success: true } as const;
    }),
    forgotPassword: publicProcedure.input(z.object({ email: z.string().email() })).mutation(async ({ input }) => {
      const user = await getUserByEmail(normalizeEmail(input.email));
      if (user) {
        const token = randomBytes(32).toString("hex");
        await upsertUser({ openId: user.openId, resetToken: token, resetTokenExpiresAt: new Date(Date.now() + 30 * 60 * 1000) });
        const resetUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
        await notifyPatient({ email: user.email, phone: user.phone, subject: "Reset your MediScreen password", message: `Use this link within 30 minutes to reset your password: ${resetUrl}` });
      }
      return { success: true, message: "If an account exists for that email, recovery instructions have been sent." } as const;
    }),
    resetPassword: publicProcedure.input(z.object({ token: z.string().min(20), password: z.string().min(8) })).mutation(async ({ input }) => {
      const user = await getUserByResetToken(input.token);
      if (!user) throw new Error("This recovery link is invalid or expired");
      await upsertUser({ openId: user.openId, passwordHash: hashPassword(input.password), resetToken: null, resetTokenExpiresAt: null });
      return { success: true } as const;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  mediscreen: router({
    profile: publicProcedure.query(({ ctx }) => publicUser(requireUser(ctx.user))),
    updateProfile: publicProcedure.input(z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().min(7) })).mutation(async ({ input, ctx }) => {
      const user = requireUser(ctx.user);
      await upsertUser({ openId: user.openId, name: input.name.trim(), email: normalizeEmail(input.email), phone: input.phone.trim() });
      return { success: true } as const;
    }),
    history: publicProcedure.query(async ({ ctx }) => getVisitsByUserId(requireUser(ctx.user).id)),
    dashboard: publicProcedure.query(async (): Promise<DashboardResponse> => {
      const loaded = await getDashboardState();
      return { dashboard: loaded.dashboard, generatedAt: new Date().toISOString(), source: loaded.source };
    }),
    adaptiveQuestions: publicProcedure.input(z.object({ symptoms: z.array(z.string()), symptomText: z.string() })).query(({ input }) => ({ questions: buildAdaptiveQuestions(input.symptoms, input.symptomText) })),
    saveIntake: publicProcedure.input(z.object({ name: z.string().min(2), age: z.number().int().min(0).max(120), sex: z.string(), preferredLanguage: z.string(), intakeNote: z.string() })).mutation(async ({ input }) => {
      await getDashboardState();
      state.patient = { ...state.patient, name: input.name, initials: input.name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase(), age: input.age, sex: input.sex, preferredLanguage: input.preferredLanguage };
      state.intakeComplete = true;
      state.intakeNote = input.intakeNote;
      await persistDashboard();
      return { success: true, patient: state.patient };
    }),
    saveSymptoms: publicProcedure.input(z.object({ symptomText: z.string().min(3) })).mutation(async ({ input }) => {
      await getDashboardState();
      state.currentSymptomText = input.symptomText;
      const context = input.symptomText.toLowerCase();
      state.symptoms = [
        ...(context.includes("chest") || context.includes("pressure") ? ["Chest discomfort"] : []),
        ...(context.includes("breath") ? ["Breathlessness on exertion"] : []),
        ...(context.includes("fatigue") || context.includes("tired") ? ["Fatigue"] : []),
      ];
      if (state.symptoms.length === 0) state.symptoms = ["New symptom reported"];
      state.questions = buildAdaptiveQuestions(state.symptoms, state.currentSymptomText);
      await persistDashboard();
      return { success: true, symptoms: state.symptoms, questionCount: state.questions.length };
    }),
    answerQuestion: publicProcedure.input(z.object({ questionId: z.string(), answer: z.string() })).mutation(async ({ input }) => {
      await getDashboardState();
      const question = state.questions.find(item => item.id === input.questionId);
      if (!question) throw new Error("Question not found");
      state.answers = [...state.answers.filter(answer => answer.questionId !== input.questionId), {
        questionId: question.id,
        question: question.prompt,
        answer: input.answer,
        answeredAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }];
      await persistDashboard();
      return { success: true, answerCount: state.answers.length };
    }),
    uploadDocument: publicProcedure.input(z.object({ name: z.string().min(1), type: z.enum(["Prescription", "Lab report", "Discharge summary", "Medical document"]) })).mutation(async ({ input }) => {
      await getDashboardState();
      const document = { id: `doc-${Date.now()}`, name: input.name, type: input.type, date: "Today", status: "needs-review" as const, extractedCount: 0, reviewState: "pending" as const };
      state.documents = [document, ...state.documents];
      await persistDashboard();
      return { success: true, document, processing: "demo-extraction" as const };
    }),
    reviewSection: publicProcedure.input(z.object({ section: z.string(), reviewState: reviewStateSchema })).mutation(async ({ input }) => {
      await getDashboardState();
      reviewStateUpdate(input.section, input.reviewState);
      await persistDashboard();
      return { success: true, section: input.section, reviewState: input.reviewState };
    }),
    submitFeedback: publicProcedure.input(z.object({ feedback: z.object({
      priorityCorrect: z.boolean().nullable(),
      extractionCorrect: z.boolean().nullable(),
      missingInformation: z.string(),
      incorrectInformation: z.string(),
      suggestedCorrection: z.string(),
    }) })).mutation(async ({ input }) => {
      await getDashboardState();
      state.feedback = input.feedback as DoctorFeedback;
      await persistDashboard();
      return { success: true, feedback: state.feedback, savedAt: new Date().toISOString() };
    }),
    saveAppointment: publicProcedure.input(z.object({ type: z.enum(["immediate", "normal", "follow-up"]), followUpDate: z.string().optional(), note: z.string() })).mutation(async ({ input, ctx }) => {
      await getDashboardState();
      state.appointment = { type: input.type as AppointmentType, followUpDate: input.followUpDate, note: input.note, savedAt: new Date().toISOString() };
      if (ctx.user) {
        await createPatientVisit({ userId: ctx.user.id, doctorName: "Dr. Meera Shah", reason: state.symptoms.join(" · ") || "Pre-consultation", status: input.type === "follow-up" ? "scheduled" : "completed", doctorSeen: "no", notes: input.note });
        await notifyPatient({ email: ctx.user.email, phone: ctx.user.phone, subject: "MediScreen appointment update", message: `Your appointment has been recorded as ${input.type}. ${input.note}` });
      }
      await persistDashboard();
      return { success: true, appointment: state.appointment };
    }),
    saveCorrection: publicProcedure.input(z.object({ entityId: z.string(), value: z.string() })).mutation(async ({ input }) => {
      await getDashboardState();
      state.entities = state.entities.map(entity => entity.id === input.entityId ? { ...entity, value: input.value, reviewState: "corrected" } : entity);
      await persistDashboard();
      return { success: true, entityId: input.entityId, value: input.value };
    }),
  }),
});

export type AppRouter = typeof appRouter;
