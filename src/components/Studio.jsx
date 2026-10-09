import { studio } from '../content.js';
import { SectionHead } from './Editorial.jsx';

export default function Studio() {
  const [first, ...others] = studio.columns;
  return (
    <section id="studio" className="section studio" aria-labelledby="studio-title">
      <div className="section__inner">
        <SectionHead label={studio.section} meta="An editorial profile" page="p. 6" />
        <div className="studio__grid">
          <div className="studio__main">
            <h2 id="studio-title" className="section-title studio__title" tabIndex={-1} data-section-heading>
              {studio.headline}
            </h2>
            <div className="studio__cols">
              <div className="studio__col reveal">
                <h3 className="col-head">{first.title}</h3>
                <p>
                  <span className="dropcap">{first.text[0]}</span>
                  {first.text.slice(1)}
                </p>
              </div>
              {others.map((c) => (
                <div key={c.title} className="studio__col reveal">
                  <h3 className="col-head">{c.title}</h3>
                  <p>{c.text}</p>
                </div>
              ))}
            </div>
            <blockquote className="pullquote reveal">
              <p>“{studio.pullQuote}”</p>
            </blockquote>
          </div>

          <aside className="studio__side" aria-label="Studio photograph and process">
            <figure className="studio__figure reveal-img">
              <div className="media media--mono">
                <img src={studio.image} alt={studio.imageAlt} loading="lazy" decoding="async" />
              </div>
              <figcaption className="caption">{studio.imageCaption}</figcaption>
            </figure>
            <div className="process">
              <h3 className="process__title">How a commission runs</h3>
              <ol className="process__list">
                {studio.process.map((s) => (
                  <li key={s.n} className="process__step reveal">
                    <span className="process__n">{s.n}</span>
                    <div>
                      <h4>{s.title}</h4>
                      <p>{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
