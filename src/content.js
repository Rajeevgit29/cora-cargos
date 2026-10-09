/*
 * ─────────────────────────────────────────────────────────────────────────────
 *  KORA KAAGAZ — EDITION CONTENT
 *  Everything a visitor reads lives in this file: studio details, projects,
 *  case studies, services and contact links. Edit here; the newspaper, the
 *  printed 3D intro and the case-study pages all update from this source.
 *
 *  ⚠ SAMPLE CONTENT: the six projects, their clients and imagery are fictional
 *  placeholders, as are the email address and social handles. They are marked
 *  `sample: true` and labelled on the page. Replace them with real work, then
 *  set `site.sampleNotice` to false.
 *
 *  Images: put files in /public/work and reference them as '/work/name.jpg'.
 *  Same-origin images are recommended — the intro prints the featured image
 *  into a WebGL texture, which needs CORS-enabled images if hosted elsewhere.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const site = {
  name: 'Kora Kaagaz',
  descriptor: 'Independent Creative Studio',
  sampleNotice: true,

  edition: {
    volume: 'Vol. 01',
    number: 'No. 01',
    title: 'The Portfolio Edition',
    price: 'Price: one good conversation',
    disciplines: 'Brand · Digital · Campaign',
  },

  contact: {
    email: 'hello@korakaagaz.com', // REPLACE with your studio address
    enquirySubject: 'New story for Kora Kaagaz',
    socials: [
      // REPLACE handles and URLs with your own profiles
      { label: 'Instagram', handle: '@korakaagaz', url: 'https://www.instagram.com/korakaagaz' },
      { label: 'LinkedIn', handle: 'Kora Kaagaz', url: 'https://www.linkedin.com/company/korakaagaz' },
      { label: 'Behance', handle: 'korakaagaz', url: 'https://www.behance.net/korakaagaz' },
    ],
  },
};

export const frontPage = {
  kicker: 'Front Page — Studio News',
  headline: 'Good ideas deserve front-page attention.',
  deck: 'Kora Kaagaz is an independent creative studio making brands, websites and campaigns that people stop to read.',
  intro: [
    'We work with founders, cultural institutions and growing companies who need their story told clearly — and noticed. Identity, editorial design, digital experiences and campaigns, carried by one editorial eye from first sketch to final print.',
    'This edition collects selected stories from the studio. Turn the page for the work, the people behind it, and how to commission a front page of your own.',
  ],
  featuredSlug: 'marigold-ferry',
};

/*
 * WEBSITES — real, live sites designed by the studio (shown before the
 * case-study samples). Screenshots live in /public/work/web. Copy here only
 * describes what each site is; add outcomes only if they are verified.
 *   layout: 'lead' | 'column' | 'feature' (with variants) | 'third'
 *   domain: shown in the browser bar; leave null for preview hosting
 */
export const websites = {
  section: 'Section A — On the Web',
  headline: 'Websites, designed here and',
  headlineEm: 'live now.',
  lede: 'A selection of sites designed by the studio. Every one is live — open any of them in a new tab and look around.',
  items: [
    {
      slug: 'splayed',
      client: 'Splayed',
      kind: 'Product website',
      sector: 'Media search app',
      headline: 'Find any moment in your media.',
      summary:
        'Website for Splayed, a private, on-device media search app for Apple Silicon that finds the exact moment in video, audio and images by what is inside them — from the app, Premiere Pro, DaVinci Resolve and AI assistants.',
      url: 'https://splayed.ai/',
      domain: 'splayed.ai',
      image: '/work/web/splayed.webp',
      phone: '/work/web/splayed-phone.webp',
      layout: 'lead',
    },
    {
      slug: 'symbiotes',
      client: 'Symbiotes',
      kind: 'Agency website',
      sector: 'Media agency',
      headline: 'Attention is the whole game now.',
      summary:
        'Website for Symbiotes, a media agency for brands that need to be watched, not just seen — strategy, creative and production across video, social, static and AI-assisted work.',
      url: 'https://symbiotes-pied.vercel.app/',
      domain: null,
      image: '/work/web/symbiotes.webp',
      layout: 'column',
    },
    {
      slug: 'genc',
      client: 'Gen C by AEOS',
      kind: 'Landing page & funnel',
      sector: 'Personal brand strategy',
      headline: 'Find the niche only you can own.',
      summary:
        'A quiz-led funnel for founders, experts and marketers: six questions in five minutes produce a personal niche document. We designed it in four directions — each one is live.',
      url: 'https://html-link-converter.ashmitknayak.workers.dev/24668ytt/#strategy',
      domain: null,
      image: '/work/web/genc-v1.webp',
      layout: 'feature',
      variants: [
        { label: 'Direction 01', url: 'https://html-link-converter.ashmitknayak.workers.dev/24668ytt/#strategy', image: '/work/web/genc-v1.webp' },
        { label: 'Direction 02', url: 'https://html-link-converter.ashmitknayak.workers.dev/bz726p8h/', image: '/work/web/genc-v2.webp' },
        { label: 'Direction 03', url: 'https://html-link-converter.ashmitknayak.workers.dev/9vpwx4bj/', image: '/work/web/genc-v3.webp' },
        { label: 'Direction 04', url: 'https://html-link-converter.ashmitknayak.workers.dev/kjc45jks/', image: '/work/web/genc-v4.webp' },
      ],
    },
    {
      slug: 'ascent',
      client: 'Ascent',
      kind: 'Event website',
      sector: 'Campus festival',
      headline: 'Escape the ordinary.',
      summary:
        'Website for Ascent 2026, a two-day campus festival of twenty-four events for builders, tinkerers and the genuinely curious — with a live countdown, event listings, sponsors and registration.',
      url: 'https://darshannahata5555-cpu.github.io/ascent-website/',
      domain: null,
      image: '/work/web/ascent.webp',
      layout: 'third',
    },
    {
      slug: 'supermatrix',
      client: 'SuperMatrix',
      kind: 'Financial services website',
      sector: 'Mutual fund distribution',
      headline: 'Making mutual fund investing simple.',
      summary:
        'Website for SuperMatrix, an AMFI-registered mutual fund distributor in Mumbai, bringing mutual funds, SIPs, SWPs, ELSS, PMS and goal-based investing together in one place.',
      url: 'https://supermatrix.in/',
      domain: 'supermatrix.in',
      image: '/work/web/supermatrix.webp',
      layout: 'third',
    },
    {
      slug: 'acepro',
      client: 'AcePro Advisors',
      kind: 'Financial services website',
      sector: 'Portfolio management',
      headline: 'Purposeful investing. Enduring wealth.',
      summary:
        'Website for AcePro Advisors, a SEBI-registered portfolio manager, presenting its research-led strategies across PMS, AIF and fund of funds, with a dedicated investor corner.',
      url: 'https://darshannahata5555-cpu.github.io/acepro-website/',
      domain: null,
      image: '/work/web/acepro.webp',
      layout: 'third',
    },
  ],
};

/*
 * REAL CASE STUDIES — studio work with its own story page (#/work/<slug>).
 * Same shape as `projects` below. Copy describes the work as delivered;
 * add outcomes only if they are verified.
 */
export const stories = [
  {
    slug: 'ascent-identity',
    client: 'Scaler School of Technology',
    discipline: 'Brand identity — Ascent Techfest ’26',
    headline: 'Ascent: a techfest identity built to escape the ordinary',
    summary:
      'A complete identity for Ascent, the techfest of Scaler School of Technology — a heavy, angular wordmark on midnight indigo, carried across merchandise, badges, apparel, social, the website and the venue.',
    image: '/work/print/ascent/identity-01.webp',
    imageAlt: 'The Ascent wordmark with “Escape the Ordinary” and “Techfest 26” on a midnight-indigo background.',
    treatment: 'color',
    caseStudy: {
      deck: 'One system for a two-day techfest, from the wordmark to the lanyard, the tote bag, the feed and the front door.',
      briefTitle: 'The project',
      brief:
        'Ascent is the techfest of Scaler School of Technology, themed “Escape the Ordinary”. Its identity had to work everywhere the festival appears: on screens and social feeds, on campus and at the venue, and on everything attendees take home.',
      approachTitle: 'The identity',
      approach: [
        'The wordmark is drawn from heavy, angular letterforms with a cut through the A, so it reads as momentum and holds up at the size of a badge as well as a banner. It sits on a midnight-indigo ground with warm, sand-coloured type.',
        'Typography pairs Tan Pearl, a display serif for titles and captions, with Montserrat for body text, so the system can move between ceremony and information.',
        'Illustration carries the theme — winding roads, open doorways and a rocket leaving the ground — across the notebook, tote, mugs, jacket and poster.',
        'The same system extends to sticker sheets, ID badges, social posts, sponsor announcements, the event website and branding at the venue entrance.',
      ],
      deliverables: ['Wordmark & logo', 'Typography system', 'Illustration', 'Event merchandise', 'Apparel', 'ID badges & lanyards', 'Sticker sheets', 'Posters & social media', 'Event website', 'On-ground branding'],
      links: [{ label: 'Visit the Ascent website', url: 'https://darshannahata5555-cpu.github.io/ascent-website/' }],
      gallery: [
        { src: '/work/print/ascent/identity-03.webp', alt: 'Ascent typography: Tan Pearl for titles and Montserrat for body text.', caption: 'Typography: Tan Pearl for titles, Montserrat for text.' },
        { src: '/work/print/ascent/identity-05.webp', alt: 'Ascent notebook, mugs and tote bag on dark stone.', caption: 'Notebook, mugs and tote.' },
        { src: '/work/print/ascent/identity-07.webp', alt: 'Ascent ID badges on lanyards, front and back.', caption: 'ID badges and lanyards.' },
        { src: '/work/print/ascent/identity-08.webp', alt: 'Black Ascent bomber jacket, front and back.', caption: 'The crew jacket.' },
        { src: '/work/print/ascent/identity-06.webp', alt: 'Two Ascent sticker sheets with code-themed stickers.', caption: 'Sticker sheets.' },
        { src: '/work/print/ascent/identity-04.webp', alt: 'The Ascent website on a laptop, with a live countdown.', caption: 'The event website.' },
        { src: '/work/print/ascent/identity-09.webp', alt: 'A collage of Ascent social posts and sponsorship slides.', caption: 'Social posts and sponsorship material.' },
        { src: '/work/print/ascent/identity-10.webp', alt: 'Ascent platform screens on a laptop and tablet.', caption: 'Platform screens.' },
        { src: '/work/print/ascent/onground.webp', alt: 'The Ascent venue entrance with branded arch and standees.', caption: 'On the ground: the venue entrance.' },
        { src: '/work/print/social/ascent-poster.webp', alt: 'Ascent event poster with a rocket lifting off.', caption: 'Event poster.' },
        { src: '/work/print/social/ascent-omium.webp', alt: 'Ascent social post announcing Omium as an event sponsor.', caption: 'Sponsor announcement.' },
        { src: '/work/print/merch/ascent-tees.webp', alt: 'Two black Ascent T-shirts, front and back.', caption: 'Festival T-shirts.' },
        { src: '/work/print/merch/ascent-badge.webp', alt: 'Round Ascent pin badge with a rocket illustration.', caption: 'Pin badge.' },
        { src: '/work/print/merch/ascent-notebook.webp', alt: 'Ascent spiral notebook with a winding-road illustration.', caption: 'Notebook.' },
        { src: '/work/print/merch/ascent-tote.webp', alt: 'Black Ascent tote bag with a doorway illustration.', caption: 'Tote bag.' },
        { src: '/work/print/merch/ascent-mugs.webp', alt: 'Two black Ascent mugs.', caption: 'Mugs.' },
        { src: '/work/print/ascent/identity-02.webp', alt: 'The Ascent team photographed together in festival T-shirts.', caption: 'The team, in the festival colours.' },
      ],
      outcomes: [],
    },
  },
];

const PRINT = '/work/print';
const pages = (dir, n, { skip = [], prefix = 'page' } = {}) =>
  Array.from({ length: n }, (_, i) => i + 1)
    .filter((i) => !skip.includes(i))
    .map((i) => {
      const k = String(i).padStart(2, '0');
      return { src: `${PRINT}/${dir}/${prefix}-${k}.webp`, thumb: `${PRINT}/${dir}/thumb-${k}.webp` };
    });

/*
 * THE PRINT ROOM — identity, decks, brochures, posters and merchandise.
 * Images live in /public/work/print. Publications open in a page-through
 * reader; everything else opens full size.
 */
export const printRoom = {
  section: 'Section B — The Print Room',
  headline: 'Identity, print and',
  headlineEm: 'things you can hold.',
  lede: 'Brand systems, sponsorship decks, brochures, posters and merchandise designed by the studio. Select any piece to look closer.',
  feature: 'ascent-identity',
  featureThumbs: [
    { src: `${PRINT}/ascent/identity-05.webp`, alt: 'Ascent notebook, mugs and tote bag.' },
    { src: `${PRINT}/ascent/identity-07.webp`, alt: 'Ascent ID badges on lanyards.' },
    { src: `${PRINT}/ascent/identity-08.webp`, alt: 'Ascent bomber jacket.' },
    { src: `${PRINT}/ascent/onground.webp`, alt: 'The Ascent venue entrance.' },
  ],
  publications: [
    {
      slug: 'yugaantar-deck',
      client: 'Scaler School of Technology',
      title: 'Yugaantar 2026 sponsorship deck',
      kind: 'Sponsorship deck',
      summary:
        'The sponsorship deck for Yugaantar 2026, the annual cultural-tech fest of Scaler School of Technology: the fest’s story, audience, reach, speakers, past sponsors, events and partnership tiers, in a confident blue-and-white system.',
      format: 'slides',
      unit: 'slides',
      pages: pages('yugaantar', 16, { skip: [16], prefix: 'slide' }), // contact slide (personal phone numbers) left out
    },
    {
      slug: 'nodezero-brochure',
      client: 'Node Zero Labs',
      title: 'Node Zero Labs brochure',
      kind: 'Company brochure',
      summary:
        'A ten-page brochure for Node Zero Labs, an AI infrastructure studio building training data, RL environments and evaluations for AI labs — a quiet, technical layout in ink green and warm paper.',
      format: 'a4',
      unit: 'pages',
      pages: pages('nodezero', 10),
    },
    {
      slug: 'lumora-brochure',
      client: 'Lumora Solar',
      title: 'Lumora Solar brochure',
      kind: 'Company brochure',
      summary:
        'A sixteen-page brochure for Lumora Solar, a rooftop solar company: its founders, services, process, system types, government subsidies, questions and past projects, organised for homeowners and businesses.',
      format: 'a4',
      unit: 'pages',
      pages: pages('lumora', 16),
    },
  ],
  social: {
    title: 'Social posts & posters',
    items: [
      { src: `${PRINT}/social/ascent-poster.webp`, title: 'Ascent — event poster', alt: 'Ascent event poster with a rocket lifting off and the prize pool and flagship events listed.' },
      { src: `${PRINT}/social/scaler-skip-entrance.webp`, title: 'Scaler School of Technology — admissions post', alt: 'Scaler admissions post: skip the entrance exam and give interviews directly with qualifying JEE percentiles.' },
      { src: `${PRINT}/social/yugantar-nikhita.webp`, title: 'Yugaantar — artist poster', alt: 'Yugaantar poster announcing Nikhita Gandhi at Scaler School of Technology.' },
      { src: `${PRINT}/social/promptwars.webp`, title: 'Scaler × Google — PromptWars', alt: 'PromptWars by Scaler and Google social post with a person coding at night.' },
      { src: `${PRINT}/social/ascent-omium.webp`, title: 'Ascent × Omium — sponsor announcement', alt: 'Ascent post announcing Omium as sponsor of The Anvil event.' },
      { src: `${PRINT}/social/scaler-admissions.webp`, title: 'Scaler School of Technology — admissions closing', alt: 'Scaler post: admissions closing for the April 2026 intake.' },
      { src: `${PRINT}/social/yugantar-vivek.webp`, title: 'Yugaantar — artist poster', alt: 'Yugaantar poster announcing Vivek Samtani at Scaler School of Technology.' },
    ],
  },
  merch: {
    title: 'Campus & club merchandise',
    initial: 9,
    items: [
      { src: `${PRINT}/merch/cultural-club-varsity.webp`, title: 'Cultural Club — varsity jacket', alt: 'Black and cream Cultural Club varsity jacket, back and front.' },
      { src: `${PRINT}/merch/orators-society-varsity.webp`, title: 'The Orators’ Society — varsity jacket', alt: 'Navy and cream Orators’ Society varsity jacket, back and front.' },
      { src: `${PRINT}/merch/scaler-diary-71.webp`, title: 'Scaler School of Technology — diary', alt: 'Blue Scaler diary with “Excel. Exceed. Lead.” and a large 71.' },
      { src: `${PRINT}/merch/reinforce-tee.webp`, title: 'Reinforce, AI/ML club — T-shirt', alt: 'Black Reinforce AI/ML club T-shirt with an illustrated character.' },
      { src: `${PRINT}/merch/built-different-hoodie.webp`, title: 'built:different — hoodie', alt: 'Black hoodie reading built:different.' },
      { src: `${PRINT}/merch/academic-clubs-logo.webp`, title: 'Academic Clubs — logo', alt: 'Academic Clubs logo in white on black.' },
      { src: `${PRINT}/merch/lab0-tee.webp`, title: 'lab0.ai — T-shirt', alt: 'Black lab0.ai T-shirt, front and back, reading “Built to implement.”' },
      { src: `${PRINT}/merch/kong-jersey.webp`, title: 'KONG — sports jersey', alt: 'Navy KONG sports jersey, front and back, number 09.' },
      { src: `${PRINT}/merch/cultural-club-tee.webp`, title: 'Cultural Club — T-shirt', alt: 'White Cultural Club T-shirt, front and back.' },
      { src: `${PRINT}/merch/metacognition-tee.webp`, title: 'MetaCognition — T-shirt', alt: 'Black MetaCognition T-shirt reading “Evolution of memory begins here.”' },
      { src: `${PRINT}/merch/scaler-tote.webp`, title: 'Scaler — “Build with AI” tote', alt: 'White Scaler tote bag reading “Powered by curiosity, build with AI”.' },
      { src: `${PRINT}/merch/sports-club-tee.webp`, title: 'Sports Club — T-shirt', alt: 'Black Sports Club T-shirt, front and back.' },
      { src: `${PRINT}/merch/scaler-diary-2026.webp`, title: 'Scaler School of Technology — 2026 diary', alt: 'Blue Scaler 2026 diary reading “Excel. Exceed. Lead.”' },
      { src: `${PRINT}/merch/reinforce-hoodie.webp`, title: 'Reinforce — hoodie', alt: 'Black Reinforce hoodie, back and front.' },
      { src: `${PRINT}/merch/scaler-keychain.webp`, title: 'Scaler × AI — keychain', alt: 'White keychain shaped like a browser window reading “Hello I’m /building”.' },
      { src: `${PRINT}/merch/academic-clubs-logo-light.webp`, title: 'Academic Clubs — logo, light', alt: 'Academic Clubs logo in blue on white.' },
    ],
  },
};

/*
 * PROJECTS
 * layout: how the project sits in the Selected Work grid
 *   'lead'   – large feature story         'column' – narrow column story
 *   'image'  – image-led article            'brief'  – short brief
 *   'medium' – standard article
 * treatment: 'color' | 'mono' | 'halftone'  (mono/halftone bloom into colour on hover)
 * caseStudy.outcomes: optional — only add verified results. The section is
 * hidden when the list is empty.
 */
export const projects = [
  {
    slug: 'marigold-ferry',
    sample: true,
    client: 'Marigold Ferry Co.',
    discipline: 'Brand identity & wayfinding',
    headline: 'A harbour ferry learns to speak in colour',
    summary:
      'An identity for a small passenger ferry line: a marigold signal colour, a timetable typeface drawn for wet decks, and signage that can be read from the far end of the gangway.',
    image: '/work/marigold-ferry-1.svg',
    imageAlt: 'Sample artwork: a marigold circular ferry mark beside a printed ferry ticket on a navy background.',
    treatment: 'color',
    layout: 'lead',
    caseStudy: {
      deck: 'How a two-boat ferry line found a visual voice as clear as a harbour signal — and as warm as the morning crossing.',
      brief:
        'Marigold Ferry Co. runs short crossings between a working harbour and two small islands. Its tickets, timetables and signs had grown piecemeal over the years. The brief: one identity that works for commuters in the rain and for visitors seeing the harbour for the first time.',
      approach: [
        'We began on the quayside, watching how people actually look for information: at a run, in bad light, often with a bag in one hand. That gave us our priorities — colour first, numbers second, words third.',
        'Marigold became the signal colour, chosen to hold up against grey water and grey skies. A compact timetable typeface puts departure times at the centre of every touchpoint, and a simple wave motif ties tickets, posters and signs together without decoration for its own sake.',
        'The wayfinding system was designed alongside the identity rather than after it, so the same grid and arrow logic run from the printed ticket to the gangway signs.',
      ],
      deliverables: ['Identity & marque', 'Timetable typography', 'Ticketing & print', 'Wayfinding signage', 'Brand guidelines'],
      gallery: [
        { src: '/work/marigold-ferry-2.svg', alt: 'Sample artwork: three timetable posters in marigold, navy and cream.', caption: 'Timetable posters for the harbour waiting room.' },
        { src: '/work/marigold-ferry-3.svg', alt: 'Sample artwork: a navy wayfinding sign reading “Ferries 1–4”.', caption: 'Gangway signage, designed to be read at a run.' },
      ],
      outcomes: [],
    },
  },
  {
    slug: 'oda-ceramics',
    sample: true,
    client: 'Oda Ceramics',
    discipline: 'Brand identity & packaging',
    headline: 'Small studio, slow kiln: a potter’s mark takes shape',
    summary:
      'A quiet identity for a one-person ceramics studio — a hand-cut wordmark, a stamp for the base of every piece, and packaging that protects the work without shouting over it.',
    image: '/work/oda-ceramics-1.svg',
    imageAlt: 'Sample artwork: three ceramic vessels in terracotta, charcoal and sage with a small “oda” tag.',
    treatment: 'color',
    layout: 'lead',
    caseStudy: {
      deck: 'An identity that behaves like the work it represents: patient, tactile and made by hand.',
      brief:
        'Oda makes small runs of thrown stoneware. The studio needed a mark that could be pressed into clay, printed on a shipping box and still feel personal at the scale of a thank-you card.',
      approach: [
        'Every decision started at the potter’s wheel. The wordmark was cut by hand and redrawn only enough to survive being stamped into wet clay.',
        'The palette borrows directly from the glazes — terracotta, charcoal and a soft sage — so the packaging feels like an extension of the pieces inside it.',
      ],
      deliverables: ['Wordmark & clay stamp', 'Colour palette', 'Packaging system', 'Stationery'],
      gallery: [
        { src: '/work/oda-ceramics-2.svg', alt: 'Sample artwork: a charcoal packaging box with an embossed “oda” mark.', caption: 'Shipping box with a debossed circular mark.' },
        { src: '/work/oda-ceramics-3.svg', alt: 'Sample artwork: a circular terracotta stamp and a business card.', caption: 'The kiln stamp and studio cards.' },
      ],
      outcomes: [],
    },
  },
  {
    slug: 'northbank-library',
    sample: true,
    client: 'Northbank Library',
    discipline: 'Website & digital experience',
    headline: 'The reading room opens a second door, online',
    summary:
      'A website for a neighbourhood library that treats search, events and room bookings as part of one welcome — designed for first-time visitors and regulars alike.',
    image: '/work/northbank-library-1.svg',
    imageAlt: 'Sample artwork: a library website reading “Borrow the city.” with a search bar and book covers.',
    treatment: 'color',
    layout: 'column',
    caseStudy: {
      deck: 'Designing a library website around the questions people actually arrive with.',
      brief:
        'Northbank’s old site was organised around departments. Visitors had to know how the library worked before they could use it. The brief: a website that answers everyday questions in the fewest steps, and feels as open as the building.',
      approach: [
        'We grouped the site around three intentions — find something, go to something, book somewhere — and gave each one a clear starting point on the home page.',
        'A warm editorial type system and generous spacing keep long event listings readable, while a single coral action colour marks every point where a visitor can do something.',
        'Templates were designed mobile-first and tested against real catalogue data, long titles included.',
      ],
      deliverables: ['Information architecture', 'Web design system', 'Mobile templates', 'Front-end build guidance'],
      gallery: [
        { src: '/work/northbank-library-2.svg', alt: 'Sample artwork: three phone screens showing events, loans and room booking.', caption: 'Mobile templates for events, loans and room booking.' },
        { src: '/work/northbank-library-3.svg', alt: 'Sample artwork: a shelf of colourful book spines.', caption: 'The colour system, drawn from the shelves.' },
      ],
      outcomes: [],
    },
  },
  {
    slug: 'sundial-records',
    sample: true,
    client: 'Sundial Records',
    discipline: 'Graphic design & art direction',
    headline: 'Twelve sleeves for a label that releases at dusk',
    summary:
      'A sleeve system for an independent label: one sun, twelve positions, and a set of rules loose enough to let every record keep its own mood.',
    image: '/work/sundial-records-1.svg',
    imageAlt: 'Sample artwork: an orange record sleeve with a striped yellow sun and a black vinyl record.',
    treatment: 'halftone',
    layout: 'brief',
    caseStudy: {
      deck: 'A sleeve series built from a single idea: the sun, moving a little further across the sky with every release.',
      brief:
        'Sundial Records wanted its releases to be recognisable across a record shop without every sleeve looking the same.',
      approach: [
        'We built a system around one image — a setting sun — whose position, colour and stripe rhythm change with each release. The catalogue number tells you where the sun sits.',
        'Typography stays fixed and quiet, so the sleeves feel like one family even when the colours swing from dawn to midnight.',
      ],
      deliverables: ['Sleeve system', 'Label artwork', 'Typography rules', 'Release templates'],
      gallery: [
        { src: '/work/sundial-records-2.svg', alt: 'Sample artwork: four record sleeves named Dawn, Noon, Dusk and Night.', caption: 'Four positions of the sun across the first releases.' },
        { src: '/work/sundial-records-3.svg', alt: 'Sample artwork: a black vinyl record with a half-sun centre label.', caption: 'Centre label, side A.' },
      ],
      outcomes: [],
    },
  },
  {
    slug: 'fieldwork-festival',
    sample: true,
    client: 'Fieldwork Festival',
    discipline: 'Campaign design',
    headline: 'A summer campaign printed in only two colours',
    summary:
      'A campaign for an open-air arts weekend, designed for two-colour risograph printing — overprints, bold letterforms and a sun that changes place on every poster.',
    image: '/work/fieldwork-festival-1.svg',
    imageAlt: 'Sample artwork: a two-colour poster with overlapping red and blue letters reading “Field Work”.',
    treatment: 'color',
    layout: 'image',
    caseStudy: {
      deck: 'Limits as a design tool: two inks, one typeface and a lot of paper.',
      brief:
        'Fieldwork needed a campaign that could be printed affordably in small batches and still feel like an event. The answer had to work on a lamppost, a tote bag and a phone screen.',
      approach: [
        'We designed for the press first. Red and blue inks overprint to make a third colour, so every poster has more depth than its budget suggests.',
        'A modular poster grid lets the team produce new versions for each day of the festival without returning to the studio.',
      ],
      deliverables: ['Campaign concept', 'Poster series', 'Merchandise', 'Social templates'],
      gallery: [
        { src: '/work/fieldwork-festival-2.svg', alt: 'Sample artwork: a wall of eight two-colour festival posters.', caption: 'A street wall of poster variations.' },
        { src: '/work/fieldwork-festival-3.svg', alt: 'Sample artwork: a cream tote bag printed with the festival letters.', caption: 'The festival tote, printed in the same two inks.' },
      ],
      outcomes: [],
    },
  },
  {
    slug: 'pale-harbour-tea',
    sample: true,
    client: 'Pale Harbour Tea',
    discipline: 'Packaging & creative direction',
    headline: 'Tea tins that read like letters from the coast',
    summary:
      'Packaging and art direction for a small-batch tea company, borrowing the language of postage, envelopes and harbour charts.',
    image: '/work/pale-harbour-tea-1.svg',
    imageAlt: 'Sample artwork: three tea tins in navy, cream and rust with stamp-like labels.',
    treatment: 'mono',
    layout: 'medium',
    caseStudy: {
      deck: 'A packaging family that feels like post arriving from somewhere you would rather be.',
      brief:
        'Pale Harbour blends teas in small batches and sells them online and through a handful of shops. Its packaging needed to feel personal, ship well, and make each blend easy to tell apart.',
      approach: [
        'Each tin is addressed like a letter: a stamp for the blend, a postmark for the batch, and a handwritten-style name.',
        'We art-directed a small set of photographs and illustrations around the same coastal palette, so the shop, the tins and the website tell one story.',
      ],
      deliverables: ['Packaging system', 'Illustration direction', 'Label templates', 'Photography direction'],
      gallery: [
        { src: '/work/pale-harbour-tea-2.svg', alt: 'Sample artwork: an envelope-style tea pouch with a rust wax seal.', caption: 'Refill pouches folded like envelopes.' },
        { src: '/work/pale-harbour-tea-3.svg', alt: 'Sample artwork: a postage-stamp label with a lighthouse illustration.', caption: 'Stamp illustration for the harbour blend.' },
      ],
      outcomes: [],
    },
  },
];

export const studio = {
  section: 'Section D — The Studio',
  headline: 'We work like a newsroom: curious, quick on our feet and fussy about the details.',
  image: '/work/studio.svg',
  imageAlt: 'Sample artwork: a top-down studio desk with paper proofs, swatches, a pencil and a coffee cup.',
  imageCaption: 'Studio desk — sample image. Replace with a photograph of your team or space.',
  columns: [
    {
      title: 'Who we are',
      text: 'Kora Kaagaz is an independent creative studio for brands, institutions and founders who have something worth saying. We design identities, publications, websites and campaigns, and we treat each one like a story that deserves a careful edit.',
    },
    {
      title: 'Our approach',
      text: 'Every project starts with reporting: listening to the people involved, reading the context and finding the line that matters most. Then we design with restraint — fewer, better decisions, carried all the way through to the last detail.',
    },
    {
      title: 'How we collaborate',
      text: 'You work directly with the people doing the work. We keep a tight editorial loop: a shared brief, regular check-ins, honest drafts and a clear sign-off before anything goes to print — or to production.',
    },
  ],
  pullQuote: 'Every brief is a story. Our job is to find the headline — and set it beautifully.',
  process: [
    { n: '01', title: 'The Brief', text: 'We listen, ask the awkward questions and agree on the story together.' },
    { n: '02', title: 'The Reporting', text: 'Research, references and a clear creative direction before a single layout.' },
    { n: '03', title: 'The Draft', text: 'Design develops in focused rounds, with reasoning you can follow and question.' },
    { n: '04', title: 'Going to Press', text: 'Production, launch support, handover files and guidelines your team can use.' },
  ],
};

export const services = {
  section: 'Section E — The Directory',
  headline: 'Directory of Services',
  intro: 'Commission the studio for a single piece or a complete edition. Every engagement is led by a senior designer from brief to delivery.',
  items: [
    {
      name: 'Brand Identity',
      text: 'Names, marks, typography, colour and the guidelines that keep them consistent wherever they appear.',
      deliverables: ['Logo & marque', 'Type & colour systems', 'Brand guidelines', 'Naming support'],
    },
    {
      name: 'Graphic Design',
      text: 'Print and editorial work made with care: publications, posters, packaging and environmental graphics.',
      deliverables: ['Editorial & books', 'Packaging', 'Posters & print', 'Signage'],
    },
    {
      name: 'Websites & Digital Experiences',
      text: 'Editorial websites, product pages and interactive pieces, designed for clarity and built to last.',
      deliverables: ['Content structure', 'Web design', 'Front-end build', 'Motion & interaction'],
    },
    {
      name: 'Creative Direction',
      text: 'A steady editorial eye across shoots, launches and long-running brand programmes.',
      deliverables: ['Concept development', 'Art direction', 'Photography direction', 'Brand storytelling'],
    },
    {
      name: 'Campaign Design',
      text: 'Launches and seasonal campaigns that hold together across posters, screens, social and print.',
      deliverables: ['Campaign concepts', 'Key visuals', 'Out-of-home', 'Social & digital assets'],
    },
  ],
};

export const contact = {
  section: 'Section F — Classifieds',
  kicker: 'Classified — Notice to all readers',
  headline: 'Your next big story starts here.',
  body: 'Wanted: brands, founders and organisations with an idea worth printing. Send a few lines about what you are making, when you need it and what a good result looks like. We will reply with next steps.',
  cta: 'Send an enquiry',
  ads: [
    { title: 'Wanted', text: 'Ambitious briefs. Vague ones welcome too — we will help sharpen them.' },
    { title: 'Collaborators', text: 'Photographers, writers and developers: we are always glad to meet new people. Say hello.' },
    { title: 'Notice', text: 'This edition contains sample projects and placeholder details. Real stories will be printed here soon.', sampleOnly: true },
  ],
};

/** Every story with its own page: real case studies first, then the samples. */
export const allStories = [...stories, ...projects];
