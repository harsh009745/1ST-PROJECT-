export interface ServiceDefinition {
  id: string;
  name: string;
  duration: string;
  durationMinutes: number;
  description: string;
  fullDescription: string;
  basePriceINR: number;
  badge?: string;
  features: string[];
}

// Authoritative services catalog strictly maintained on the server
export const SERVICE_CATALOG: Record<string, ServiceDefinition> = {
  'complete-45': {
    id: 'complete-45',
    name: 'Comprehensive 1:1 Aesthetics & Grooming Consultation',
    duration: '45 mins',
    durationMinutes: 45,
    description:
      'Complete private video session covering facial aesthetics, hairstyle geometry, skincare protocol, and personal style blueprint.',
    fullDescription:
      'A holistic 45-minute private video session analyzing facial framing, hair texture and styling options, skin condition and ingredients, facial hair trim lines, and outfit silhouettes tailored specifically to your goals.',
    basePriceINR: 1999,
    badge: 'Most Popular',
    features: [
      'Facial structure & hairstyle geometry assessment',
      'Morning & evening skincare routine audit',
      'Beard / stubble line framing advice',
      'Wardrobe silhouette & color palette review',
      'Follow-up written action blueprint PDF',
    ],
  },
  'hair-grooming-45': {
    id: 'hair-grooming-45',
    name: 'Hairstyle & Facial Grooming Intensive',
    duration: '45 mins',
    durationMinutes: 45,
    description:
      'Deep dive into head shape, optimal hair length, styling product selection, and facial hair grooming.',
    fullDescription:
      'Dedicated 45-minute video breakdown of your hair type, hairline, cowlicks, and bone structure. We select realistic haircut references to show your barber, along with precise beard grooming lines.',
    basePriceINR: 1499,
    badge: 'Hair & Beard Focus',
    features: [
      'Hairline, density & face shape framing review',
      'Reference cuts & instructions for your barber',
      'Pomade, clay & styling product recommendations',
      'Jawline enhancement through beard grooming',
    ],
  },
  'skincare-style-45': {
    id: 'skincare-style-45',
    name: 'Skincare Routine & Personal Styling Blueprint',
    duration: '45 mins',
    durationMinutes: 45,
    description:
      'Science-backed daily skincare formulation, presentation hygiene, and tailored clothing fit recommendations.',
    fullDescription:
      'Focused 45-minute consultation addressing skin texture, acne-prone or barrier issues, sunscreen and retinoid protocols, plus personal styling tips to enhance your posture and proportions.',
    basePriceINR: 1499,
    badge: 'Skin & Style Focus',
    features: [
      'Skin type & current routine product audit',
      'Active ingredients guide (cleanser, retinol, SPF)',
      'Wardrobe essentials based on build and height',
      'Posture, scent & presentation refinement',
    ],
  },
};
