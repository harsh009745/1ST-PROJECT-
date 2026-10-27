import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scissors,
  Sparkles,
  Smile,
  Shirt,
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { ServiceItem } from '../types';

interface ServicesPageProps {
  services: ServiceItem[];
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ services }) => {
  const navigate = useNavigate();

  const detailedPillars = [
    {
      id: 'hairstyle',
      number: '01',
      title: 'Hairstyle & Hair-Grooming Review',
      tagline: 'Facial Geometry & Silhouette Framing',
      associatedPackageId: 'hair-grooming-45',
      icon: <Scissors className="w-6 h-6 text-amber-400" />,
      image:
        'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=800',
      description:
        'Your haircut is the single most defining frame of your face. We analyze your head shape (oval, square, oblong, heart, round), hair thickness, hairline recession or cowlicks, and growth directions.',
      details: [
        'Determining ideal haircut length, taper heights (low, mid, high taper or fade), and parting styles.',
        'Selecting haircut references to bring to your barber with specific clipper guard terminology.',
        'Auditing hair styling products: clays for matte texture, creams for natural flow, and sea salt spray for volume.',
        'Daily styling routine instruction (blow-drying techniques, heat protection, and wash schedules).',
      ],
    },
    {
      id: 'skincare',
      number: '02',
      title: 'Skincare Routine & Presentation',
      tagline: 'Active Ingredients, Barrier Health & Clarity',
      associatedPackageId: 'skincare-style-45',
      icon: <Sparkles className="w-6 h-6 text-amber-400" />,
      image:
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
      description:
        'Clear skin enhances perceived vitality and youthfulness. We strip away viral gimmicks and audit your regimen through proven dermatological evidence.',
      details: [
        'Skin type categorization: oily, combination, dehydrated, dry, or sensitive.',
        'Ingredient formulation audit: salicylic acid / BHA, retinoids (retinol / adapalene), niacinamide, and hyaluronic acid.',
        'Selecting broad-spectrum SPF sunscreens that leave zero white cast or greasy sheen.',
        'Addressing dark under-eye circles, hyperpigmentation, and razor bumps from shaving.',
      ],
    },
    {
      id: 'facial-hair',
      number: '03',
      title: 'Facial Hair & Grooming Advice',
      tagline: 'Jawline Enhancement & Stubble Demarcation',
      associatedPackageId: 'hair-grooming-45',
      icon: <Smile className="w-6 h-6 text-amber-400" />,
      image:
        'https://images.unsplash.com/photo-1517832606589-7629c3395909?auto=format&fit=crop&q=80&w=800',
      description:
        'Facial hair can act as natural contouring to sharpen lower face definition, strengthen a weaker chin, or balance facial proportions.',
      details: [
        'Identifying proper neckline placement (exactly one to two fingers above the Adam’s apple to avoid double-chin illusion).',
        'Cheekline trimming rules: natural vs. sharp angled demarcation.',
        'Optimal stubble lengths (e.g. heavy stubble 4-5mm vs. light stubble 1-2mm) based on your hair density.',
        'Essential grooming equipment: trimmer guard selection, foil shavers, and beard oils for follicle softness.',
      ],
    },
    {
      id: 'style',
      number: '04',
      title: 'Personal Style & Wardrobe Silhouettes',
      tagline: 'Color Contrasts, Proportions & Fit Precision',
      associatedPackageId: 'skincare-style-45',
      icon: <Shirt className="w-6 h-6 text-amber-400" />,
      image:
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
      description:
        'Looking well-put-together is about fit, proportion, and color harmony rather than expensive designer logos.',
      details: [
        'Collar style selection (spread, point, band, open camp) based on neck thickness and jawline width.',
        'Shoulder seam alignment and sleeve taper rules to accentuate upper torso width.',
        'Mastering neutral high-contrast palettes (black, charcoal, navy, off-white, olive, camel).',
        'Trouser rise and inseam breaks to elongate leg proportions.',
      ],
    },
    {
      id: 'blueprint',
      number: '05',
      title: 'Personalized Self-Improvement Plan',
      tagline: 'Execution Roadmap & Post-Call Blueprint',
      associatedPackageId: 'complete-45',
      icon: <Compass className="w-6 h-6 text-amber-400" />,
      image:
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
      description:
        'You leave the consultation not with generic motivation, but with a written, prioritized checklist customized to your budget and lifestyle.',
      details: [
        'Written consultation summary delivered to your inbox within 24 hours.',
        'Curated product links without brand sponsorship bias.',
        'Prioritized 30-day checklist of changes that yield 80% of visual results.',
        'Reference grooming photos and barber instructions in high resolution.',
      ],
    },
  ];

  return (
    <div className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-amber-400 text-xs font-mono tracking-widest uppercase block mb-2">
          COMPREHENSIVE CONSULTATION SCOPE
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          The 5 Pillars of Personal Presentation
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          Every consultation evaluates your individual appearance through five synergistic pillars. Click on any pillar to read the complete guide.
        </p>
      </div>

      {/* 5 Pillars Deep Dive */}
      <div className="space-y-16 mb-20">
        {detailedPillars.map((p, index) => {
          const isEven = index % 2 === 1;
          return (
            <div
              key={p.id}
              className={`flex flex-col ${
                isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'
              } gap-8 items-center bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl`}
            >
              {/* Pillar Image */}
              <Link
                to={`/pillars/${p.id}`}
                className="w-full lg:w-1/2 h-64 sm:h-80 rounded-2xl overflow-hidden relative group bg-zinc-950 block"
              >
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-zinc-950/90 border border-zinc-700/80">
                  {p.icon}
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="text-xs font-mono text-amber-300 font-bold bg-amber-950/80 border border-amber-800/60 px-2.5 py-1 rounded-full">
                    PILLAR {p.number}
                  </span>
                </div>
              </Link>

              {/* Pillar Content */}
              <div className="w-full lg:w-1/2 space-y-4 text-left">
                <span className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider block">
                  {p.tagline}
                </span>
                <Link to={`/pillars/${p.id}`} className="block group">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-amber-200 transition-colors">
                    {p.title}
                  </h2>
                </Link>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{p.description}</p>

                <div className="pt-2 space-y-2.5">
                  {p.details.map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{detail}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex flex-wrap gap-3">
                  <Link
                    to={`/pillars/${p.id}`}
                    className="py-2.5 px-4 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300 hover:bg-amber-900/40 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Read Complete Pillar Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to={`/book/${p.associatedPackageId}`}
                    className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors border border-zinc-700 inline-flex items-center gap-1.5"
                  >
                    <span>Book 45-Min Call</span>
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pricing / Tiers Comparison Table */}
      <section className="mb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-amber-400 text-xs font-mono uppercase tracking-widest block mb-2">
            CONSULTATION TIERS
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Choose Your 45-Minute Focus
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            All consultations run for exactly 45 minutes and include post-call written documentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s) => {
            const isPopular = s.id === 'complete-45';
            return (
              <div
                key={s.id}
                className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                  isPopular
                    ? 'bg-gradient-to-b from-zinc-900 via-zinc-900 to-amber-950/30 border-amber-500/60 shadow-2xl shadow-amber-950/30'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider block">
                        EXACTLY 45 MINS
                      </span>
                      <Link to={`/packages/${s.id}`} className="block group">
                        <h3 className="text-lg font-bold text-white group-hover:text-amber-200 transition-colors mt-1">
                          {s.name}
                        </h3>
                      </Link>
                    </div>
                    {s.badge && (
                      <span className="text-[10px] font-bold text-zinc-950 bg-amber-400 px-2 py-0.5 rounded-full flex-shrink-0">
                        {s.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                    {s.fullDescription || s.description}
                  </p>

                  <div className="mb-6 pb-6 border-b border-zinc-800">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      ₹{s.basePriceINR.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-zinc-400 ml-1.5 uppercase font-mono">INR</span>
                  </div>

                  <div className="space-y-2.5 mb-8">
                    {s.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Link
                    to={`/packages/${s.id}`}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 transition-colors flex items-center justify-center gap-1.5 block text-center"
                  >
                    <span>View Package Itinerary</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </Link>

                  <Link
                    to={`/book/${s.id}`}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer block text-center ${
                      isPopular
                        ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-zinc-950 shadow-lg shadow-amber-950/50 hover:brightness-105'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Book This 45-Min Call</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Scope & Medical Disclaimer */}
      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start gap-3.5 text-xs text-zinc-400 max-w-4xl mx-auto">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-zinc-200 block mb-1">
            Ethical Scope &amp; Medical Disclaimer:
          </strong>
          Recommendations provided during consultations are subjective appearance and styling suggestions tailored to your individual preferences. This platform does not provide medical, surgical, dermatological, or dental diagnosis, and does not promise permanent changes to underlying facial skeletal structure.
        </div>
      </div>
    </div>
  );
};
