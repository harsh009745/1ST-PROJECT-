import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Copy, Check, Smartphone, ExternalLink } from 'lucide-react';

interface QRCodeSectionProps {
  url?: string;
  profileName?: string;
}

export const QRCodeSection: React.FC<QRCodeSectionProps> = ({
  url,
  profileName = 'Aaditya Sharma',
}) => {
  const [targetUrl, setTargetUrl] = useState<string>(url || '');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    const finalUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://example.com');
    setTargetUrl(finalUrl);

    setIsGenerating(true);
    // Generate crisp QR code with emerald styling & high contrast
    QRCode.toDataURL(finalUrl, {
      width: 480,
      margin: 2,
      color: {
        dark: '#09090b', // Deep charcoal foreground for high optical readability on light bg
        light: '#ffffff', // Clean white quiet zone for reliable mobile camera scanning
      },
      errorCorrectionLevel: 'M',
    })
      .then((dataUrl: string) => {
        setQrDataUrl(dataUrl);
        setIsGenerating(false);
      })
      .catch((err: unknown) => {
        console.error('Failed to generate QR code:', err);
        setIsGenerating(false);
      });
  }, [url]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    const sanitizedName = profileName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    a.download = `${sanitizedName}-link-in-bio-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <section aria-label="QR Code" className="w-full px-4 py-2">
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl overflow-hidden transition-all duration-300">
        {/* Toggle Bar */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-800/40 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-2xl cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800/40 text-amber-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-100 block">
                {isOpen ? 'Consultation Platform QR Code' : 'Scan on Mobile Phone'}
              </span>
              <span className="text-[11px] text-zinc-400">
                {isOpen ? 'Point camera to open website directly on mobile' : 'Tap to reveal high-resolution QR code'}
              </span>
            </div>
          </div>

          <span className="text-xs font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/40 px-3 py-1 rounded-full">
            {isOpen ? 'Hide QR' : 'Show QR'}
          </span>
        </button>

        {/* Expandable QR Content */}
        {isOpen && (
          <div className="px-5 pb-5 pt-2 flex flex-col items-center text-center animate-in fade-in slide-in-from-top-2 duration-200 border-t border-zinc-800/60 mt-1">
            <div className="p-3 bg-white rounded-2xl shadow-xl shadow-black/40 border border-zinc-200 mt-2">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code for ${profileName}'s profile`}
                  className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-zinc-400 text-xs">
                  {isGenerating ? 'Generating QR...' : 'Unable to render QR code'}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mt-3">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Point any phone camera or lens to open this bio instantly</span>
            </div>

            <p className="font-mono text-[11px] text-zinc-500 mt-1 max-w-xs truncate">
              {targetUrl}
            </p>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 mt-4 w-full max-w-xs">
              <button
                onClick={handleCopy}
                className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-zinc-700/60"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Link' : 'Copy Link'}</span>
              </button>

              <button
                onClick={handleDownload}
                disabled={!qrDataUrl}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-950"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PNG</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default QRCodeSection;
