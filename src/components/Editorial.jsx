// Small shared pieces of the newspaper's visual language.

export function SectionHead({ label, meta, page }) {
  return (
    <div className="section-head">
      <div className="section-head__row mono">
        <span>{label}</span>
        {meta && <span className="section-head__meta">{meta}</span>}
        {page && <span>{page}</span>}
      </div>
      <div className="rule-thick" />
    </div>
  );
}

/** Keeps hyphenated compounds ("front-page") from breaking across lines in headlines. */
export function keepHyphenated(text) {
  return text.split(/(\S+-\S+)/).map((part, i) =>
    i % 2 ? (
      <span key={i} className="nowrap">
        {part}
      </span>
    ) : (
      part
    )
  );
}

export const storyHref = (slug) => `#/work/${slug}`;

/** Project image with its colour treatment; carries the shared-element name for view transitions. */
export function ProjectImage({ project, vtSlug, className = '', eager = false, src, alt }) {
  return (
    <div
      className={`media media--${project.treatment || 'color'} ${className}`}
      style={vtSlug === project.slug ? { viewTransitionName: 'project-media' } : undefined}
    >
      <img src={src || project.image} alt={alt ?? project.imageAlt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
    </div>
  );
}

/** “Read the story” — the article's single link; it stretches over the whole article. */
export function ReadLink({ project, onOpen, children = 'Read the story' }) {
  return (
    <a
      className="read-link"
      href={storyHref(project.slug)}
      onClick={() => onOpen?.(project.slug)}
      aria-label={`${children}: ${project.headline}`}
    >
      {children} <span aria-hidden="true">→</span>
    </a>
  );
}

export function SampleTag({ project }) {
  if (!project.sample) return null;
  return <span className="tag">Sample project</span>;
}
