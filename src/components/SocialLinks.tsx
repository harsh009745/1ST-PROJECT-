import React from 'react';
import { Github, Twitter, Linkedin, Youtube, Instagram, Mail, ExternalLink } from 'lucide-react';
import { PROFILE_CONFIG, SocialLink } from '../config/profileConfig';

interface SocialLinksProps {
  socials?: SocialLink[];
}

export const SocialLinks: React.FC<SocialLinksProps> = ({ socials = PROFILE_CONFIG.socials }) => {
  const renderIcon = (platform: string) => {
    switch (platform) {
      case 'github':
        return <Github className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'twitter':
        return <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'youtube':
        return <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'instagram':
        return <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'mail':
        return <Mail className="w-4 h-4 sm:w-5 sm:h-5" />;
      default:
        return <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  return (
    <nav aria-label="Social links" className="flex items-center justify-center gap-2.5 py-2 px-4">
      {socials.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
          title={item.label}
          className="p-3 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        >
          {renderIcon(item.platform)}
        </a>
      ))}
    </nav>
  );
};
