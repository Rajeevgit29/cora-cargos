import { useState } from 'react';
import { printRoom, stories } from '../content.js';
import { ReadLink, SectionHead } from './Editorial.jsx';
import { useLightbox } from './Lightbox.jsx';

const toItems = (list) => list.map((i) => ({ src: i.src, alt: i.alt, caption: i.title || i.caption }));

function BlockHead({ title, meta }) {
  return (
    <div className="print-block__head">
      <h3>{title}</h3>
      {meta && <span>{meta}</span>}
    </div>
  );
}

/* The lead story: Ascent, with its own case study. */
function Feature({ story, onOpen }) {
  const open = useLightbox();
  const thumbs = printRoom.featureThumbs;
  const gallery = [{ src: story.image, alt: story.imageAlt, caption: 'The Ascent wordmark.' }, ...story.caseStudy.gallery];
  const site = story.caseStudy.links?.[0];
  return (
    <article className="story print-feature reveal">
      <figure className="print-feature__figure reveal-img">
        <div className="media media--color">
          <img src={story.image} alt={story.imageAlt} loading="lazy" decoding="async" />
        </div>
      </figure>
      <div className="print-feature__text">
        <p className="kicker">
          {story.client} <span className="kicker__soft">— {story.discipline}</span>
        </p>
        <h3 className="story__head print-feature__head">{story.headline}</h3>
        <p className="story__summary">{story.summary}</p>
        <ul className="print-feature__thumbs" aria-label="Ascent identity in use">
          {thumbs.map((t) => (
            <li key={t.src}>
              <button
                type="button"
                className="thumb-btn"
                onClick={() => open(gallery, Math.max(0, gallery.findIndex((g) => g.src === t.src)), { title: 'Ascent — brand identity' })}
                aria-label={`View larger: ${t.alt}`}
              >
                <img src={t.src} alt="" loading="lazy" decoding="async" />
              </button>
            </li>
          ))}
        </ul>
        <div className="story__foot">
          <ReadLink project={story} onOpen={onOpen} />
          {site && (
            <a className="text-link print-feature__site" href={site.url} target="_blank" rel="noopener noreferrer">
              {site.label} <span aria-hidden="true">↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

/* A deck or brochure, shown as a printed document with its pages beneath. */
function Publication({ pub }) {
  const open = useLightbox();
  const items = pub.pages.map((p, i) => ({ src: p.src, thumb: p.thumb, alt: `${pub.title}, ${pub.unit === 'slides' ? 'slide' : 'page'} ${i + 1}` }));
  const read = (i = 0) => open(items, i, { title: `${pub.client} — ${pub.title}`, unit: pub.unit });
  const preview = pub.pages.slice(1, 5);
  const verb = pub.format === 'slides' ? 'deck' : 'brochure';
  return (
    <article className={`pub pub--${pub.format} reveal`}>
      <button type="button" className="pub__cover" onClick={() => read(0)} aria-label={`Open the ${pub.title} — ${pub.pages.length} ${pub.unit}`}>
        <span className="pub__stack" aria-hidden="true">
          {pub.format === 'a4' && <img className="pub__under" src={pub.pages[1].thumb} alt="" loading="lazy" decoding="async" />}
          <img className="pub__page" src={pub.pages[0].src} alt="" loading="lazy" decoding="async" />
        </span>
        <span className="pub__open" aria-hidden="true">
          Open the {verb} ↗
        </span>
      </button>
      <p className="kicker">
        {pub.client} <span className="kicker__soft">— {pub.kind}</span>
      </p>
      <h4 className="pub__title">{pub.title}</h4>
      <p className="pub__summary">{pub.summary}</p>
      <ol className="pub__pages" aria-label={`Jump to a ${pub.unit === 'slides' ? 'slide' : 'page'}`}>
        {preview.map((p, i) => (
          <li key={p.thumb}>
            <button type="button" className="thumb-btn" onClick={() => read(i + 1)} aria-label={`${pub.unit === 'slides' ? 'Slide' : 'Page'} ${i + 2}`}>
              <img src={p.thumb} alt="" loading="lazy" decoding="async" />
            </button>
          </li>
        ))}
        <li>
          <button type="button" className="pub__more" onClick={() => read(0)}>
            {pub.pages.length}
            <span>{pub.unit}</span>
          </button>
        </li>
      </ol>
    </article>
  );
}

function Wall({ items, all = items, revealCount = items.length, title, className }) {
  const open = useLightbox();
  const viewer = toItems(all);
  return (
    <ul className={`wall ${className || ''}`}>
      {items.map((it, i) => (
        <li key={it.src} className={`wall__item${i < revealCount ? ' reveal' : ''}`}>
          <button type="button" className="wall__btn" onClick={() => open(viewer, all.indexOf(it), { title })} aria-label={`View larger: ${it.title}`}>
            <img src={it.src} alt={it.alt} loading="lazy" decoding="async" />
          </button>
          <p className="wall__caption">{it.title}</p>
        </li>
      ))}
    </ul>
  );
}

export default function PrintRoom({ onOpen }) {
  const story = stories.find((s) => s.slug === printRoom.feature);
  const { publications, social, merch } = printRoom;
  const [allMerch, setAllMerch] = useState(false);
  const shown = allMerch ? merch.items : merch.items.slice(0, merch.initial);
  const pieces = publications.length + social.items.length + merch.items.length + 1;
  return (
    <section id="print" className="section print" aria-labelledby="print-title">
      <div className="section__inner">
        <SectionHead label={printRoom.section} meta={`${pieces} pieces · identity, print & merch`} page="p. 3" />
        <div className="section-intro">
          <h2 id="print-title" className="section-title" tabIndex={-1} data-section-heading>
            {printRoom.headline} <em>{printRoom.headlineEm}</em>
          </h2>
          <p className="section-lede">{printRoom.lede}</p>
        </div>

        {story && <Feature story={story} onOpen={onOpen} />}

        <div className="print-block">
          <BlockHead title="Decks & brochures" meta={`${publications.length} publications · select to page through`} />
          <div className="pubs">
            {publications.map((p) => (
              <Publication key={p.slug} pub={p} />
            ))}
          </div>
        </div>

        <div className="print-block">
          <BlockHead title={social.title} meta={`${social.items.length} pieces`} />
          <Wall items={social.items} title={social.title} className="wall--posters" />
        </div>

        <div className="print-block">
          <BlockHead title={merch.title} meta={`${merch.items.length} pieces`} />
          <Wall items={shown} all={merch.items} revealCount={merch.initial} title={merch.title} className="wall--merch" />
          {merch.items.length > merch.initial && (
            <div className="print-block__more">
              <button type="button" className="btn-ink" onClick={() => setAllMerch((v) => !v)} aria-expanded={allMerch}>
                {allMerch ? 'Show fewer' : `Show all ${merch.items.length} pieces`} <span aria-hidden="true">{allMerch ? '↑' : '↓'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
