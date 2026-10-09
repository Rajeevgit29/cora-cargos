import { forwardRef } from 'react';
import { frontPage, projects, site } from '../content.js';
import { editionDate } from '../lib/env.js';
import { keepHyphenated, ProjectImage, ReadLink, SampleTag } from './Editorial.jsx';

const INDEX = [
  { id: 'work', label: 'Selected Work', page: 'p. 2' },
  { id: 'studio', label: 'The Studio', page: 'p. 6' },
  { id: 'services', label: 'Services', page: 'p. 8' },
  { id: 'contact', label: 'Classifieds', page: 'p. 10' },
];

/*
 * The front page is also the inside of the 3D sheet: it is printed onto the
 * paper texture during the intro. Keep it to plain boxes, borders, text and
 * <img> (no pseudo-element content, gradients or shadows), so the printed
 * version and the live HTML stay identical. See intro/newspaper/rasterize.js.
 */
const FrontPage = forwardRef(function FrontPage({ vtSlug, onOpen, onNavigate }, ref) {
  const featured = projects.find((p) => p.slug === frontPage.featuredSlug) ?? projects[0];
  const [first, ...rest] = frontPage.intro;
  const go = (id) => (e) => {
    e.preventDefault();
    onNavigate(id);
  };

  return (
    <section ref={ref} id="front" className="front" aria-labelledby="front-headline">
      <div className="front__inner">
        <div className="folio">
          <span>
            {site.edition.number} — {site.edition.title}
          </span>
          <span className="folio__date">{editionDate()}</span>
          <span className="folio__price">{site.edition.price}</span>
        </div>
        <div className="rule-double" />

        <header className="mast">
          <div className="mast__ear">
            <span className="ear__label">In this edition</span>
            <span className="ear__text">Six stories from the studio</span>
          </div>
          <h1 className="mast__title">{site.name}</h1>
          <div className="mast__ear mast__ear--right">
            <span className="ear__label">Disciplines</span>
            <span className="ear__text">{site.edition.disciplines}</span>
          </div>
        </header>
        <p className="mast__sub">
          <span className="mast__line" aria-hidden="true" />
          <span>{site.descriptor}</span>
          <span className="mast__line" aria-hidden="true" />
        </p>

        <nav className="index-row" aria-label="In this edition">
          {INDEX.map((item) => (
            <a key={item.id} href={`#${item.id}`} onClick={go(item.id)} className="index-row__item">
              <span>{item.label}</span> <span className="index-row__page">{item.page}</span>
            </a>
          ))}
        </nav>
        <div className="rule-thick" />

        <div className="front__grid">
          <article className="lead">
            <p className="kicker">{frontPage.kicker}</p>
            <h2 id="front-headline" className="lead__head" tabIndex={-1} data-section-heading>
              {keepHyphenated(frontPage.headline)}
            </h2>
            <p className="lead__deck">{frontPage.deck}</p>
            <p className="lead__byline">
              By the {site.name} desk <span className="lead__dot">·</span> {site.edition.volume}
            </p>
            <div className="lead__body">
              <p>
                <span className="dropcap">{first[0]}</span>
                {first.slice(1)}
              </p>
              {rest.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </div>
            <div className="lead__actions">
              <a className="btn-ink" href="#work" onClick={go('work')}>
                See the work <span aria-hidden="true">↓</span>
              </a>
              <a className="text-link" href="#contact" onClick={go('contact')}>
                Start a project <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>

          <article className="featured story">
            <figure className="featured__figure">
              <ProjectImage project={featured} vtSlug={vtSlug} eager />
              <figcaption className="featured__cap">
                <span>Featured story</span>
                <SampleTag project={featured} />
              </figcaption>
            </figure>
            <p className="kicker">
              {featured.client} <span className="kicker__soft">— {featured.discipline}</span>
            </p>
            <h3 className="featured__head">{keepHyphenated(featured.headline)}</h3>
            <p className="featured__summary">{featured.summary}</p>
            <ReadLink project={featured} onOpen={onOpen} />
          </article>
        </div>
      </div>
    </section>
  );
});

export default FrontPage;
