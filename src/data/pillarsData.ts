export interface PillarData {
  id: string;
  slug: string;
  number: string;
  title: string;
  subtitle: string;
  heroImage: string;
  shortDesc: string;
  fullOverview: string;
  associatedPackageId: string;
  topics: {
    title: string;
    description: string;
  }[];
  checklist: string[];
  preparationTips: string[];
  faq: {
    question: string;
    answer: string;
  }[];
}

export const PILLARS_DATA: Record<string, PillarData> = {
  hairstyle: {
    id: 'hairstyle',
    slug: 'hairstyle',
    number: '01',
    title: 'Hairstyle & Hair-Grooming Review',
    subtitle: 'Facial Geometry, Hairline Framing & Styling Clays',
    heroImage:
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=1200',
    shortDesc:
      'Analysis of head shape, hair density, tapers, and reference photos to show your barber.',
    fullOverview:
      'Your haircut is the primary visual anchor of your head. It dictates whether your face appears rounded, elongated, or structurally balanced. In this pillar, we inspect your frontal hairline, temple points, crown whorls, and hair density to select cuts that harmonize with your bone structure.',
    associatedPackageId: 'hair-grooming-45',
    topics: [
      {
        title: 'Cranial & Facial Geometry Assessment',
        description:
          'We evaluate your face shape (square, oval, diamond, round, heart, or oblong) and determine how much volume you need at the top versus the sides.',
      },
      {
        title: 'Taper Heights & Neckline Finishes',
        description:
          'Learn whether a low taper, mid fade, or scissor-over-comb classic taper best complements your occipital bone and neck width.',
      },
      {
        title: 'Barber Reference Guide & Phrasing',
        description:
          'Avoid bad haircuts caused by miscommunication. We provide exact guard sizes, clipper instructions, and reference photos to show your barber.',
      },
      {
        title: 'Styling Products & Daily Execution',
        description:
          'We audit clays, pastes, pomades, and sea salt sprays so you can achieve textured volume without greasy shine.',
      },
    ],
    checklist: [
      'Identification of ideal hair length across top, sides, and fringe',
      'Specific clipper guard recommendations (e.g., #2 into #3 taper)',
      'Product recommendations: matte clay vs. fiber vs. sea salt spray',
      'Daily blow-drying and root-lifting routine',
    ],
    preparationTips: [
      'Wash your hair and dry it naturally without heavy styling product before the call.',
      'Have your current hair styling products nearby so we can audit hold and shine.',
    ],
    faq: [
      {
        question: 'What if I have a receding hairline or thinning hair?',
        answer:
          'We specialize in haircut geometry for thinning hair, including French crops, textured buzz cuts, and side tapers that reduce visual contrast between thinning areas and dense sides.',
      },
      {
        question: 'Will I get photos to show my barber?',
        answer:
          'Yes, in your post-call written blueprint you will receive curated high-resolution reference angles and exact clipper specifications.',
      },
    ],
  },
  skincare: {
    id: 'skincare',
    slug: 'skincare',
    number: '02',
    title: 'Skincare Routine & Presentation',
    subtitle: 'Active Ingredients, Barrier Integrity & Daily Radiance',
    heroImage:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=1200',
    shortDesc:
      'Science-backed daily skincare formulation, active ingredients audit, and barrier protection.',
    fullOverview:
      'Clear, hydrated skin conveys discipline, vitality, and health. The men’s grooming industry is saturated with overpriced multi-step marketing gimmicks. We distill your routine down to high-efficacy, science-backed actives that actually deliver visible clarity.',
    associatedPackageId: 'skincare-style-45',
    topics: [
      {
        title: 'Skin Type & Barrier Audit',
        description:
          'We determine your true skin condition: oily, combination, dehydrated, dry, or prone to inflammation and acne.',
      },
      {
        title: 'Evidence-Based Active Ingredients',
        description:
          'How and when to incorporate retinoids (retinol / adapalene), chemical exfoliants (salicylic acid / BHA), and barrier restorers (ceramides, niacinamide).',
      },
      {
        title: 'Broad-Spectrum Sun Protection',
        description:
          'Selecting lightweight, invisible modern sunscreens (SPF 50+ PA++++) that leave zero white cast, stickiness, or breakout risk.',
      },
      {
        title: 'Eye Area & Shaving Irritation Management',
        description:
          'Targeting under-eye puffiness, dark pigmentation, razor burn, and folliculitis with non-comedogenic solutions.',
      },
    ],
    checklist: [
      'Streamlined 3-step morning protocol (Cleanse, Hydrate, Protect)',
      'Targeted evening recovery routine (Cleanse, Treat/Retinoid, Moisturize)',
      'Sunscreen recommendations that suit Indian & warm climates without oiliness',
      'Ingrown hair and razor bump prevention protocol',
    ],
    preparationTips: [
      'Line up all skincare products you currently use so we can review the ingredient decks.',
      'Ensure your face is clean and unpowdered for accurate camera evaluation.',
    ],
    faq: [
      {
        question: 'Do you prescribe prescription pharmaceuticals like Accutane?',
        answer:
          'No. We provide cosmetic routine advice and ingredient education. If we spot cystic acne or suspicious lesions, we always recommend visiting a licensed board-certified dermatologist.',
      },
      {
        question: 'Are the recommended products expensive?',
        answer:
          'No. Most of the most effective formulations (from reputable brands like The Ordinary, Minimalist, CeraVe) cost under ₹400-₹800 INR.',
      },
    ],
  },
  'facial-hair': {
    id: 'facial-hair',
    slug: 'facial-hair',
    number: '03',
    title: 'Facial Hair & Jawline Grooming',
    subtitle: 'Stubble Demarcation, Necklines & Lower Face Framing',
    heroImage:
      'https://images.unsplash.com/photo-1517832606589-7629c3395909?auto=format&fit=crop&q=80&w=1200',
    shortDesc:
      'Neckline demarcation, beard fading, and stubble shaping for lower face definition.',
    fullOverview:
      'Facial hair can act as optical contouring: it can add angularity to a round chin, create a sharper jawline silhouette, or hide lower-face asymmetry. Conversely, trimming the neckline too high or letting the cheek line grow unruly creates an illusion of a double chin.',
    associatedPackageId: 'hair-grooming-45',
    topics: [
      {
        title: 'The Golden Neckline Rule',
        description:
          'How to identify the exact crease one to two finger-widths above your Adam’s apple so your jawline looks chiseled from every angle.',
      },
      {
        title: 'Stubble Length Optimization',
        description:
          'Comparing heavy 4mm stubble versus 2mm designer shadow based on your beard density and follicular spread.',
      },
      {
        title: 'Cheek Line Shaping & Fading',
        description:
          'Soft natural lines versus sharp razor lines: which approach complements your cheekbone projection.',
      },
      {
        title: 'Trimmer Guard & Maintenance Protocol',
        description:
          'Which grooming tools (rotary, foil, T-blade) give the cleanest finish with minimal skin irritation.',
      },
    ],
    checklist: [
      'Precise neckline height mapped to your neck anatomy',
      'Recommended guard lengths for chin, jaw, and mustache',
      'Fading technique instructions for sideburns into beard',
      'Daily beard oil & hygiene routine',
    ],
    preparationTips: [
      'Avoid clean shaving for 3-5 days before the call so we can see your natural growth pattern.',
    ],
    faq: [
      {
        question: 'What if I have patchy or uneven beard growth?',
        answer:
          'We specialize in maximizing patchy growth through tactical stubble lengths, clean perimeter borders, and targeted clean-shaven areas that highlight your best features.',
      },
    ],
  },
  style: {
    id: 'style',
    slug: 'style',
    number: '04',
    title: 'Personal Style & Wardrobe Silhouettes',
    subtitle: 'Fit Precision, Collar Shapes & Proportion Harmony',
    heroImage:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200',
    shortDesc:
      'Collar styles, clothing proportions, and neutral palette coordination for your build.',
    fullOverview:
      'Style is not about chasing ephemeral streetwear micro-trends or buying luxury logos. It is about understanding your build, shoulder-to-hip ratio, and height proportions to wear pieces that make you appear taller, broader, and impeccably presented.',
    associatedPackageId: 'skincare-style-45',
    topics: [
      {
        title: 'Collar Style Matching',
        description:
          'How spread collars, band collars, button-downs, and open Cuban collars alter the visual length of your neck and lower jaw.',
      },
      {
        title: 'Upper Torso V-Taper Silhouettes',
        description:
          'Sleeve lengths, shoulder seam placement, and torso drape that accentuate your upper frame while minimizing midsection bulk.',
      },
      {
        title: 'Neutral Color Harmonies',
        description:
          'Building a timeless capsule wardrobe centered around charcoal, off-white, olive, navy, and black.',
      },
      {
        title: 'Pants Rise & Inseam Breaks',
        description:
          'How mid-to-high rise trousers elongate leg length compared to unflattering low-rise jeans.',
      },
    ],
    checklist: [
      'Shirt collar and neckline styles suited to your neck length',
      'Shoulder and sleeve fit benchmark checklist',
      'Core capsule wardrobe list (tees, oxfords, knitwear, trousers, boots)',
      'Footwear silhouette matching (chelsea boots, minimalist sneakers, loafers)',
    ],
    preparationTips: [
      'Wear or have nearby 2-3 of your favorite day-to-day shirts so we can inspect fit on camera.',
    ],
    faq: [
      {
        question: 'Do I need to spend a lot of money to upgrade my style?',
        answer:
          'Absolutely not. An inexpensive Uniqlo shirt that fits your shoulders and neck properly will look 10x better than an ill-fitting designer shirt.',
      },
    ],
  },
  blueprint: {
    id: 'blueprint',
    slug: 'blueprint',
    number: '05',
    title: 'Personalized Self-Improvement Plan',
    subtitle: 'Post-Call Roadmap, Daily Habits & PDF Summary',
    heroImage:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200',
    shortDesc:
      'Post-consultation written blueprint with actionable habit checklist and product recommendations.',
    fullOverview:
      'Consultations are meaningless without flawless execution. After our 45-minute video call, we synthesize every insight into a customized, high-clarity written action plan delivered directly to your email within 24 hours.',
    associatedPackageId: 'complete-45',
    topics: [
      {
        title: 'The 30-Day Quick-Win Priority List',
        description:
          'The 3 immediate changes (haircut, skincare swap, beard line) that will yield 80% of your visual transformation.',
      },
      {
        title: 'Curated Direct Product Links',
        description:
          'Direct, unbiased links to purchase the exact products discussed, without sponsorship commission markup.',
      },
      {
        title: 'Barber Reference Visual Sheet',
        description:
          'High-resolution multi-angle photos and written clipper guard instructions to show your barber at your next appointment.',
      },
      {
        title: 'Follow-Up Email Support',
        description:
          'Direct access to clarify questions or send a photo of your new haircut for feedback.',
      },
    ],
    checklist: [
      'Delivered as a clean, downloadable PDF within 24 hours of call',
      'Personalized product links categorized by budget',
      'Reference barber photos and terminology sheet',
      'Email support for your first haircut review',
    ],
    preparationTips: [
      'Come prepared with specific goals and questions you want addressed during our 45 minutes.',
    ],
    faq: [
      {
        question: 'How fast do I get the blueprint after the call?',
        answer:
          'Your written blueprint is compiled and emailed to you within 24 hours of completing the video consultation.',
      },
    ],
  },
};
