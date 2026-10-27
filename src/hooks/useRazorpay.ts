import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function useRazorpayScript() {
  const [isLoaded, setIsLoaded] = useState<boolean>(() => {
    return typeof window !== 'undefined' && Boolean(window.Razorpay);
  });
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.Razorpay) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoaded(true));
      existingScript.addEventListener('error', () => setHasError(true));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      console.error('Failed to load Razorpay Standard Checkout SDK from CDN.');
      setHasError(true);
    };

    document.body.appendChild(script);

    return () => {
      // keep script attached for future checkouts
    };
  }, []);

  return { isLoaded, hasError };
}
