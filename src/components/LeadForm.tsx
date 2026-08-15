import { useId, useState, type FormEvent } from "react";

/**
 * The single lead-capture component used everywhere: home, project pages,
 * articles, and ad landing pages (with a different `source` tag each
 * time). Posts to /api/lead — an Astro SSR endpoint running on the
 * Cloudflare adapter's worker (see docs/decisions/0006-lead-capture-worker.md).
 *
 * Honeypot + itemized DPDP consent are structural, not cosmetic: a bot
 * that fills every field trips the honeypot, and a human must tick "contact
 * me" (c1) before submit is enabled — "send other updates" (c2) stays
 * separately optional per DPDP's purpose-limitation requirement.
 */

export interface LeadFormProps {
  theme?: "light" | "dark";
  project?: string;
  source?: string;
}

const CONSENT_TEXT_VERSION = "v1.0";

function whatsappLink(project: string) {
  return `https://wa.me/919870886895?text=${encodeURIComponent(`Hi, I'm interested in ${project}`)}`;
}

export default function LeadForm({ theme = "light", project = "a project with AK Realtors", source = "organic" }: LeadFormProps) {
  const dark = theme === "dark";
  const idPrefix = useId();
  const [day, setDay] = useState<"Weekday" | "Weekend">("Weekend");
  const [consentContact, setConsentContact] = useState(false);
  const [consentUpdates, setConsentUpdates] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consentContact) return;
    setStatus("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || ""),
      phone: String(data.get("phone") || ""),
      configuration: String(data.get("configuration") || ""),
      timeline: String(data.get("timeline") || ""),
      siteVisitDay: day,
      project,
      source,
      consentContact,
      consentUpdates,
      consentTextVersion: CONSENT_TEXT_VERSION,
      consentTimestamp: new Date().toISOString(),
      // honeypot — real users never see or fill this field
      website: String(data.get("website") || ""),
    };

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Something went wrong. Please try WhatsApp instead.");
      }
      if (typeof window !== "undefined" && "gtag" in window) {
        // GA4 + Google Ads conversion event — see docs/decisions/0011-analytics-consent.md
        (window as any).gtag("event", "generate_lead", { project, source });
      }
      setStatus("sent");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className={`blueprint lead-form ${dark ? "surface-dark" : ""}`}>
        <i className="corner tl" />
        <i className="corner tr" />
        <i className="corner bl" />
        <i className="corner br" />
        <div className="lead-form-sent">
          <div className="kicker">Lead recorded · alert pushed</div>
          <h3>We'll call you within the hour.</h3>
          <p className="text-muted">Faster than that if you'd rather talk now — the WhatsApp thread is already prefilled with {project}.</p>
          <a href={whatsappLink(project)} className="btn btn-whatsapp">
            <span className="dot" />Open WhatsApp now
          </a>
          <button type="button" className="link-reset" onClick={() => setStatus("idle")}>
            Send another enquiry
          </button>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <form className={`blueprint lead-form ${dark ? "surface-dark" : ""}`} onSubmit={handleSubmit} noValidate>
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />

      <div className="kicker">Get the price sheet &amp; site photos</div>
      <h3 className="lead-form-title">Book a site visit</h3>
      <p className="text-muted lead-form-sub">Six fields. We call back the same hour — usually in five minutes.</p>

      {/* Honeypot: visually hidden, off-tabindex, never rendered to real users. */}
      <div className="visually-hidden" aria-hidden="true">
        <label htmlFor={`${idPrefix}-website`}>Leave this field empty</label>
        <input id={`${idPrefix}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="lead-form-grid">
        <label className="field">
          <span className="field-label">Name</span>
          <input className="input" type="text" name="name" placeholder="Your name" required minLength={2} />
        </label>
        <label className="field">
          <span className="field-label">Phone</span>
          <input
            className="input"
            type="tel"
            name="phone"
            placeholder="10-digit mobile"
            required
            pattern="[6-9][0-9]{9}"
            title="10-digit Indian mobile number"
          />
        </label>
        <label className="field">
          <span className="field-label">Configuration</span>
          <select className="input" name="configuration" defaultValue="2 BHK">
            <option>2 BHK</option>
            <option>3 BHK</option>
            <option>4 BHK / villa</option>
            <option>Not decided</option>
          </select>
        </label>
        <label className="field">
          <span className="field-label">Timeline</span>
          <select className="input" name="timeline" defaultValue="Ready to move">
            <option>Ready to move</option>
            <option>1–2 years</option>
            <option>Investment, flexible</option>
          </select>
        </label>
      </div>

      <div className="day-picker">
        <span className="field-label">Site visit</span>
        <div className="seg">
          {(["Weekday", "Weekend"] as const).map((d) => (
            <button
              type="button"
              key={d}
              className={`seg-opt ${day === d ? "seg-opt-active" : ""}`}
              onClick={() => setDay(d)}
              aria-pressed={day === d}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="data-slot hidden-fields-note">
        HIDDEN: project = {project} · source = {source} · consent_text_version = {CONSENT_TEXT_VERSION} · consent_timestamp = auto
      </div>

      <div className="consent-block">
        <div className="field-label consent-heading">How we use this — itemised</div>
        <label className="consent-row">
          <input type="checkbox" checked={consentContact} onChange={(e) => setConsentContact(e.target.checked)} required />
          <span>Contact me about this project by phone and WhatsApp.</span>
        </label>
        <label className="consent-row">
          <input type="checkbox" checked={consentUpdates} onChange={(e) => setConsentUpdates(e.target.checked)} />
          <span>Send me other AK Realtors project updates — separate, optional.</span>
        </label>
        <p className="consent-fineprint text-muted">
          Your name and number are shared with the developer of the project you enquire about. Grievances:
          privacy@akarohanrealtors.com, answered within 90 days.
        </p>
      </div>

      {status === "error" && <p className="lead-form-error">{errorMessage}</p>}

      <button type="submit" className="btn btn-gold btn-block" disabled={!consentContact || status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Request a callback"}
      </button>
      <div className="lead-form-footnote">Server-side validation · honeypot · rate limited</div>
      <style>{styles}</style>
    </form>
  );
}

const styles = `
.lead-form { padding: 26px 24px 24px; background: var(--color-surface); }
.lead-form.surface-dark { background: #1b1c1d; }
.lead-form-title { font-size: 30px; margin: 0 0 6px; padding-right: 36px; }
.lead-form-sub { margin: 0 0 20px; font-size: 14px; }
.lead-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
.day-picker { margin-bottom: 16px; }
.day-picker .field-label { display: block; margin-bottom: 7px; }
.day-picker .seg { display: flex; width: 100%; border: 1px solid var(--color-divider-strong); }
.seg-opt { flex: 1 1 0; font-family: var(--font-heading); font-weight: 600; font-size: 14px; letter-spacing: 0.06em; text-transform: uppercase; padding: 11px 8px; cursor: pointer; border: 0; background: transparent; color: var(--color-ink); }
.seg-opt-active { background: var(--color-ink); color: var(--color-bg); }
.hidden-fields-note { margin-bottom: 14px; }
.consent-block { border-top: 1px solid var(--color-divider-strong); padding-top: 14px; margin-bottom: 16px; }
.consent-heading { margin-bottom: 10px; }
.consent-row { display: flex; gap: 10px; align-items: flex-start; cursor: pointer; font-size: 13px; line-height: 1.5; margin-bottom: 11px; }
.consent-row input { margin-top: 3px; width: 16px; height: 16px; accent-color: var(--color-accent); flex: 0 0 16px; }
.consent-fineprint { margin: 12px 0 0; font-size: 12px; line-height: 1.55; }
.lead-form-error { color: #b3441f; font-size: 13px; margin: 0 0 12px; }
.lead-form-footnote { font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.06em; color: var(--color-neutral-600); text-align: center; margin-top: 10px; text-transform: uppercase; }
.lead-form-sent h3 { font-size: 32px; margin: 0 0 12px; }
.lead-form-sent p { margin: 0 0 20px; font-size: 15px; }
.link-reset { display: block; margin-top: 16px; background: transparent; border: 0; padding: 0; cursor: pointer; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; color: var(--color-neutral-600); text-decoration: underline; }
@media (max-width: 480px) { .lead-form-grid { grid-template-columns: 1fr; } }
`;
