import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { PROFILE_CONFIG, CustomLink } from '../config/profileConfig';

interface ExternalLinksProps {
  links?: CustomLink[];
}

export const ExternalLinks: React.FC<ExternalLinksProps> = ({ links = PROFILE_CONFIG.customLinks }) => {
  return (
    <section aria-label="Featured links" className="w-full flex flex-col gap-2.5 px-4 py-2">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`relative flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            link.highlight
              ? 'bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/30 border-emerald-500/50 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-950/40'
              : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900/90 hover:border-zinc-700'
          }`}
        >
          <div className="flex flex-col text-left pr-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-300 transition-colors">
                {link.title}
              </span>
              {link.tag && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5" />
                  {link.tag}
                </span>
              )}
            </div>
            {link.subtitle && (
              <span className="text-xs text-zinc-400 mt-1 leading-snug">{link.subtitle}</span>
            )}
          </div>
          <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </a>
      ))}
    </section>
  );
};
