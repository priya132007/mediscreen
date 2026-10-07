import { useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, LockKeyhole, UserRound, XCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const mutation = mode === "login" ? trpc.auth.login.useMutation() : trpc.auth.signup.useMutation();
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const input = mode === "login" ? { email, password } : { name, email, phone, password };
    mutation.mutate(input as never, { onSuccess: () => { toast.success(mode === "login" ? "Welcome back" : "Account created"); navigate("/patient"); } });
  };
  return <div className="account-page"><div className="account-panel"><div className="eyebrow">MEDISCREEN AI</div><h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1><p className="account-lead">{mode === "login" ? "Sign in to continue your care check-in and view your visit history." : "Keep your check-in, profile, and doctor visits together in one secure place."}</p><form className="account-form" onSubmit={submit}>
    {mode === "signup" && <label className="form-field">Full name<input className="form-input" value={name} onChange={event => setName(event.target.value)} required /></label>}
    {mode === "signup" && <label className="form-field">Mobile number<input className="form-input" type="tel" value={phone} onChange={event => setPhone(event.target.value)} placeholder="+91 98765 43210" required /></label>}
    <label className="form-field">Email address<input className="form-input" type="email" value={email} onChange={event => setEmail(event.target.value)} required /></label>
    <label className="form-field">Password<input className="form-input" type="password" minLength={mode === "signup" ? 8 : undefined} value={password} onChange={event => setPassword(event.target.value)} required />{mode === "signup" && <small>Use at least 8 characters.</small>}</label>
    {mutation.error && <div className="account-error"><XCircle size={16} />{mutation.error.message}</div>}
    <button className="primary-button account-submit" disabled={mutation.isPending}>{mutation.isPending ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}<ArrowRight size={16} /></button>
  </form>{mode === "login" && <Link href="/forgot-password" className="text-link account-forgot">Forgot password?</Link>}<p className="account-switch">{mode === "login" ? "New to MediScreen?" : "Already have an account?"} <Link href={mode === "login" ? "/signup" : "/login"}>{mode === "login" ? "Create an account" : "Sign in"}</Link></p><Link href="/" className="text-link">Back to home</Link></div><div className="account-aside"><LockKeyhole size={26} /><strong>Your health information stays yours.</strong><span>Use your account to revisit what you shared and see whether a doctor has reviewed your visit.</span></div></div>;
}

export function AccountPage({ mode }: { mode: "login" | "signup" }) { return <AuthForm mode={mode} />; }

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const mutation = trpc.auth.forgotPassword.useMutation();
  return <div className="account-page"><div className="account-panel"><div className="eyebrow">ACCOUNT RECOVERY</div><h1>Reset your password</h1><p className="account-lead">Enter your email and we’ll send recovery instructions to your email and registered mobile number.</p><form className="account-form" onSubmit={event => { event.preventDefault(); mutation.mutate({ email }, { onSuccess: result => toast.success(result.message) }); }}><label className="form-field">Email address<input className="form-input" type="email" value={email} onChange={event => setEmail(event.target.value)} required /></label><button className="primary-button account-submit" disabled={mutation.isPending}>{mutation.isPending ? "Sending..." : "Send recovery instructions"}<ArrowRight size={16} /></button></form><Link href="/login" className="text-link">Back to sign in</Link></div></div>;
}

export function ResetPasswordPage() {
  const token = new URLSearchParams(window.location.search).get("token") ?? "";
  const [password, setPassword] = useState("");
  const [, navigate] = useLocation();
  const mutation = trpc.auth.resetPassword.useMutation({ onSuccess: () => { toast.success("Password updated"); navigate("/login"); } });
  return <div className="account-page"><div className="account-panel"><div className="eyebrow">ACCOUNT RECOVERY</div><h1>Choose a new password</h1><form className="account-form" onSubmit={event => { event.preventDefault(); mutation.mutate({ token, password }); }}><label className="form-field">New password<input className="form-input" type="password" minLength={8} value={password} onChange={event => setPassword(event.target.value)} required /></label>{mutation.error && <div className="account-error"><XCircle size={16} />{mutation.error.message}</div>}<button className="primary-button account-submit" disabled={!token || mutation.isPending}>Update password<ArrowRight size={16} /></button></form><Link href="/login" className="text-link">Back to sign in</Link></div></div>;
}

export function ProfilePage() {
  const [, navigate] = useLocation();
  const { data, isLoading, isError } = trpc.mediscreen.profile.useQuery(undefined, { retry: false });
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const mutation = trpc.mediscreen.updateProfile.useMutation({ onSuccess: () => { utils.mediscreen.profile.invalidate(); toast.success("Profile updated"); } });
  if (isLoading) return <div className="loading-screen"><strong>Loading your profile...</strong></div>;
  if (isError || !data) return <AuthPrompt />;
  const currentName = name || data.name || "";
  const currentEmail = email || data.email || "";
  const currentPhone = phone || data.phone || "";
  return <AccountShell title="My profile"><section className="card account-card"><div className="account-avatar"><UserRound size={25} /></div><div><div className="eyebrow">ACCOUNT DETAILS</div><h2>Keep your details current</h2><p className="card-subtitle">Your care team uses this information to identify your record.</p></div><form className="profile-form" onSubmit={event => { event.preventDefault(); mutation.mutate({ name: currentName, email: currentEmail, phone: currentPhone }); }}><label className="form-field">Full name<input className="form-input" value={currentName} onChange={event => setName(event.target.value)} /></label><label className="form-field">Email address<input className="form-input" type="email" value={currentEmail} onChange={event => setEmail(event.target.value)} /></label><label className="form-field">Mobile number<input className="form-input" type="tel" value={currentPhone} onChange={event => setPhone(event.target.value)} /></label><div className="account-form-footer"><span><LockKeyhole size={14} /> Account secured with password sign-in</span><button className="primary-button" disabled={mutation.isPending}>Save changes</button></div></form></section><button className="text-button" onClick={() => navigate("/patient")}>Return to check-in <ArrowRight size={15} /></button></AccountShell>;
}

export function HistoryPage() {
  const { data, isLoading, isError } = trpc.mediscreen.history.useQuery(undefined, { retry: false });
  if (isLoading) return <div className="loading-screen"><strong>Loading visit history...</strong></div>;
  if (isError || !data) return <AuthPrompt />;
  return <AccountShell title="Visit history"><section className="card account-card"><div className="section-title-row"><div><div className="eyebrow">YOUR CARE RECORD</div><h2>Doctor visits</h2><p className="card-subtitle">See every recorded visit and whether the doctor has reviewed you.</p></div><Clock3 size={22} className="history-icon" /></div><div className="history-list">{data.length === 0 && <div className="empty-state">No visits have been recorded yet.</div>}{data.map(visit => <div className="history-row" key={visit.id}><div><strong>{visit.reason}</strong><span>{visit.doctorName} · {new Date(visit.visitDate).toLocaleDateString()}</span>{visit.notes && <small>{visit.notes}</small>}</div><div className="history-status"><span className={`status-pill ${visit.status === "completed" ? "teal" : "amber"}`}>{visit.status}</span><span className={`seen-status ${visit.doctorSeen === "yes" ? "seen" : "unseen"}`}>{visit.doctorSeen === "yes" ? <CheckCircle2 size={14} /> : <XCircle size={14} />} Doctor seen: {visit.doctorSeen === "yes" ? "Yes" : "No"}</span></div></div>)}</div></section></AccountShell>;
}

function AuthPrompt() { return <div className="loading-screen"><strong>Sign in to view this page</strong><Link href="/login" className="primary-button">Sign in <ArrowRight size={16} /></Link></div>; }
function AccountShell({ title, children }: { title: string; children: React.ReactNode }) { return <div className="account-shell"><header><Link href="/" className="brand-lockup"><span className="brand-mark account-mark">M</span><span><strong>MediScreen</strong><small>AI pre-consultation</small></span></Link><Link href="/patient" className="text-link">My check-in <ArrowRight size={15} /></Link></header><main><div className="breadcrumb"><Link href="/patient">My check-in</Link><span>/</span>{title}</div><h1>{title}</h1>{children}</main></div>; }
