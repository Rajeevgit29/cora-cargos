import { useState } from 'react';
import { contact, services, site } from '../content.js';
import { SectionHead } from './Editorial.jsx';

const NOT_SURE = 'Not sure yet';

function mailto({ subject, body }) {
  const q = new URLSearchParams();
  if (subject) q.set('subject', subject);
  if (body) q.set('body', body);
  return `mailto:${site.contact.email}?${q.toString().replace(/\+/g, '%20')}`;
}

export default function Contact({ enquiryType, onTypeChange }) {
  const [copied, setCopied] = useState(false);
  const email = site.contact.email;
  const types = [...services.items.map((s) => s.name), NOT_SURE];
  const ads = contact.ads.filter((a) => !a.sampleOnly || site.sampleNotice);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const type = f.get('type') || NOT_SURE;
    const body = [
      `Name: ${f.get('name')}`,
      `Email: ${f.get('email')}`,
      `Project type: ${type}`,
      '',
      f.get('message'),
    ].join('\n');
    window.location.href = mailto({ subject: `${site.contact.enquirySubject} — ${type}`, body });
  };

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="section__inner">
        <SectionHead label={contact.section} meta="Notices & enquiries" page="p. 10" />
        <div className="classifieds">
          <div className="classifieds__ads">
            {ads.map((ad) => (
              <div key={ad.title} className={`ad reveal${ad.sampleOnly ? ' ad--notice' : ''}`}>
                <h3 className="ad__title">{ad.title}</h3>
                <p>{ad.text}</p>
              </div>
            ))}
          </div>

          <div className="feature-ad reveal">
            <div className="feature-ad__inner">
              <p className="kicker">{contact.kicker}</p>
              <h2 id="contact-title" className="feature-ad__head" tabIndex={-1} data-section-heading>
                {contact.headline}
              </h2>
              <span className="feature-ad__ornament" aria-hidden="true">
                ✦ ✦ ✦
              </span>
              <p className="feature-ad__body">{contact.body}</p>
              <a className="btn-ink btn-ink--lg" href={mailto({ subject: site.contact.enquirySubject })}>
                {contact.cta} <span aria-hidden="true">→</span>
              </a>
              <div className="feature-ad__direct">
                <a className="ink-link feature-ad__email" href={`mailto:${email}`}>
                  {email}
                </a>
                <button type="button" className="copy-btn" onClick={copy} aria-live="polite">
                  {copied ? 'Copied ✓' : 'Copy address'}
                </button>
              </div>
              <ul className="socials" aria-label="Social profiles">
                {site.contact.socials.map((s) => (
                  <li key={s.label}>
                    <a className="ink-link" href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                    <span className="socials__handle">{s.handle}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <form className="order-form reveal" onSubmit={submit}>
            <h3 className="ad__title">Place your notice</h3>
            <p className="order-form__note">Fill in a few lines and we will open your email app with the notice ready to send.</p>
            <label>
              <span>Your name</span>
              <input name="name" required autoComplete="name" />
            </label>
            <label>
              <span>Your email</span>
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label>
              <span>Kind of story</span>
              <select name="type" value={enquiryType || ''} onChange={(e) => onTypeChange(e.target.value)}>
                <option value="">Choose one…</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>The story so far</span>
              <textarea name="message" rows={4} required placeholder="What are you making, and when do you need it?" />
            </label>
            <button className="btn-ink" type="submit">
              Compose email <span aria-hidden="true">→</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
