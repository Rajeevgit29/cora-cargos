import { forwardRef } from 'react';
import { frontPage, projects } from '../content.js';
import { ProjectImage, ReadLink, SampleTag, SectionHead } from './Editorial.jsx';

function Story({ project: p, vtSlug, onOpen }) {
  const isBrief = p.layout === 'brief';
  return (
    <article className={`story story--${p.layout || 'medium'} reveal`}>
      {isBrief ? (
        <p className="story__label">In brief</p>
      ) : (
        <figure className="story__figure reveal-img">
          <ProjectImage project={p} vtSlug={vtSlug} />
          {p.layout === 'image' && <figcaption className="caption">{p.imageAlt.replace(/^Sample artwork:\s*/i, '')}</figcaption>}
        </figure>
      )}
      <p className="kicker">
        {p.client} <span className="kicker__soft">— {p.discipline}</span>
      </p>
      <h3 className="story__head">{p.headline}</h3>
      <p className="story__summary">{p.summary}</p>
      {isBrief && (
        <figure className="story__thumb reveal-img">
          <ProjectImage project={p} vtSlug={vtSlug} />
        </figure>
      )}
      <div className="story__foot">
        <ReadLink project={p} onOpen={onOpen} />
        <SampleTag project={p} />
      </div>
    </article>
  );
}

const SelectedWork = forwardRef(function SelectedWork({ vtSlug, onOpen }, ref) {
  const stories = projects.filter((p) => p.slug !== frontPage.featuredSlug);
  return (
    <section ref={ref} id="work" className="section work" aria-labelledby="work-title">
      <div className="section__inner">
        <SectionHead label="Section A — Selected Work" meta={`${stories.length + 1} stories in this edition`} page="p. 2" />
        <div className="section-intro">
          <h2 id="work-title" className="section-title" tabIndex={-1} data-section-heading>
            The work, <em>as reported.</em>
          </h2>
          <p className="section-lede">
            Every project is filed like a story: the brief, the thinking and the finished work. Choose an article to read the full case
            study.
          </p>
        </div>
        <div className="work__grid">
          {stories.map((p) => (
            <Story key={p.slug} project={p} vtSlug={vtSlug} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </section>
  );
});

export default SelectedWork;
