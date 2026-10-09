import { site } from '../content.js';
import { editionDate } from '../lib/env.js';

export default function Footer({ onNavigate, onReplay }) {
  const go = (id) => (e) => {
    e.preventDefault();
    onNavigate(id);
  };
  const year = new Date().getFullYear();
  return (
    <footer className="colophon">
      <div className="colophon__inner">
        <div className="rule-thick" />
        <div className="colophon__grid">
          <div className="colophon__brand">
            <p className="colophon__mast">{site.name}</p>
            <p className="colophon__desc">{site.descriptor}</p>
          </div>
          <div className="colophon__col">
            <h2 className="colophon__label">Colophon</h2>
            <p>
              {site.edition.title}, {site.edition.volume}. Published digitally by {site.name} on {editionDate()}. Set in Playfair Display,
              Instrument Serif, Newsreader and IBM Plex Mono.
            </p>
            {site.sampleNotice && (
              <p className="colophon__sample">
                Sample edition: projects, imagery, email and social handles are placeholders, edited in <code>src/content.js</code>.
              </p>
            )}
          </div>
          <div className="colophon__col">
            <h2 className="colophon__label">Sections</h2>
            <ul className="colophon__links">
              <li>
                <a className="text-link" href="#front" onClick={go('front')}>
                  Front Page
                </a>
              </li>
              <li>
                <a className="text-link" href="#websites" onClick={go('websites')}>
                  Websites
                </a>
              </li>
              <li>
                <a className="text-link" href="#print" onClick={go('print')}>
                  The Print Room
                </a>
              </li>
              <li>
                <a className="text-link" href="#work" onClick={go('work')}>
                  Selected Work
                </a>
              </li>
              <li>
                <a className="text-link" href="#studio" onClick={go('studio')}>
                  The Studio
                </a>
              </li>
              <li>
                <a className="text-link" href="#services" onClick={go('services')}>
                  Services
                </a>
              </li>
              <li>
                <a className="text-link" href="#contact" onClick={go('contact')}>
                  Classifieds
                </a>
              </li>
            </ul>
          </div>
          <div className="colophon__col">
            <h2 className="colophon__label">Correspondence</h2>
            <ul className="colophon__links">
              <li>
                <a className="text-link" href={`mailto:${site.contact.email}`}>
                  {site.contact.email}
                </a>
              </li>
              {site.contact.socials.map((s) => (
                <li key={s.label}>
                  <a className="text-link" href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="colophon__base">
          <span>
            © {year} {site.name}. All rights reserved.
          </span>
          <span className="colophon__actions">
            {onReplay && (
              <button type="button" className="text-link" onClick={onReplay}>
                Replay the unfolding <span aria-hidden="true">↺</span>
              </button>
            )}
            <a className="text-link" href="#front" onClick={go('front')}>
              Back to the front page <span aria-hidden="true">↑</span>
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
