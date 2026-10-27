import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

interface MobileStickyCTAProps {
  startingPriceINR?: number;
}

export const MobileStickyCTA: React.FC<MobileStickyCTAProps> = ({
  startingPriceINR = 1499,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Do not show sticky CTA if already on the booking, payment, or status pages
  if (
    location.pathname === '/book' ||
    location.pathname === '/payment' ||
    location.pathname === '/checkout' ||
    location.pathname.startsWith('/status')
  ) {
    return null;
  }

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-[#09090b]/95 backdrop-blur-md border-t border-zinc-800 shadow-2xl animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="text-left">
          <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono font-semibold">
            <Clock className="w-3 h-3" />
            <span>45-MIN CONSULTATION</span>
          </div>
          <div className="text-xs font-bold text-white">
            From ₹{startingPriceINR.toLocaleString('en-IN')}{' '}
            <span className="text-[10px] text-zinc-400 font-normal">INR</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/book')}
          className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-105 active:scale-95 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/60 cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book Session</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
