import { site } from '../content.js';

const LINKS = [
  { id: 'websites', label: 'Work', also: ['print', 'work'] }, // web work first, then the case studies
  { id: 'studio', label: 'Studio' },
  { id: 'services', label: 'Services' },
  { id: 'contact', label: 'Contact' },
];

export default function NavBar({ visible, active, onNavigate }) {
  const go = (id) => (e) => {
    e.preventDefault();
    onNavigate(id);
  };
  return (
    <header className={`nav${visible ? ' is-visible' : ''}`} inert={!visible ? true : undefined}>
      <div className="nav__inner">
        <a className="nav__brand" href="#front" onClick={go('front')} aria-label={`${site.name} — front page`}>
          <span className="nav__brand-full">{site.name}</span>
          <span className="nav__brand-short" aria-hidden="true">KK</span>
        </a>
        <nav aria-label="Sections">
          <ul className="nav__links">
            {LINKS.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} onClick={go(l.id)} aria-current={active === l.id || l.also?.includes(active) ? 'true' : undefined}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="nav__cta" href="#contact" onClick={go('contact')}>
          Enquire <span aria-hidden="true">→</span>
        </a>
      </div>
    </header>
  );
}
