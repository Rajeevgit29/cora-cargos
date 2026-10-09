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
  section: 'Section B — The Studio',
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
  section: 'Section C — The Directory',
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
  section: 'Section D — Classifieds',
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
