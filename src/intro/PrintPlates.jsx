import { forwardRef, useImperativeHandle, useRef } from 'react';
import { frontPage, projects, services, site, studio, websites } from '../content.js';
import { editionDate } from '../lib/env.js';
import { keepHyphenated } from '../components/Editorial.jsx';

/*
 * Print plates: offscreen HTML pages laid out at fixed sizes, then printed onto
 * the outside of the 3D sheet (see newspaper/textures.js). Designing them in
 * HTML/CSS keeps the typography identical to the website.
 *   cover   — the folded front you see on the table (1200 × 800)
 *   edition — revealed by the first unfold: "Inside this edition" (1200 × 1600)
 *   back    — the back page, facing the table (1200 × 800)
 *   filler  — the left-hand inside page on phones, where the camera frames
 *             only the right page (1200 × 1600)
 */
const PrintPlates = forwardRef(function PrintPlates(_, ref) {
  const cover = useRef(null);
  const edition = useRef(null);
  const back = useRef(null);
  const filler = useRef(null);
  useImperativeHandle(ref, () => ({
    get cover() {
      return cover.current;
    },
    get edition() {
      return edition.current;
    },
    get back() {
      return back.current;
    },
    get filler() {
      return filler.current;
    },
    get root() {
      return cover.current?.parentElement;
    },
  }));

  const featured = projects.find((p) => p.slug === frontPage.featuredSlug) ?? projects[0];
  const date = editionDate();
  const [studioFirst, ...studioRest] = studio.columns;

  return (
    <div className="plates" aria-hidden="true" inert>
      {/* COVER ------------------------------------------------------------ */}
      <div ref={cover} className="plate plate--quarter plate-cover">
        <div className="pl-folio">
          <span>
            {site.edition.number} — {site.edition.title}
          </span>
          <span>{date}</span>
          <span>{site.edition.price}</span>
        </div>
        <div className="pl-rule-double" />
        <div className="pl-mast">{site.name}</div>
        <div className="pl-sub">
          <span className="pl-line" />
          <span>{site.descriptor}</span>
          <span className="pl-line" />
        </div>
        <div className="pl-rule-thick" />
        <div className="pl-cover-grid">
          <div className="pl-cover-text">
            <p className="pl-kicker">{frontPage.kicker}</p>
            <p className="pl-head">{keepHyphenated(frontPage.headline)}</p>
            <p className="pl-deck">{frontPage.deck}</p>
          </div>
          <div className="pl-cover-fig">
            <img src={featured.image} alt="" />
            <div className="pl-caption">
              <span>Selected work — {featured.client}</span>
              <span>Inside, p. 2</span>
            </div>
          </div>
        </div>
        <div className="pl-unfold">
          <span className="pl-unfold__line" />
          <span className="pl-unfold__box">Scroll to unfold ↓</span>
          <span className="pl-unfold__line" />
        </div>
      </div>

      {/* INSIDE THIS EDITION ---------------------------------------------- */}
      <div ref={edition} className="plate plate--page plate-edition">
        <div className="pl-folio">
          <span>{site.name}</span>
          <span>Inside this edition</span>
          <span>p. 1a</span>
        </div>
        <div className="pl-rule-double" />
        <p className="pl-big">
          Inside <em>this edition</em>
        </p>
        <div className="pl-rule-thick" />
        <div className="pl-index">
          {[
            ['01', 'Front Page', frontPage.headline, '1'],
            ['02', 'Websites', `${websites.items.length} sites, designed and live`, '2'],
            ['03', 'Selected Work', `${projects.length} stories from the studio`, '4'],
            ['04', 'The Studio', 'Who we are and how we work', '6'],
            ['05', 'Services', `A directory of ${services.items.length} disciplines`, '8'],
            ['06', 'Classifieds', 'Your next big story starts here', '10'],
          ].map(([n, title, dek, page]) => (
            <div className="pl-index__row" key={n}>
              <span className="pl-index__n">{n}</span>
              <span className="pl-index__title">{title}</span>
              <span className="pl-index__dek">{dek}</span>
              <span className="pl-index__dots" />
              <span className="pl-index__page">{page}</span>
            </div>
          ))}
        </div>
        <div className="pl-thumbs">
          {websites.items.slice(0, 6).map((w) => (
            <div className="pl-thumb pl-thumb--site" key={w.slug}>
              <img src={w.image} alt="" />
              <span className="pl-thumb__client">{w.client}</span>
              <span className="pl-thumb__head">{w.headline}</span>
            </div>
          ))}
        </div>
        <div className="pl-rule" />
        <p className="pl-quote">“{studio.pullQuote}”</p>
        <div className="pl-open">
          <span>Open the edition</span>
          <span>→</span>
        </div>
      </div>

      {/* BACK PAGE ------------------------------------------------------- */}
      <div ref={back} className="plate plate--quarter plate-back">
        <div className="pl-folio">
          <span>{site.name}</span>
          <span>Back page</span>
          <span>p. 12</span>
        </div>
        <div className="pl-rule-double" />
        <p className="pl-head pl-head--small">Correspondence</p>
        <div className="pl-back-cols">
          <p>Write to the studio at {site.contact.email}.</p>
          <p>{site.contact.socials.map((s) => `${s.label}: ${s.handle}`).join(' · ')}</p>
          <p>Printed and published by {site.name}.</p>
        </div>
      </div>

      {/* FILLER (phones: left-hand inside page) --------------------------- */}
      <div ref={filler} className="plate plate--page plate-filler">
        <div className="pl-folio">
          <span>{site.name}</span>
          <span>Studio notebook</span>
          <span>p. 1b</span>
        </div>
        <div className="pl-rule-double" />
        <p className="pl-big pl-big--left">{studio.headline}</p>
        <div className="pl-rule-thick" />
        <div className="pl-filler-cols">
          <div>
            <p className="pl-kicker">{studioFirst.title}</p>
            <p className="pl-body">{studioFirst.text}</p>
          </div>
          {studioRest.map((c) => (
            <div key={c.title}>
              <p className="pl-kicker">{c.title}</p>
              <p className="pl-body">{c.text}</p>
            </div>
          ))}
        </div>
        <img className="pl-filler-img pl-mono" src={studio.image} alt="" />
        <p className="pl-quote">“{studio.pullQuote}”</p>
      </div>
    </div>
  );
});

export default PrintPlates;
