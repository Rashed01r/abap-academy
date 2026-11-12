"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Mail, Phone } from "lucide-react";
import { composeLinks, contact, LIMITS, looksLikeBot, validateContact, type ContactErrors, type ContactFields } from "@/lib/contact";
import "./contact-page.css";

// Brand marks (lucide has no brand icons).
const LinkedInIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.73 1.637-1.27 3.37-1.27 3.601 0 4.267 2.37 4.267 4.455v6.286zM5.337 7.433a2.064 2.064 0 1 1 0-4.128 2.064 2.064 0 0 1 0 4.128zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
const GitHubIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>;

const empty: ContactFields = { name: "", email: "", subject: "", message: "", trap: "" };
const COOLDOWN_KEY = "abap2-contact-last-sent";

export function ContactPage() {
  const [fields, setFields] = useState(empty);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<{ ok: boolean; text: string; links?: { gmail: string; mailto: string } } | null>(null);
  const form = useRef<HTMLFormElement>(null);

  // F8 is SAP's "execute" key; the Send button shows it.
  useEffect(() => {
    const run = (e: KeyboardEvent) => { if (e.key === "F8") { e.preventDefault(); form.current?.requestSubmit(); } };
    window.addEventListener("keydown", run);
    return () => window.removeEventListener("keydown", run);
  }, []);
  const set = (key: keyof ContactFields) => (e: { target: { value: string } }) => setFields(f => ({ ...f, [key]: e.target.value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    const found = validateContact(fields);
    setErrors(found);
    const first = (["name", "email", "subject", "message"] as const).find(k => found[k]);
    if (first) { form.current?.querySelector<HTMLElement>(`#contact-${first}`)?.focus(); setStatus(null); return; }
    // Bots get the normal success message and nothing is sent, so they learn nothing.
    if (looksLikeBot(fields)) { setFields(empty); setStatus({ ok: true, text: "Thank you. Your message is ready to send." }); return; }
    let last = 0;
    try { last = Number(localStorage.getItem(COOLDOWN_KEY)) || 0; } catch { /* storage blocked: cooldown is best effort */ }
    if (Date.now() - last < LIMITS.cooldownMs) { setStatus({ ok: false, text: "You just sent a message. Please wait a minute before sending another." }); return; }
    const links = composeLinks(fields);
    // Opened from the click, so popup blockers allow it; opener cleared so Gmail cannot reach this page.
    const tab = window.open(links.gmail, "_blank");
    if (tab) tab.opener = null;
    try { localStorage.setItem(COOLDOWN_KEY, String(Date.now())); } catch { /* best effort */ }
    // Keep the typed text: the message is only sent when the visitor presses Send in Gmail.
    setStatus({ ok: true, text: tab ? "Gmail opened in a new tab with your message ready. Press Send there to send it." : "Your browser blocked the new tab.", links });
  }

  // Each field is labelled like an ABAP declaration; only the plain comment ("Full name") is the accessible label.
  const declare = (id: string, variable: string, label: string) => <p className="contact-line contact-decl">
    <span aria-hidden="true"><b>DATA</b> <i>{variable}</i> <b>TYPE</b> string. &quot;</span> <label htmlFor={id}>{label}</label>
  </p>;
  const field = (key: "name" | "email" | "subject", variable: string, label: string, type: string, autoComplete: string, hint: string) => (
    <div className="contact-field">
      {declare(`contact-${key}`, variable, label)}
      <input id={`contact-${key}`} name={key} type={type} autoComplete={autoComplete} required maxLength={LIMITS[key]} placeholder={hint}
        value={fields[key]} onChange={set(key)} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `contact-${key}-error` : undefined} />
      {errors[key] && <p className="contact-error" id={`contact-${key}-error`}>{errors[key]}</p>}
    </div>
  );
  const problems = Object.keys(errors).length;
  const dirty = Object.entries(fields).some(([k, v]) => k !== "trap" && v);

  return <section className="contact-page" aria-labelledby="contact-title">
    <div className="contact-head">
      <p className="contact-cm" aria-hidden="true">&quot; contact.abap · questions, feedback and ideas</p>
      <h1 id="contact-title">Contact me</h1>
      <p className="contact-lead">Questions, feedback or ideas for ABAP Academy are always welcome.</p>
    </div>
    <ul className="contact-chips" aria-label="Contact details">
      <li><a className="contact-chip" href={`mailto:${contact.email}`}><span className="contact-bar"><Mail size={13} aria-hidden="true" />email<span className="go" aria-hidden="true">→</span></span><span className="val">{contact.email}</span></a></li>
      <li><a className="contact-chip" href={contact.phoneHref}><span className="contact-bar"><Phone size={13} aria-hidden="true" />phone<span className="go" aria-hidden="true">→</span></span><span className="val"><span dir="ltr">{contact.phoneDisplay}</span><small>Saudi Arabia</small></span></a></li>
      <li><a className="contact-chip" href={contact.linkedin} target="_blank" rel="noopener noreferrer"><span className="contact-bar"><LinkedInIcon />LinkedIn<span className="go" aria-hidden="true">↗</span></span><span className="val">rashed-balhareth</span></a></li>
      <li><a className="contact-chip" href={contact.github} target="_blank" rel="noopener noreferrer"><span className="contact-bar"><GitHubIcon />GitHub<span className="go" aria-hidden="true">↗</span></span><span className="val">Rashed01r</span></a></li>
    </ul>

    <div className="contact-card">
      <div className="contact-tb" aria-hidden="true"><i /><i /><i /><span className={dirty ? "dirty" : undefined}>message.abap</span></div>
      <h2 className="sr-only">Send a message</h2>
      <form ref={form} onSubmit={submit} noValidate>
        <p className="contact-line contact-c" aria-hidden="true">&quot; Send a message. Fill in the fields, then run it.</p>
        <p className="contact-line" aria-hidden="true"><b>REPORT</b> <i>z_contact_me</i>.</p>
        {field("name", "lv_full_name", "Full name", "text", "name", "'Your name'")}
        {field("email", "lv_email", "Email", "email", "email", "'you@example.com'")}
        {field("subject", "lv_subject", "Subject", "text", "off", "'What is it about?'")}
        <div className="contact-field">
          {declare("contact-message", "lv_message", "Message")}
          <textarea id="contact-message" name="message" required maxLength={LIMITS.message} value={fields.message} onChange={set("message")} placeholder="'Write your message here…'"
            aria-invalid={!!errors.message} aria-describedby={errors.message ? "contact-message-error" : undefined} />
          {errors.message && <p className="contact-error" id="contact-message-error">{errors.message}</p>}
        </div>
        {/* Honeypot: hidden from people and screen readers; bots that fill it are ignored.
            The name means nothing to browser autofill, so it stays empty for real visitors. */}
        <div className="contact-hp" aria-hidden="true">
          <label htmlFor="contact-trap">Leave this field empty</label>
          <input id="contact-trap" name="contact_trap_q7" tabIndex={-1} autoComplete="off" value={fields.trap} onChange={set("trap")} />
        </div>
        <p className="contact-line contact-call" aria-hidden="true"><b>CALL FUNCTION</b> <s>&apos;SEND_MESSAGE&apos;</s>. <span className="contact-c">&quot; opens Gmail, you press Send</span></p>
        <p className={`contact-status ${status?.ok ? "ok" : "bad"}`} role="status">{status?.text}{status?.links && <>
          {" "}<a href={status.links.gmail} target="_blank" rel="noopener noreferrer">Open Gmail again</a>
          {" · "}<a href={status.links.mailto}>Use another email app</a>
          {" · "}or write to <a href={`mailto:${contact.email}`}>{contact.email}</a>.
        </>}</p>
        <div className="contact-actions">
          <span className="contact-hint">Opens Gmail with your message ready; you press Send.</span>
          <button className="contact-send" type="submit"><span aria-hidden="true">▶</span> Send message <kbd aria-hidden="true">F8</kbd></button>
        </div>
      </form>
      <div className={`contact-statusbar${problems ? " err" : ""}`} aria-hidden="true">
        <span>{problems ? `${problems} problem${problems > 1 ? "s" : ""} found` : "Ready"}</span>
        <span className="contact-count">{fields.message.length} / {LIMITS.message}</span>
        <span>ABAP · UTF-8</span>
      </div>
    </div>
  </section>;
}
