import { services } from '../content.js';
import { SectionHead } from './Editorial.jsx';

export default function Services({ onEnquire }) {
  return (
    <section id="services" className="section services" aria-labelledby="services-title">
      <div className="section__inner">
        <SectionHead label={services.section} meta="Listings by discipline" page="p. 8" />
        <div className="section-intro">
          <h2 id="services-title" className="section-title" tabIndex={-1} data-section-heading>
            {services.headline}
          </h2>
          <p className="section-lede">{services.intro}</p>
        </div>
        <ol className="directory">
          {services.items.map((s, i) => (
            <li key={s.name} className="directory__row reveal">
              <span className="directory__no">{String(i + 1).padStart(2, '0')}</span>
              <div className="directory__main">
                <h3 className="directory__name">
                  <span>{s.name}</span>
                  <span className="directory__leader" aria-hidden="true" />
                </h3>
                <div className="directory__detail">
                  <p className="directory__text">{s.text}</p>
                  <ul className="directory__deliverables" aria-label={`${s.name} deliverables`}>
                    {s.deliverables.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <button type="button" className="directory__cta" onClick={() => onEnquire(s.name)} aria-label={`Enquire about ${s.name}`}>
                Enquire <span aria-hidden="true">→</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
