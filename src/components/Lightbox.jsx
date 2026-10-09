import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

/*
 * Full-size viewer for galleries and the page-through reader for decks and
 * brochures. A native <dialog>: focus is trapped while open and returns to
 * the opener on close. Keys: ← → to turn, Home/End, Esc to close. Swipe on touch.
 *
 * Use:  const open = useLightbox();  open(items, startIndex, { title, unit })
 *   items: [{ src, alt, caption?, thumb? }]
 */

const LightboxContext = createContext(() => {});
export const useLightbox = () => useContext(LightboxContext);

export function LightboxProvider({ children }) {
  const [state, setState] = useState(null);
  const opener = useRef(null);
  const open = useCallback((items, index = 0, options = {}) => {
    if (!items?.length) return;
    opener.current = document.activeElement;
    setState({ items, index, ...options });
  }, []);
  const close = useCallback(() => {
    setState(null);
    // After the dialog has unmounted, so its own focus handling does not win.
    requestAnimationFrame(() => opener.current?.focus?.({ preventScroll: true }));
  }, []);
  return (
    <LightboxContext.Provider value={open}>
      {children}
      {state && <Lightbox {...state} onClose={close} onIndex={(index) => setState((s) => ({ ...s, index }))} />}
    </LightboxContext.Provider>
  );
}

function Lightbox({ items, index, title, unit = 'images', onClose, onIndex }) {
  const dialog = useRef(null);
  const strip = useRef(null);
  const touch = useRef(null);
  const count = items.length;
  const item = items[index];
  const go = useCallback((i) => onIndex(Math.max(0, Math.min(count - 1, i))), [count, onIndex]);

  useEffect(() => {
    const d = dialog.current;
    d.showModal();
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = prev;
      if (d.open) d.close();
    };
  }, []);

  // Preload the neighbours so turning a page feels instant.
  useEffect(() => {
    [index - 1, index + 1].forEach((i) => {
      if (items[i]) new Image().src = items[i].src;
    });
    strip.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [index, items]);

  const onKey = (e) => {
    if (e.key === 'ArrowRight') go(index + 1);
    else if (e.key === 'ArrowLeft') go(index - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(count - 1);
    else return;
    e.preventDefault();
  };

  const onTouchStart = (e) => (touch.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touch.current == null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    touch.current = null;
    if (Math.abs(dx) > 48) go(index + (dx < 0 ? 1 : -1));
  };

  const label = unit === 'pages' ? 'Page' : unit === 'slides' ? 'Slide' : 'Image';
  const hasThumbs = items.some((i) => i.thumb) && count > 1;

  return (
    <dialog
      ref={dialog}
      className="lightbox"
      aria-label={title || 'Image viewer'}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={onKey}
      onClick={(e) => e.target === dialog.current && onClose()}
    >
      <div className="lightbox__frame">
        <header className="lightbox__bar">
          <p className="lightbox__title">{title}</p>
          <p className="lightbox__count" aria-live="polite">
            {label} {index + 1} <span>of {count}</span>
          </p>
          <button type="button" className="lightbox__close" onClick={onClose} aria-label="Close viewer">
            Close <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="lightbox__stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <img key={item.src} src={item.src} alt={item.alt || ''} className="lightbox__img" decoding="async" />
          {count > 1 && (
            <>
              <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => go(index - 1)} disabled={index === 0} aria-label={`Previous ${label.toLowerCase()}`}>
                <span aria-hidden="true">←</span>
              </button>
              <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => go(index + 1)} disabled={index === count - 1} aria-label={`Next ${label.toLowerCase()}`}>
                <span aria-hidden="true">→</span>
              </button>
            </>
          )}
        </div>

        {(item.caption || item.title) && <p className="lightbox__caption">{item.caption || item.title}</p>}

        {hasThumbs && (
          <ol ref={strip} className="lightbox__strip" aria-label={`${label}s`}>
            {items.map((it, i) => (
              <li key={it.src}>
                <button type="button" onClick={() => go(i)} aria-current={i === index ? 'true' : undefined} aria-label={`${label} ${i + 1}`}>
                  <img src={it.thumb || it.src} alt="" loading="lazy" decoding="async" />
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </dialog>
  );
}
