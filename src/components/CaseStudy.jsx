import { allStories as projects, site } from '../content.js';
import { ProjectImage, ReadLink, SampleTag, storyHref } from './Editorial.jsx';
import { useLightbox } from './Lightbox.jsx';

export default function CaseStudy({ slug, vtSlug, onOpen, onNavigate }) {
  const index = projects.findIndex((p) => p.slug === slug);
  const project = projects[index];
  const openViewer = useLightbox();

  const back = (
    <a className="back-link" href="#/" onClick={() => onOpen?.(slug)}>
      <span aria-hidden="true">←</span> Back to the newspaper
    </a>
  );

  if (!project) {
    return (
      <main id="case" className="case case--missing">
        <div className="case__inner">
          <div className="case__topbar">{back}</div>
          <h1 id="case-title" className="case__title" tabIndex={-1}>
            This story is not in today’s edition.
          </h1>
          <p className="case__deck">The link may be out of date. Head back to the newspaper to browse the selected work.</p>
        </div>
      </main>
    );
  }

  const cs = project.caseStudy || {};
  const next = projects[(index + 1) % projects.length];
  const gallery = cs.gallery || [];
  const [heroA, heroB, ...plates] = gallery;
  const view = (img) =>
    openViewer(
      gallery.map((g) => ({ src: g.src, alt: g.alt, caption: g.caption })),
      gallery.indexOf(img),
      { title: `${project.client} — ${project.headline}` }
    );
  const Plate = ({ img, className }) => (
    <figure className={className}>
      <button type="button" className="case__zoom" onClick={() => view(img)} aria-label={`View larger: ${img.alt}`}>
        <img src={img.src} alt={img.alt} loading="lazy" decoding="async" />
      </button>
      {img.caption && <figcaption className="caption">{img.caption}</figcaption>}
    </figure>
  );

  return (
    <main id="case" className="case">
      <article className="case__inner" aria-labelledby="case-title">
        <div className="case__topbar">
          {back}
          <span className="case__folio">
            {site.name} — {project.sample ? 'Selected Work' : 'Case study'} — Story {String(index + 1).padStart(2, '0')} of {String(projects.length).padStart(2, '0')}
          </span>
        </div>
        <div className="rule-double" />

        <header className="case__header">
          <p className="kicker">
            Case study <span className="kicker__soft">— {project.discipline}</span>
          </p>
          <h1 id="case-title" className="case__title" tabIndex={-1}>
            {project.headline}
          </h1>
          {cs.deck && <p className="case__deck">{cs.deck}</p>}
          <dl className="case__meta">
            <div>
              <dt>Client</dt>
              <dd>{project.client}</dd>
            </div>
            <div>
              <dt>Discipline</dt>
              <dd>{project.discipline}</dd>
            </div>
            {project.sample && (
              <div>
                <dt>Status</dt>
                <dd>
                  <SampleTag project={project} />
                </dd>
              </div>
            )}
          </dl>
        </header>

        <figure className="case__hero">
          <ProjectImage project={{ ...project, treatment: 'color' }} vtSlug={slug} eager />
          <figcaption className="caption">{project.imageAlt}</figcaption>
        </figure>

        <div className="case__body">
          <aside className="case__aside">
            <div className="fact-box">
              <h2 className="fact-box__title">At a glance</h2>
              <dl>
                <dt>Client</dt>
                <dd>{project.client}</dd>
                <dt>Discipline</dt>
                <dd>{project.discipline}</dd>
                {cs.deliverables?.length > 0 && (
                  <>
                    <dt>Deliverables</dt>
                    <dd>
                      <ul>
                        {cs.deliverables.map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                      </ul>
                    </dd>
                  </>
                )}
              </dl>
            </div>
          </aside>

          <div className="case__text">
            {cs.brief && (
              <section className="case__section">
                <h2 className="case__subhead">{cs.briefTitle || 'The brief'}</h2>
                <p className="case__first">
                  <span className="dropcap">{cs.brief[0]}</span>
                  {cs.brief.slice(1)}
                </p>
              </section>
            )}

            {cs.approach?.length > 0 && (
              <section className="case__section">
                <h2 className="case__subhead">{cs.approachTitle || 'The approach'}</h2>
                {cs.approach.slice(0, 1).map((t) => (
                  <p key={t}>{t}</p>
                ))}
                {cs.approach.length > 1 && <blockquote className="pullquote pullquote--case">{firstSentence(cs.approach[1])}</blockquote>}
                {cs.approach.slice(1).map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </section>
            )}

            {cs.links?.length > 0 && (
              <div className="case__links">
                {cs.links.map((l) => (
                  <a key={l.url} className="btn-ink" href={l.url} target="_blank" rel="noopener noreferrer">
                    {l.label} <span aria-hidden="true">↗</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {heroA && <Plate img={heroA} className="case__wide" />}

        <div className="case__closing">
          {cs.deliverables?.length > 0 && (
            <section className="case__section case__deliverables">
              <h2 className="case__subhead">Deliverables</h2>
              <ol className="deliverables">
                {cs.deliverables.map((d, i) => (
                  <li key={d}>
                    <span className="deliverables__n">{String(i + 1).padStart(2, '0')}</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
          {heroB && <Plate img={heroB} className="case__inset" />}
        </div>

        {plates.length > 0 && (
          <section className="case__plates" aria-label="More from the project">
            <h2 className="case__subhead">More from the project</h2>
            <div className="plates-grid">
              {plates.map((img) => (
                <Plate key={img.src} img={img} className="plate-item" />
              ))}
            </div>
          </section>
        )}

        {cs.outcomes?.length > 0 && (
          <section className="case__section case__outcomes">
            <h2 className="case__subhead">Outcomes</h2>
            <ul>
              {cs.outcomes.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </section>
        )}

        <footer className="case__footer">
          <div className="rule-thick" />
          <div className="case__next">
            <div>
              <p className="kicker">Next story</p>
              <p className="case__next-title">
                <a href={storyHref(next.slug)} onClick={() => onOpen?.(next.slug)} className="case__next-link">
                  {next.headline}
                </a>
              </p>
              <p className="case__next-meta">
                {next.client} — {next.discipline}
              </p>
            </div>
            <div className="case__next-actions">
              <ReadLink project={next} onOpen={onOpen}>
                Read next
              </ReadLink>
              {back}
              <a
                className="text-link"
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('contact');
                }}
              >
                Start a project like this <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </footer>
      </article>
    </main>
  );
}

function firstSentence(text) {
  const m = text.match(/^(.+?[.!?])(\s|$)/);
  return m ? m[1] : text;
}
