export interface SocialLink {
  id: string;
  platform: 'github' | 'twitter' | 'linkedin' | 'youtube' | 'instagram' | 'mail';
  url: string;
  label: string;
}

export interface CustomLink {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  highlight?: boolean;
  tag?: string;
}

export const PROFILE_CONFIG = {
  name: 'Aaditya Sharma',
  handle: '@aaditya.codes',
  badge: 'Senior Architect & Creator',
  bio: 'Building resilient full-stack systems, payment workflows & cloud architectures. Available for tech advisories, 1:1 architecture reviews, and bespoke project milestones.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  contactEmail: 'contact@aaditya.dev',
  location: 'Bengaluru, India',
  currency: 'INR',
  currencySymbol: '₹',
  bookingNotice: 'Payments are processed securely via official Razorpay Standard Checkout with instant UPI support (GPay, PhonePe, Paytm, BHIM).',
  copyrightYear: new Date().getFullYear(),
  socials: [
    { id: '1', platform: 'github', url: 'https://github.com', label: 'GitHub' },
    { id: '2', platform: 'twitter', url: 'https://x.com', label: 'X (Twitter)' },
    { id: '3', platform: 'linkedin', url: 'https://linkedin.com', label: 'LinkedIn' },
    { id: '4', platform: 'youtube', url: 'https://youtube.com', label: 'YouTube' },
    { id: '5', platform: 'mail', url: 'mailto:contact@aaditya.dev', label: 'Email' },
  ] as SocialLink[],
  customLinks: [
    {
      id: 'handbook',
      title: 'Distributed Systems & Architecture Guide',
      subtitle: 'Free 40-page blueprint on scale, idempotency & resilient APIs',
      url: 'https://github.com',
      highlight: true,
      tag: 'Free Guide',
    },
    {
      id: 'newsletter',
      title: 'Weekly Full-Stack Engineering Dispatch',
      subtitle: 'Practical backend teardowns, caching tips, and cloud design',
      url: 'https://substack.com',
      highlight: false,
      tag: 'Read',
    },
    {
      id: 'tech-stack',
      title: 'My 2026 Production Tech Stack',
      subtitle: 'Curated list of frameworks, cloud services & development tools',
      url: 'https://github.com',
      highlight: false,
    },
    {
      id: 'community',
      title: 'Discord Engineering Community',
      subtitle: 'Join 4,200+ developers discussing system design and career growth',
      url: 'https://discord.com',
      highlight: false,
      tag: 'Community',
    },
  ] as CustomLink[],
};
