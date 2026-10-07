import { trpc } from "@/lib/trpc";
import type { AppointmentType, PatientDashboardData, Priority, Question } from "@shared/mediscreen";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  FileCheck2,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LockKeyhole,
  Languages,
  Menu,
  MessageSquareText,
  Mic,
  MoreHorizontal,
  Pencil,
  Pill,
  Plus,
  Search,
  ScanLine,
  SlidersHorizontal,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  UploadCloud,
  UserRound,
  UsersRound,
  X,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Line, LineChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";

const teal = "#138f8b";

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand-lockup" aria-label="MediScreen AI home">
      <img src="/mediscreen-mark.svg" alt="" className="brand-mark" />
      {!compact && <span><strong>MediScreen</strong><small>AI pre-consultation</small></span>}
    </Link>
  );
}

function AppShell({ children, role, active }: { children: React.ReactNode; role: "patient" | "doctor"; active: string }) {
  const nav = role === "doctor" ? [
    { href: "/doctor", label: "Overview", icon: LayoutDashboard },
    { href: "/doctor/patients/anita", label: "Patient queue", icon: UsersRound },
    { href: "/doctor/feedback", label: "Feedback", icon: MessageSquareText },
  ] : [
    { href: "/patient", label: "My check-in", icon: ClipboardCheck },
    { href: "/patient/symptoms", label: "Symptoms", icon: HeartPulse },
    { href: "/patient/documents", label: "My documents", icon: FileText },
    { href: "/patient/history", label: "Visit history", icon: Clock3 },
    { href: "/patient/profile", label: "My profile", icon: UserRound },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo />
        <div className="workspace-label">{role === "doctor" ? "CLINICIAN WORKSPACE" : "PATIENT WORKSPACE"}</div>
        <nav className="side-nav" aria-label="Primary navigation">
          {nav.map(item => {
            const Icon = item.icon;
            const isActive = active === item.href || (item.href === "/doctor" && active.startsWith("/doctor/patients"));
            return <Link key={item.href} href={item.href} className={`side-nav-item ${isActive ? "active" : ""}`}>
              <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} />
              <span>{item.label}</span>
              {item.label === "Patient queue" && role === "doctor" && <span className="nav-count">12</span>}
            </Link>;
          })}
        </nav>
        <div className="sidebar-spacer" />
        <div className="safety-mini">
          <ShieldAlert size={18} />
          <div><strong>Clinical review first</strong><span>AI organizes information. A clinician makes the final decision.</span></div>
        </div>
        {role === "patient" ? <Link href="/patient/profile" className="sidebar-user">
          <div className="avatar avatar-navy">{role === "doctor" ? "DR" : "AR"}</div>
          <div><strong>{role === "doctor" ? "Dr. Meera Shah" : "Anita Rao"}</strong><span>{role === "doctor" ? "General medicine" : "Patient ID MRN-2184"}</span></div>
          <MoreHorizontal size={18} className="muted-icon" />
        </Link> : <div className="sidebar-user">
          <div className="avatar avatar-navy">DR</div><div><strong>Dr. Meera Shah</strong><span>General medicine</span></div><MoreHorizontal size={18} className="muted-icon" />
        </div>}
      </aside>
      <div className="mobile-topbar"><Logo compact /><button className="icon-button" aria-label="Open menu"><Menu size={20} /></button></div>
      <main className="main-canvas">{children}</main>
    </div>
  );
}

function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "teal" | "amber" | "red" | "navy" }) {
  return <span className={`status-pill ${tone}`}><span className="status-dot" />{children}</span>;
}

function PriorityBadge({ level, label }: { level: Priority; label?: string }) {
  const text = label ?? (level === "high" ? "High" : level === "medium" ? "Medium" : "Normal");
  return <span className={`priority-badge ${level}`}><span className="priority-dot" />{text}</span>;
}

function SectionTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="section-title-row">
    <div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2>{description && <p>{description}</p>}</div>
    {action}
  </div>;
}

function SafetyNotice({ compact = false }: { compact?: boolean }) {
  return <div className={`safety-notice ${compact ? "compact" : ""}`}>
    <div className="notice-icon"><ShieldAlert size={19} /></div>
    <div><strong>Preliminary decision support</strong><p>AI helps organize your information and highlight possible risks. It does not diagnose, prescribe, or replace a doctor. A clinician must verify everything before a final decision.</p></div>
  </div>;
}

function Landing() {
  return <div className="landing-page">
    <header className="landing-header"><Logo /><div className="landing-header-actions"><span className="secure-label"><LockKeyhole size={14} /> Secure by design</span><button className="text-button">English <ChevronDown size={15} /></button></div></header>
    <section className="landing-hero">
      <div className="hero-copy"><div className="eyebrow">PRE-CONSULTATION, MADE CLEAR</div><h1>Bring your story.<br /><em>Leave with clarity.</em></h1><p>MediScreen AI helps patients prepare for a consultation and helps doctors see the important context sooner — with human judgment at the center.</p><div className="hero-proof"><div className="proof-item"><BadgeCheck size={16} /><span>Built for high-volume OPD care</span></div><div className="proof-item"><LockKeyhole size={16} /><span>Your information stays private</span></div></div></div>
      <div className="role-card-wrap"><div className="role-card-intro"><div><div className="eyebrow">GET STARTED</div><h2>Who are you today?</h2></div><Sparkles size={22} className="sparkle" /></div><div className="role-choice-grid"><Link href="/patient" className="role-choice patient-choice"><div className="role-choice-icon"><UserRound size={23} /></div><div><strong>I’m a patient</strong><span>Share symptoms and medical records before your visit.</span></div><ArrowRight size={19} /></Link><Link href="/doctor" className="role-choice doctor-choice"><div className="role-choice-icon"><Stethoscope size={23} /></div><div><strong>I’m a doctor or staff member</strong><span>Review a prepared patient summary and make the final call.</span></div><ArrowRight size={19} /></Link></div><div className="role-card-footer"><Clock3 size={15} /> Takes about 4 minutes <span>•</span> <Languages size={15} /> Multiple languages</div></div>
    </section>
    <section className="landing-bottom"><div className="landing-stat"><span className="stat-number">01</span><div><strong>Tell us what’s happening</strong><span>Simple questions, in your language.</span></div></div><div className="landing-stat"><span className="stat-number">02</span><div><strong>Bring your records</strong><span>Upload reports and prescriptions once.</span></div></div><div className="landing-stat"><span className="stat-number">03</span><div><strong>See the full picture</strong><span>Your doctor reviews, corrects, and decides.</span></div></div></section>
    <div className="landing-disclaimer"><ShieldAlert size={15} /> If you have a medical emergency, call your local emergency service or go to the nearest emergency department. Do not wait for this tool.</div>
  </div>;
}

function PatientHeader({ active }: { active: string }) {
  const [language, setLanguage] = useState("English");
  const [languageOpen, setLanguageOpen] = useState(false);
  const title = active === "/patient/documents" ? "My documents" : active === "/patient/symptoms" ? "Symptom check-in" : active === "/patient/history" ? "Visit history" : active === "/patient/profile" ? "My profile" : "Your pre-visit check-in";
  const subtitle = active === "/patient/documents" ? "Keep your records together for your care team." : active === "/patient/symptoms" ? "A few focused questions help your care team prepare." : active === "/patient/history" ? "See which visits have been reviewed by a doctor." : active === "/patient/profile" ? "Manage the details connected to your care record." : "A few details now can give your doctor more time with you.";
  return <div className="page-header"><div><div className="breadcrumb"><Link href="/patient">My check-in</Link><ChevronRight size={14} />{title}</div><h1>{title}</h1><p>{subtitle}</p></div><div className="header-actions"><button className="icon-button has-notification" aria-label="Notifications"><Bell size={18} /><span /></button><Link href="/login" className="outline-button"><LockKeyhole size={15} /> Sign in / register</Link><div className="language-picker"><button className="outline-button" onClick={() => setLanguageOpen(open => !open)} aria-expanded={languageOpen}><Languages size={16} /> {language} <ChevronDown size={15} /></button>{languageOpen && <div className="language-menu">{["English", "Hindi", "Marathi"].map(option => <button key={option} onClick={() => { setLanguage(option); setLanguageOpen(false); toast.success(`Language changed to ${option}`); }}>{option}</button>)}</div>}</div></div></div>;
}

function PatientWorkspace({ dashboard, active }: { dashboard: PatientDashboardData; active: string }) {
  const utils = trpc.useUtils();
  const answerMutation = trpc.mediscreen.answerQuestion.useMutation({ onSuccess: () => { utils.mediscreen.dashboard.invalidate(); toast.success("Answer saved"); } });
  const symptomMutation = trpc.mediscreen.saveSymptoms.useMutation({ onSuccess: () => { utils.mediscreen.dashboard.invalidate(); toast.success("Symptoms saved"); } });
	  const [currentAnswer, setCurrentAnswer] = useState("");
	  const [symptomText, setSymptomText] = useState(dashboard.currentSymptomText);
	  const nextQuestion = dashboard.questions.find(question => !dashboard.answers.some(answer => answer.questionId === question.id)) ?? dashboard.questions[dashboard.questions.length - 1];
	  const completed = dashboard.answers.filter(answer => dashboard.questions.some(question => question.id === answer.questionId)).length;
	  const checkInStep = Math.min(3, completed + 1);
	  const progressPercent = Math.min(100, Math.round((checkInStep / 3) * 100));

  const handleAnswer = () => {
    if (!currentAnswer || answerMutation.isPending) return;
    answerMutation.mutate({ questionId: nextQuestion.id, answer: currentAnswer });
    setCurrentAnswer("");
  };

  return <AppShell role="patient" active={active}>
    <PatientHeader active={active} />
    {active === "/patient/intake" ? <PatientIntake dashboard={dashboard} /> : active === "/patient/documents" ? <PatientDocuments dashboard={dashboard} /> : active === "/patient/symptoms" ? <PatientSymptoms dashboard={dashboard} nextQuestion={nextQuestion} currentAnswer={currentAnswer} setCurrentAnswer={setCurrentAnswer} handleAnswer={handleAnswer} completed={completed} /> : <>
	      <div className="welcome-banner"><div><span className="eyebrow">GOOD MORNING, ANITA</span><h2>Let’s get you ready for your visit.</h2><p>Complete the steps below at your own pace. You can save and come back later.</p></div><div className="welcome-illustration"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><HeartPulse size={38} /></div></div>
	      <div className="patient-progress"><div className="progress-heading"><span><strong>Check-in progress</strong> <span className="muted-inline">{checkInStep} of 3 steps</span></span><span className="progress-percent">{progressPercent}%</span></div><div className="progress-track"><span style={{ width: `${progressPercent}%` }} /></div><div className="progress-steps"><span className="done"><Check size={14} /> Basic details</span><span className={completed > 0 ? "done" : "active-step"}>{completed > 0 ? <Check size={14} /> : <span>2</span>} Symptoms</span><span className={completed >= dashboard.questions.length ? "done" : "muted-step"}>{completed >= dashboard.questions.length ? <Check size={14} /> : <span>3</span>} Records</span></div></div>
      <div className="patient-grid"><div className="stack-column"><section className="card symptom-card"><div className="card-topline"><div><div className="eyebrow">STEP 2 · SYMPTOMS</div><h2>What brings you in today?</h2><p className="card-subtitle">Tell us in your own words. You don’t need medical terms.</p></div><div className="card-icon teal-icon"><HeartPulse size={20} /></div></div><textarea value={symptomText} onChange={event => setSymptomText(event.target.value)} className="symptom-textarea" aria-label="Describe your symptoms" /><div className="input-actions"><button className="voice-button"><Mic size={18} /><span>Speak instead</span><small>Coming soon</small></button><span className="character-count">{symptomText.length}/500</span></div><div className="symptom-card-footer"><span><LockKeyhole size={14} /> Only shared with your care team</span><Link href="/patient/symptoms" onClick={() => symptomMutation.mutate({ symptomText })} className="primary-button">Continue <ArrowRight size={16} /></Link></div></section><section className="card records-card"><div className="card-topline"><div><div className="eyebrow">STEP 3 · RECORDS</div><h2>Bring your previous records</h2><p className="card-subtitle">Prescriptions, lab reports, or discharge summaries.</p></div><div className="card-icon amber-icon"><FileText size={20} /></div></div><div className="upload-dropzone"><UploadCloud size={23} /><strong>Drop files here or browse</strong><span>PDF, JPG, PNG · Up to 10 MB each</span><Link href="/patient/documents" className="secondary-button"><Plus size={16} /> Upload documents</Link></div><div className="document-mini-list">{dashboard.documents.slice(0, 2).map(doc => <div className="document-mini" key={doc.id}><div className="file-type-icon"><FileText size={17} /></div><div><strong>{doc.name}</strong><span>{doc.type} · {doc.date}</span></div><StatusPill tone={doc.status === "needs-review" ? "amber" : "teal"}>{doc.status === "needs-review" ? "Needs review" : "Ready"}</StatusPill></div>)}</div><Link href="/patient/documents" className="text-link">View all documents <ArrowRight size={15} /></Link></section></div><aside className="stack-column"><section className="card language-card"><div className="language-icon"><Languages size={19} /></div><div><strong>Prefer another language?</strong><p>Questions can be shown in your preferred language.</p></div><Link href="/patient/intake" className="compact-select">Set up <ChevronDown size={14} /></Link></section><SafetyNotice compact /><section className="card privacy-card"><div className="privacy-header"><LockKeyhole size={18} /><strong>Your information, your choice</strong></div><p>You can review or correct any information before it is shared with the doctor.</p><div className="privacy-points"><span><CheckCircle2 size={15} /> You stay in control</span><span><CheckCircle2 size={15} /> Doctor verifies before using</span></div></section></aside></div>
    </>}
  </AppShell>;
}

function PatientIntake({ dashboard }: { dashboard: PatientDashboardData }) {
  const [, navigate] = useLocation();
  const intakeMutation = trpc.mediscreen.saveIntake.useMutation({ onSuccess: () => { toast.success("Your details are saved"); navigate("/patient"); } });
  const [name, setName] = useState(dashboard.patient.name);
  const [age, setAge] = useState(String(dashboard.patient.age));
  const [sex, setSex] = useState(dashboard.patient.sex);
  const [language, setLanguage] = useState(dashboard.patient.preferredLanguage);
  const [note, setNote] = useState(dashboard.intakeNote);
  return <div className="intake-layout"><section className="card intake-card"><div className="eyebrow">STEP 1 · BASIC DETAILS</div><h2>Tell us a little about you</h2><p className="card-subtitle">These details help your care team identify the right record. You can correct them at any time.</p><div className="form-grid"><label className="form-field">Full name<input className="form-input" value={name} onChange={event => setName(event.target.value)} placeholder="Your full name" /></label><label className="form-field">Age<input className="form-input" type="number" min="0" max="120" value={age} onChange={event => setAge(event.target.value)} /></label><label className="form-field">Sex<select className="form-input" value={sex} onChange={event => setSex(event.target.value)}><option>Female</option><option>Male</option><option>Other</option><option>Prefer not to say</option></select></label><label className="form-field">Preferred language<select className="form-input" value={language} onChange={event => setLanguage(event.target.value)}><option>English</option><option>Hindi</option><option>Marathi</option><option>Bengali</option><option>Tamil</option></select></label></div><label className="form-field full-field">Anything else your care team should know? <textarea className="form-input form-textarea" value={note} onChange={event => setNote(event.target.value)} placeholder="Optional context, in your own words" /></label><div className="intake-footer"><span><LockKeyhole size={14} /> Your details are only shared with your care team</span><button className="primary-button" disabled={!name.trim() || intakeMutation.isPending} onClick={() => intakeMutation.mutate({ name: name.trim(), age: Number(age) || 0, sex, preferredLanguage: language, intakeNote: note })}>{intakeMutation.isPending ? "Saving…" : "Save and continue"}<ArrowRight size={16} /></button></div></section><aside className="intake-side"><div className="card intake-side-card"><div className="language-icon"><Languages size={19} /></div><h3>Choose the language that feels easiest</h3><p>Questions and guidance can be shown in your preferred language. Medical terms can still be reviewed with your doctor.</p><div className="language-options">{["English", "Hindi", "Marathi"].map(item => <button key={item} className={language === item ? "language-option selected" : "language-option"} onClick={() => setLanguage(item)}>{item}{language === item && <CheckCircle2 size={15} />}</button>)}</div></div><SafetyNotice compact /></aside></div>;
}

function PatientSymptoms({ dashboard, nextQuestion, currentAnswer, setCurrentAnswer, handleAnswer, completed }: { dashboard: PatientDashboardData; nextQuestion: Question; currentAnswer: string; setCurrentAnswer: (value: string) => void; handleAnswer: () => void; completed: number }) {
  return <div className="symptoms-layout"><div className="symptom-main"><section className="card question-card"><div className="question-progress"><span>Question {Math.min(completed + 1, dashboard.questions.length)} of {dashboard.questions.length}</span><span>{Math.round((completed / dashboard.questions.length) * 100)}% complete</span></div><div className="question-progress-track"><span style={{ width: `${Math.max(8, (completed / dashboard.questions.length) * 100)}%` }} /></div><div className="question-kicker"><HeartPulse size={17} /> Based on your symptoms</div><h2>{nextQuestion.prompt}</h2>{nextQuestion.helper && <p>{nextQuestion.helper}</p>}<div className="option-grid">{(nextQuestion.options ?? []).map(option => <button key={option} className={`option-button ${currentAnswer === option ? "selected" : ""}`} onClick={() => setCurrentAnswer(option)}><span>{option}</span>{currentAnswer === option ? <CheckCircle2 size={19} /> : <span className="option-radio" />}</button>)}</div><div className="question-footer"><Link href="/patient" className="text-button">Save and exit</Link><button className="primary-button" disabled={!currentAnswer} onClick={handleAnswer}>{completed >= dashboard.questions.length - 1 ? "Finish questions" : "Next question"}<ArrowRight size={16} /></button></div></section><section className="card answer-review-card"><SectionTitle eyebrow="YOUR ANSWERS" title="Review what you’ve shared" description="You can correct an answer anytime." /><div className="answer-list">{dashboard.answers.map(answer => <div className="answer-row" key={answer.questionId}><div className="answer-check"><Check size={14} /></div><div><strong>{answer.question}</strong><span>{answer.answer}</span></div><button className="icon-button subtle" aria-label={`Edit ${answer.question}`}><Pencil size={15} /></button></div>)}</div>{dashboard.answers.length === 0 && <div className="empty-state"><CircleHelp size={18} /> Your answers will appear here as you go.</div>}</section></div><aside className="symptom-aside"><div className="card symptom-context"><div className="eyebrow">WHAT WE HEARD</div><h3>Chest discomfort</h3><p>“{dashboard.currentSymptomText}”</p><div className="tag-row">{dashboard.symptoms.map(item => <span className="soft-tag" key={item}>{item}</span>)}</div><Link href="/patient" className="text-link">Edit symptom description <Pencil size={14} /></Link></div><SafetyNotice compact /><div className="card help-card"><div className="help-icon"><CircleHelp size={19} /></div><div><strong>Need help answering?</strong><p>Choose the closest option. Your doctor can ask follow-up questions during your visit.</p></div></div></aside></div>;
}

function PatientDocuments({ dashboard }: { dashboard: PatientDashboardData }) {
  const [showUpload, setShowUpload] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();
  const uploadMutation = trpc.mediscreen.uploadDocument.useMutation({ onSuccess: () => { setShowUpload(false); utils.mediscreen.dashboard.invalidate(); toast.success("Document added to your review queue"); } });
  const reviewMutation = trpc.mediscreen.reviewSection.useMutation({ onSuccess: () => { utils.mediscreen.dashboard.invalidate(); toast.success("Extraction details marked for clinician review"); } });
  const handleFile = (file?: File) => {
    if (!file) return;
    const lower = file.name.toLowerCase();
    const type = lower.includes("prescription") ? "Prescription" : lower.includes("lab") || lower.includes("report") ? "Lab report" : lower.includes("discharge") ? "Discharge summary" : "Medical document";
    uploadMutation.mutate({ name: file.name, type });
  };
  return <div className="documents-layout"><section className="card documents-main"><div className="documents-toolbar"><div><div className="eyebrow">YOUR RECORDS</div><h2>Medical documents</h2><p className="card-subtitle">Files you choose to share with your care team.</p></div><button className="primary-button" onClick={() => setShowUpload(true)}><UploadCloud size={16} /> Upload document</button></div><div className="document-status-banner"><div className="status-banner-icon"><ScanLine size={19} /></div><div><strong>We’ll organize the important details</strong><span>OCR and information extraction will identify medicines, test results, dates, and more for your review.</span></div><ChevronRight size={18} /></div><div className="document-table">{dashboard.documents.map(doc => <div className="document-row" key={doc.id}><div className="file-type-icon large"><FileText size={18} /></div><div className="document-name"><strong>{doc.name}</strong><span>{doc.type} · Uploaded {doc.date}</span></div><div className="document-extracted"><strong>{doc.extractedCount}</strong><span>items found</span></div><StatusPill tone={doc.status === "needs-review" ? "amber" : "teal"}>{doc.status === "needs-review" ? "Needs your review" : "Ready"}</StatusPill><button className="icon-button subtle" aria-label={`More options for ${doc.name}`}><MoreHorizontal size={18} /></button></div>)}</div><div className="document-footnote"><LockKeyhole size={14} /> Files are stored securely and only shared with the care team you choose.</div></section><section className="card extraction-card"><SectionTitle eyebrow="EXTRACTION REVIEW" title="Details found in your records" description="Check that these details look right." action={<StatusPill tone="amber">{dashboard.entities.filter(entity => entity.reviewState === "pending").length} need review</StatusPill>} /><div className="entity-list">{dashboard.entities.map(entity => <EntityRow entity={entity} key={entity.id} />)}</div><button className="secondary-button wide" onClick={() => reviewMutation.mutate({ section: "entities", reviewState: "accepted" })} disabled={reviewMutation.isPending}><CheckCircle2 size={16} /> Mark details as reviewed</button></section>{showUpload && <div className="modal-backdrop" role="presentation"><div className="upload-modal" role="dialog" aria-modal="true" aria-labelledby="upload-title"><button className="close-button" onClick={() => setShowUpload(false)} aria-label="Close"><X size={19} /></button><div className="modal-icon"><UploadCloud size={24} /></div><div className="eyebrow">ADD A RECORD</div><h2 id="upload-title">Upload a medical document</h2><p>Choose a prescription, report, or discharge summary. The demo extraction will appear as a reviewable record.</p><input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={event => handleFile(event.target.files?.[0])} /><button className="upload-modal-drop" onClick={() => inputRef.current?.click()}><FileText size={24} /><strong>Browse from this device</strong><span>PDF, JPG, PNG · Up to 10 MB</span></button><button className="primary-button wide" onClick={() => inputRef.current?.click()} disabled={uploadMutation.isPending}><UploadCloud size={16} /> {uploadMutation.isPending ? "Processing…" : "Choose document"}</button></div></div>}</div>;
}

function EntityRow({ entity }: { entity: PatientDashboardData["entities"][number] }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(entity.value);
  const utils = trpc.useUtils();
  const correction = trpc.mediscreen.saveCorrection.useMutation({ onSuccess: () => { setEditing(false); utils.mediscreen.dashboard.invalidate(); toast.success("Correction saved"); } });
  return <div className="entity-row"><div className="entity-category">{entity.category}</div><div className="entity-content">{editing ? <input autoFocus value={value} onChange={event => setValue(event.target.value)} className="inline-input" /> : <strong>{entity.value}</strong>}<span>{entity.source}</span></div><div className="entity-confidence"><span>{Math.round(entity.confidence * 100)}%</span><small>confidence</small></div>{entity.reviewState === "pending" && !editing && <button className="text-button edit-button" onClick={() => setEditing(true)}><Pencil size={14} /> Edit</button>}{editing && <div className="edit-actions"><button className="icon-button subtle" onClick={() => setEditing(false)} aria-label="Cancel edit"><X size={15} /></button><button className="icon-button success" onClick={() => correction.mutate({ entityId: entity.id, value })} aria-label="Save correction"><Check size={15} /></button></div>}{entity.reviewState !== "pending" && !editing && <StatusPill tone="teal">{entity.reviewState === "corrected" ? "Corrected" : "Accepted"}</StatusPill>}</div>;
}

function DoctorWorkspace({ dashboard, active }: { dashboard: PatientDashboardData; active: string }) {
  const [queueFilter, setQueueFilter] = useState("All patients");
  const [selectedTab, setSelectedTab] = useState<"summary" | "timeline" | "feedback">(active === "/doctor/feedback" ? "feedback" : "summary");
  const [appointmentType, setAppointmentType] = useState<AppointmentType>("immediate");
  const [followUpDate, setFollowUpDate] = useState("");
  const [appointmentNote, setAppointmentNote] = useState("");
  const [feedback, setFeedback] = useState({ priorityCorrect: null as boolean | null, extractionCorrect: null as boolean | null, missingInformation: "", incorrectInformation: "", suggestedCorrection: "" });
  const utils = trpc.useUtils();
  const reviewMutation = trpc.mediscreen.reviewSection.useMutation({ onSuccess: () => { utils.mediscreen.dashboard.invalidate(); toast.success("Review status saved"); } });
  const feedbackMutation = trpc.mediscreen.submitFeedback.useMutation({ onSuccess: () => toast.success("Feedback saved for model evaluation") });
  const appointmentMutation = trpc.mediscreen.saveAppointment.useMutation({ onSuccess: () => { utils.mediscreen.dashboard.invalidate(); toast.success("Appointment decision saved"); } });
  const queue = [
    { name: "Anita Rao", id: "MRN-2184", detail: "Chest discomfort · Breathlessness", time: "09:42", priority: "high" as Priority, initials: "AR" },
    { name: "Ramesh Kumar", id: "MRN-2071", detail: "Fever · 2 days", time: "09:35", priority: "medium" as Priority, initials: "RK" },
    { name: "Nisha Patel", id: "MRN-1988", detail: "Medication review", time: "09:18", priority: "normal" as Priority, initials: "NP" },
  ];
  const filteredQueue = queueFilter === "All patients" ? queue : queue.filter(item => item.priority === queueFilter.toLowerCase());
  const saveAppointment = () => appointmentMutation.mutate({ type: appointmentType, followUpDate: appointmentType === "follow-up" ? followUpDate : undefined, note: appointmentNote || "Decision recorded after clinician review." });
  const saveFeedback = () => feedbackMutation.mutate({ feedback });

  return <AppShell role="doctor" active={active}><div className="doctor-page-header"><div><div className="eyebrow">TUESDAY · 29 SEPTEMBER 2026</div><h1>Good morning, Dr. Shah</h1><p>Here’s the context your patients shared before consultation.</p></div><div className="header-actions"><button className="icon-button has-notification" aria-label="Notifications"><Bell size={18} /><span /></button><button className="outline-button"><CalendarDays size={16} /> Today <ChevronDown size={15} /></button></div></div><div className="doctor-overview-grid"><div className="queue-column"><div className="queue-heading"><div><div className="eyebrow">TODAY’S QUEUE</div><h2>Patients to review <span className="queue-total">12</span></h2></div><button className="icon-button subtle"><MoreHorizontal size={18} /></button></div><div className="queue-controls"><div className="search-field"><Search size={16} /><input placeholder="Search patients" aria-label="Search patients" /></div><button className="filter-button"><SlidersHorizontal size={15} /> Filter</button></div><div className="queue-filters">{["All patients", "High", "Medium", "Normal"].map(filter => <button key={filter} className={queueFilter === filter ? "selected" : ""} onClick={() => setQueueFilter(filter)}>{filter}{filter === "High" && <span>1</span>}</button>)}</div><div className="queue-list">{filteredQueue.map((item, index) => <Link href={index === 0 ? "/doctor/patients/anita" : "/doctor"} key={item.id} className={`queue-item ${index === 0 ? "selected" : ""}`}><div className={`avatar avatar-${item.priority}`}>{item.initials}</div><div className="queue-item-main"><div><strong>{item.name}</strong><span>{item.id}</span></div><p>{item.detail}</p><small>{item.time} <span>•</span> {index === 0 ? "New check-in" : "Awaiting review"}</small></div><PriorityBadge level={item.priority} /></Link>)}</div><div className="queue-footer"><span>Showing {filteredQueue.length} of 12 patients</span><button className="text-link">View full queue <ArrowRight size={15} /></button></div></div><div className="doctor-main-column"><div className="patient-summary-header"><div className="patient-identity"><div className="avatar avatar-high large-avatar">AR</div><div><div className="eyebrow">PATIENT SUMMARY · NEW CHECK-IN</div><h2>Anita Rao <span className="verified-badge"><BadgeCheck size={15} /> Verified identity</span></h2><p>MRN-2184 · 58 years · Female · English</p></div></div><div className="summary-actions"><button className="icon-button subtle" aria-label="More patient actions"><MoreHorizontal size={18} /></button><button className="primary-button" onClick={() => toast.success("Review marked as in progress")}><ClipboardCheck size={16} /> Start review</button></div></div><div className="priority-strip"><div className="priority-strip-mark high"><AlertTriangle size={19} /></div><div><div className="priority-strip-heading"><strong>Preliminary priority: High</strong><PriorityBadge level="high" label="Immediate clinical review" /></div><p>{dashboard.priority.reasons.slice(0, 3).join(" · ")}</p></div><button className="text-button">View reasoning <ArrowUpRight size={15} /></button></div><div className="summary-tabs" role="tablist"><button className={selectedTab === "summary" ? "active" : ""} onClick={() => setSelectedTab("summary")}>Overview</button><button className={selectedTab === "timeline" ? "active" : ""} onClick={() => setSelectedTab("timeline")}>Timeline & trends</button><button className={selectedTab === "feedback" ? "active" : ""} onClick={() => setSelectedTab("feedback")}>Feedback</button></div>{selectedTab === "summary" && <DoctorSummary dashboard={dashboard} reviewMutation={reviewMutation} appointmentType={appointmentType} setAppointmentType={setAppointmentType} followUpDate={followUpDate} setFollowUpDate={setFollowUpDate} appointmentNote={appointmentNote} setAppointmentNote={setAppointmentNote} saveAppointment={saveAppointment} />}{selectedTab === "timeline" && <TimelineView dashboard={dashboard} />}{selectedTab === "feedback" && <FeedbackView feedback={feedback} setFeedback={setFeedback} saveFeedback={saveFeedback} isPending={feedbackMutation.isPending} />}</div></div></AppShell>;
}

function DoctorSummary({ dashboard, reviewMutation, appointmentType, setAppointmentType, followUpDate, setFollowUpDate, appointmentNote, setAppointmentNote, saveAppointment }: { dashboard: PatientDashboardData; reviewMutation: ReturnType<typeof trpc.mediscreen.reviewSection.useMutation>; appointmentType: AppointmentType; setAppointmentType: (type: AppointmentType) => void; followUpDate: string; setFollowUpDate: (value: string) => void; appointmentNote: string; setAppointmentNote: (value: string) => void; saveAppointment: () => void }) {
  return <div className="summary-content"><div className="summary-grid"><section className="card summary-card symptoms-summary"><div className="summary-card-heading"><div><div className="eyebrow">CURRENT SYMPTOMS</div><h3>What Anita shared</h3></div><StatusPill tone="amber">Needs review</StatusPill></div><p className="quoted-symptom">“{dashboard.currentSymptomText}”</p><div className="tag-row">{dashboard.symptoms.map(item => <span className="soft-tag" key={item}>{item}</span>)}</div><div className="answer-summary"><div className="answer-summary-heading"><MessageSquareText size={16} /><strong>Adaptive question responses</strong><span>{dashboard.answers.length} answered</span></div>{dashboard.answers.slice(0, 4).map(answer => <div className="answer-summary-row" key={answer.questionId}><span>{answer.question}</span><strong>{answer.answer}</strong></div>)}<Link href="/patient/symptoms" className="text-link">View all responses <ArrowRight size={14} /></Link></div></section><section className="card summary-card priority-card"><div className="summary-card-heading"><div><div className="eyebrow">EXPLAINABLE PRIORITY</div><h3>Why this is highlighted</h3></div><PriorityBadge level={dashboard.priority.level} label="High" /></div><ul className="reason-list">{dashboard.priority.reasons.map(reason => <li key={reason}><span><Check size={13} /></span>{reason}</li>)}</ul><div className="mini-disclaimer"><ShieldAlert size={15} /><span>{dashboard.priority.disclaimer}</span></div></section></div><div className="summary-grid"><section className="card summary-card red-flag-card"><div className="summary-card-heading"><div><div className="eyebrow">POTENTIAL RED FLAGS</div><h3>Signals for clinician review</h3></div><button className="text-button" onClick={() => reviewMutation.mutate({ section: "redFlags", reviewState: "accepted" })}>Accept all</button></div><div className="red-flag-list">{dashboard.redFlags.map(flag => <div className="red-flag-row" key={flag.id}><div className={`flag-icon ${flag.severity}`}><AlertTriangle size={16} /></div><div><strong>{flag.title}</strong><span>{flag.detail}</span><small>{flag.evidence}</small></div><button className="icon-button subtle" aria-label={`Review ${flag.title}`}><ChevronRight size={17} /></button></div>)}</div></section><section className="card summary-card medication-card"><div className="summary-card-heading"><div><div className="eyebrow">MEDICATION & ALLERGY CHECK</div><h3>Review before consultation</h3></div><Pill size={20} className="muted-icon" /></div><div className="allergy-line"><span>Known allergy</span><strong>{dashboard.allergies.join(", ")}</strong></div>{dashboard.medicationReview.map(item => <div className="med-review-row" key={item.medicine}><div className={`med-status ${item.status}`} /> <div><strong>{item.medicine}</strong><span>{item.note}</span></div><StatusPill tone={item.status === "review" ? "amber" : "teal"}>{item.status === "review" ? "Review" : "No match"}</StatusPill></div>)}<p className="tiny-note">This check flags possible conflicts for review. It never recommends, stops, or changes medication.</p></section></div><section className="card summary-card ai-summary-card"><div className="summary-card-heading"><div><div className="eyebrow"><Sparkles size={13} /> AI-GENERATED PATIENT SUMMARY</div><h3>One-minute read</h3></div><StatusPill tone={dashboard.summaryReviewState === "pending" ? "navy" : "teal"}>{dashboard.summaryReviewState === "pending" ? "Needs verification" : dashboard.summaryReviewState === "rejected" ? "Rejected" : "Verified"}</StatusPill></div><p>{dashboard.summary}</p><div className="review-actions"><span><Clock3 size={14} /> Generated today at 09:42</span><div><button className="secondary-button" onClick={() => reviewMutation.mutate({ section: "summary", reviewState: "rejected" })}><XCircle size={15} /> Reject</button><button className="primary-button" onClick={() => reviewMutation.mutate({ section: "summary", reviewState: "accepted" })}><CheckCircle2 size={15} /> Accept summary</button></div></div></section><AppointmentPanel appointmentType={appointmentType} setAppointmentType={setAppointmentType} followUpDate={followUpDate} setFollowUpDate={setFollowUpDate} appointmentNote={appointmentNote} setAppointmentNote={setAppointmentNote} saveAppointment={saveAppointment} /></div>;
}

function AppointmentPanel({ appointmentType, setAppointmentType, followUpDate, setFollowUpDate, appointmentNote, setAppointmentNote, saveAppointment }: { appointmentType: AppointmentType; setAppointmentType: (type: AppointmentType) => void; followUpDate: string; setFollowUpDate: (value: string) => void; appointmentNote: string; setAppointmentNote: (value: string) => void; saveAppointment: () => void }) {
  return <section className="card appointment-card"><div className="appointment-heading"><div><div className="eyebrow">CLINICIAN DECISION</div><h3>What happens next?</h3><p>The final appointment decision belongs to authorized clinical staff.</p></div><div className="appointment-icon"><CalendarDays size={20} /></div></div><div className="appointment-options">{([ ["immediate", "Immediate clinical review", "Potentially urgent"], ["normal", "Normal consultation", "Routine visit"], ["follow-up", "Follow-up required", "Plan another touchpoint"] ] as [AppointmentType, string, string][]).map(([value, label, detail]) => <button key={value} className={`appointment-option ${appointmentType === value ? "selected" : ""}`} onClick={() => setAppointmentType(value)}><span className="appointment-radio" /> <span><strong>{label}</strong><small>{detail}</small></span></button>)}</div>{appointmentType === "follow-up" && <div className="follow-up-fields"><label>Follow-up date<input type="date" value={followUpDate} onChange={event => setFollowUpDate(event.target.value)} /></label><label>Note<textarea value={appointmentNote} onChange={event => setAppointmentNote(event.target.value)} placeholder="Add a short handover note" /></label></div>}{appointmentType !== "follow-up" && <label className="full-note-field">Decision note <input value={appointmentNote} onChange={event => setAppointmentNote(event.target.value)} placeholder="Add a short handover note (optional)" /></label>}<div className="appointment-footer"><span><LockKeyhole size={14} /> Saved to the clinician record</span><button className="primary-button" onClick={saveAppointment}><Check size={16} /> Save decision</button></div></section>;
}

function TimelineView({ dashboard }: { dashboard: PatientDashboardData }) {
  return <div className="timeline-view"><div className="timeline-grid"><section className="card timeline-card"><SectionTitle eyebrow="MEDICAL HISTORY" title="A clear timeline" description="Important events, organized chronologically." /><div className="timeline-list">{dashboard.timeline.map(event => <div className="timeline-item" key={event.id}><div className={`timeline-node ${event.tone}`}><span /></div><div className="timeline-date">{event.date}</div><div className="timeline-event"><strong>{event.title}</strong><span>{event.detail}</span><small>{event.source}</small></div></div>)}</div></section><section className="card trend-card"><SectionTitle eyebrow="TREND DETECTION" title="What changed?" description="Changes are highlighted for review, not diagnosis." />{dashboard.trends.map(trend => <div className="trend-block" key={trend.label}><div className="trend-heading"><div><strong>{trend.label}</strong><span>{trend.unit}</span></div><span className={`trend-direction ${trend.tone}`}>{trend.tone === "up" ? "↑ Increasing" : "→ Stable"}</span></div><div className="trend-chart"><ResponsiveContainer width="100%" height={150}><LineChart data={trend.values} margin={{ top: 10, right: 12, bottom: 0, left: -22 }}><XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: "#768596", fontSize: 11 }} /><YAxis hide domain={["dataMin - 1", "dataMax + 1"]} /><ChartTooltip contentStyle={{ borderRadius: 10, border: "1px solid #dfe8e9", fontSize: 12 }} /><Line type="monotone" dataKey="value" stroke={trend.tone === "up" ? "#cf6c4c" : teal} strokeWidth={3} dot={{ r: 4, fill: trend.tone === "up" ? "#cf6c4c" : teal, strokeWidth: 2, stroke: "#fff" }} /></LineChart></ResponsiveContainer></div><p>{trend.interpretation}</p></div>)}</section></div><SafetyNotice /></div>;
}

function FeedbackView({ feedback, setFeedback, saveFeedback, isPending }: { feedback: { priorityCorrect: boolean | null; extractionCorrect: boolean | null; missingInformation: string; incorrectInformation: string; suggestedCorrection: string }; setFeedback: React.Dispatch<React.SetStateAction<{ priorityCorrect: boolean | null; extractionCorrect: boolean | null; missingInformation: string; incorrectInformation: string; suggestedCorrection: string }>>; saveFeedback: () => void; isPending: boolean }) {
  return <div className="feedback-view"><section className="card feedback-card"><div className="feedback-header"><div><div className="eyebrow">DOCTOR FEEDBACK</div><h2>Help improve the next review</h2><p>Your feedback is stored for model evaluation and workflow improvement.</p></div><div className="feedback-icon"><MessageSquareText size={22} /></div></div><div className="feedback-question"><strong>Was the preliminary priority appropriate?</strong><div className="feedback-choice-row"><button className={feedback.priorityCorrect === true ? "choice selected positive" : "choice"} onClick={() => setFeedback(current => ({ ...current, priorityCorrect: true }))}><CheckCircle2 size={17} /> Yes</button><button className={feedback.priorityCorrect === false ? "choice selected negative" : "choice"} onClick={() => setFeedback(current => ({ ...current, priorityCorrect: false }))}><XCircle size={17} /> No</button></div></div><div className="feedback-question"><strong>Was the extracted information correct?</strong><div className="feedback-choice-row"><button className={feedback.extractionCorrect === true ? "choice selected positive" : "choice"} onClick={() => setFeedback(current => ({ ...current, extractionCorrect: true }))}><CheckCircle2 size={17} /> Yes</button><button className={feedback.extractionCorrect === false ? "choice selected negative" : "choice"} onClick={() => setFeedback(current => ({ ...current, extractionCorrect: false }))}><XCircle size={17} /> No</button></div></div><div className="feedback-fields"><label>Missing information<textarea value={feedback.missingInformation} onChange={event => setFeedback(current => ({ ...current, missingInformation: event.target.value }))} placeholder="What would have helped you decide?" /></label><label>Incorrect information<textarea value={feedback.incorrectInformation} onChange={event => setFeedback(current => ({ ...current, incorrectInformation: event.target.value }))} placeholder="Which detail needs correction?" /></label><label>Suggested correction<textarea value={feedback.suggestedCorrection} onChange={event => setFeedback(current => ({ ...current, suggestedCorrection: event.target.value }))} placeholder="Add the correct wording or value" /></label></div><div className="feedback-footer"><span><LockKeyhole size={14} /> Feedback is linked to this demo record only</span><button className="primary-button" onClick={saveFeedback} disabled={isPending}><Send size={15} /> {isPending ? "Saving…" : "Submit feedback"}</button></div></section><div className="feedback-side"><div className="card feedback-tip"><div className="tip-icon"><Sparkles size={19} /></div><strong>Why your feedback matters</strong><p>Every correction helps the care team understand where extraction or priority support needs more review.</p></div><SafetyNotice compact /></div></div>;
}

function LoadingState() {
  return <div className="loading-screen"><div className="loading-mark"><Activity size={24} /></div><strong>Preparing the patient context</strong><span>Loading the latest demo record…</span></div>;
}

export default function Home() {
  const [location] = useLocation();
  const { data, isLoading, isError } = trpc.mediscreen.dashboard.useQuery(undefined, { retry: false });
  if (location === "/") return <Landing />;
  if (isLoading || !data) return <LoadingState />;
  if (isError) return <div className="loading-screen"><AlertTriangle size={24} /><strong>We couldn’t load the demo record.</strong><span>Refresh the page to try again.</span></div>;
  if (location.startsWith("/doctor")) return <DoctorWorkspace dashboard={data.dashboard} active={location} />;
  return <PatientWorkspace dashboard={data.dashboard} active={location} />;
}
