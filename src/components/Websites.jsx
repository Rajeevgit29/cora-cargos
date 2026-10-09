import { forwardRef } from 'react';
import { websites } from '../content.js';
import { SectionHead } from './Editorial.jsx';

const host = (item) => item.domain || 'live preview';

/** A browser window around a tall screenshot; hovering scrolls through the page. */
function Browser({ src, alt, address, size = 'full', eager = false }) {
  return (
    <div className={`browser browser--${size}`}>
      <div className="browser__bar" aria-hidden="true">
        <span className="browser__dots">
          <i />
          <i />
          <i />
        </span>
        <span className="browser__url">{address}</span>
      </div>
      <div className="browser__view">
        <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" width="1440" height="2400" />
      </div>
    </div>
  );
}

function Visit({ item, children = 'Visit the site' }) {
  return (
    <a className="read-link" href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`${children}: ${item.client} (opens in a new tab)`}>
      {children} <span aria-hidden="true">↗</span>
    </a>
  );
}

function SiteStory({ item }) {
  return (
    <article className={`story web-story web-story--${item.layout} reveal`}>
      <figure className="web-story__figure reveal-img">
        <Browser src={item.image} alt={`The ${item.client} website, designed by the studio`} address={host(item)} />
        {item.phone && (
          <div className="web-phone" aria-hidden="true">
            <img src={item.phone} alt="" loading="lazy" decoding="async" />
          </div>
        )}
      </figure>
      <p className="kicker">
        {item.client} <span className="kicker__soft">— {item.kind}</span>
      </p>
      <h3 className="story__head">{item.headline}</h3>
      <p className="story__summary">{item.summary}</p>
      <div className="story__foot">
        <Visit item={item} />
        <span className="tag">{item.sector}</span>
      </div>
    </article>
  );
}

function SiteFeature({ item }) {
  return (
    <article className="story web-feature reveal">
      <div className="web-feature__text">
        <p className="kicker">
          {item.client} <span className="kicker__soft">— {item.kind}</span>
        </p>
        <h3 className="story__head web-feature__head">{item.headline}</h3>
        <p className="story__summary">{item.summary}</p>
        <p className="web-feature__note">
          {item.variants.length} design directions · {item.sector}
        </p>
      </div>
      <ol className="web-feature__variants">
        {item.variants.map((v) => (
          <li key={v.url} className="web-variant">
            <a href={v.url} target="_blank" rel="noopener noreferrer" aria-label={`${item.client}, ${v.label} (opens in a new tab)`}>
              <Browser src={v.image} alt={`${item.client} landing page, ${v.label.toLowerCase()}`} address={v.label} size="mini" />
              <span className="web-variant__label">
                {v.label} <span aria-hidden="true">↗</span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </article>
  );
}

const Websites = forwardRef(function Websites(_, ref) {
  const { items } = websites;
  const live = items.reduce((n, i) => n + (i.variants ? i.variants.length : 1), 0);
  return (
    <section ref={ref} id="websites" className="section websites" aria-labelledby="websites-title">
      <div className="section__inner">
        <SectionHead label={websites.section} meta={`${items.length} projects · ${live} live links`} page="p. 2" />
        <div className="section-intro">
          <h2 id="websites-title" className="section-title" tabIndex={-1} data-section-heading>
            {websites.headline} <em>{websites.headlineEm}</em>
          </h2>
          <p className="section-lede">{websites.lede}</p>
        </div>
        <div className="work__grid web__grid">
          {items.map((item) => (item.variants ? <SiteFeature key={item.slug} item={item} /> : <SiteStory key={item.slug} item={item} />))}
        </div>
      </div>
    </section>
  );
});

export default Websites;
