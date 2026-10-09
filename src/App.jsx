import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { allStories, site } from './content.js';
import { introAllowed, parseRoute, prefersReducedMotion } from './lib/env.js';
import { initReveals } from './lib/reveal.js';

import NavBar from './components/NavBar.jsx';
import FrontPage from './components/FrontPage.jsx';
import SelectedWork from './components/SelectedWork.jsx';
import Websites from './components/Websites.jsx';
import PrintRoom from './components/PrintRoom.jsx';
import { LightboxProvider } from './components/Lightbox.jsx';
import Studio from './components/Studio.jsx';
import Services from './components/Services.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import CaseStudy from './components/CaseStudy.jsx';
import Intro from './intro/Intro.jsx';
import PrintPlates from './intro/PrintPlates.jsx';

gsap.registerPlugin(ScrollTrigger);

const SECTIONS = ['websites', 'print', 'work', 'studio', 'services', 'contact'];
const NAV_OFFSET = 56;

export default function App() {
  const [route, setRoute] = useState(parseRoute);
  const [intro, setIntro] = useState(introAllowed);
  const [introDone, setIntroDone] = useState(false);
  const [vtSlug, setVtSlug] = useState(null);
  const [active, setActive] = useState(null);
  const [enquiryType, setEnquiryType] = useState('');

  const pinRef = useRef(null);
  const frontRef = useRef(null);
  const spacerRef = useRef(null);
  const workRef = useRef(null);
  const platesRef = useRef(null);
  const paperRef = useRef(null);
  const introApi = useRef(null);

  const routeRef = useRef(route);
  routeRef.current = route;
  const paperScroll = useRef(null);
  const pendingAnchor = useRef(null);
  const reduced = prefersReducedMotion();

  /** Scroll position at which the intro has finished and the front page is in place. */
  const introEnd = useCallback(() => {
    if (!intro || !spacerRef.current || !pinRef.current) return 0;
    return pinRef.current.offsetTop + spacerRef.current.offsetHeight;
  }, [intro]);

  const sectionTop = useCallback(
    (id) => {
      if (id === 'front') return introEnd();
      const el = document.getElementById(id);
      if (!el) return null;
      return el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    },
    [introEnd]
  );

  const focusHeading = (id) => {
    const h = document.querySelector(`#${id} [data-section-heading]`);
    h?.focus({ preventScroll: true });
  };

  const goToSection = useCallback(
    (id, { smooth = true } = {}) => {
      if (routeRef.current.name !== 'paper') {
        pendingAnchor.current = id;
        location.hash = '#/';
        return;
      }
      const y = sectionTop(id);
      if (y == null) return;
      window.scrollTo({ top: y, behavior: smooth && !reduced ? 'smooth' : 'auto' });
      focusHeading(id);
    },
    [reduced, sectionTop]
  );

  const skipIntro = useCallback(() => {
    if (introApi.current) introApi.current.finish();
    else window.scrollTo({ top: introEnd(), behavior: 'auto' });
    focusHeading('front');
  }, [introEnd]);

  /** Prepare the shared-element morph before the hash changes. */
  const openProject = useCallback((slug) => {
    flushSync(() => setVtSlug(slug));
  }, []);

  // Hash routing with restrained view transitions.
  useEffect(() => {
    const onHash = () => {
      const next = parseRoute();
      const prev = routeRef.current;
      if (prev.name === next.name && prev.slug === next.slug) {
        if (next.anchor) goToSection(next.anchor);
        return;
      }
      if (prev.name === 'paper') paperScroll.current = window.scrollY;
      const apply = () => {
        flushSync(() => setRoute(next));
        if (next.name === 'case') {
          window.scrollTo(0, 0);
        } else {
          ScrollTrigger.refresh();
          const anchor = pendingAnchor.current || next.anchor;
          pendingAnchor.current = null;
          const y = anchor ? sectionTop(anchor) : (paperScroll.current ?? sectionTop('work'));
          window.scrollTo(0, y ?? 0);
        }
      };
      if (document.startViewTransition && !reduced) document.startViewTransition(apply);
      else apply();
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [goToSection, reduced, sectionTop]);

  // Deep link to a section on first load (e.g. /#contact).
  useEffect(() => {
    const r = parseRoute();
    if (r.name === 'paper' && r.anchor) requestAnimationFrame(() => goToSection(r.anchor, { smooth: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Document title + focus for the current route.
  useEffect(() => {
    if (route.name === 'case') {
      const p = allStories.find((x) => x.slug === route.slug);
      document.title = p ? `${p.headline} — ${site.name}` : `Story not found — ${site.name}`;
      document.getElementById('case-title')?.focus({ preventScroll: true });
    } else {
      document.title = `${site.name} — ${site.descriptor}`;
    }
  }, [route]);

  // Reveal-on-scroll for the newspaper below the front page.
  useEffect(() => {
    if (route.name !== 'paper' || !paperRef.current) return;
    return initReveals(paperRef.current);
  }, [route.name]);

  // Active section in the nav.
  useEffect(() => {
    if (route.name !== 'paper') return;
    const els = SECTIONS.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [route.name]);

  const onIntroProgress = useCallback((p) => {
    setIntroDone((done) => (p >= 0.97 ? true : p < 0.95 ? false : done));
  }, []);

  const onIntroFail = useCallback(() => {
    setIntro(false);
    window.scrollTo(0, 0);
  }, []);

  const enquireAbout = useCallback(
    (type) => {
      setEnquiryType(type);
      goToSection('contact');
    },
    [goToSection]
  );

  const isCase = route.name === 'case';
  const navVisible = isCase || !intro || introDone;

  return (
    <LightboxProvider>
      <a className="skip-link" href="#front" onClick={(e) => (e.preventDefault(), intro ? skipIntro() : goToSection('front'))}>
        Skip to the front page
      </a>

      <NavBar visible={navVisible} active={isCase ? 'work' : active} onNavigate={goToSection} />

      {isCase && <CaseStudy slug={route.slug} vtSlug={vtSlug} onOpen={openProject} onNavigate={goToSection} />}

      <div ref={paperRef} className="paper" hidden={isCase}>
        <main id="main">
          <div ref={pinRef} className={intro ? 'pin pin--intro' : 'pin'}>
            {intro && (
              <Intro
                pinRef={pinRef}
                frontRef={frontRef}
                spacerRef={spacerRef}
                afterRef={workRef}
                platesRef={platesRef}
                apiRef={introApi}
                active={!isCase}
                onProgress={onIntroProgress}
                onSkip={skipIntro}
                onFail={onIntroFail}
              />
            )}
            <FrontPage ref={frontRef} vtSlug={vtSlug} onOpen={openProject} onNavigate={goToSection} />
            {intro && <div ref={spacerRef} className="pin__spacer" aria-hidden="true" />}
          </div>

          <Websites ref={workRef} />
          <PrintRoom onOpen={openProject} />
          <SelectedWork vtSlug={vtSlug} onOpen={openProject} />
          <Studio />
          <Services onEnquire={enquireAbout} />
          <Contact enquiryType={enquiryType} onTypeChange={setEnquiryType} />
        </main>
        <Footer onNavigate={goToSection} onReplay={intro ? () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }) : null} />
      </div>

      {intro && <PrintPlates ref={platesRef} />}
    </LightboxProvider>
  );
}
