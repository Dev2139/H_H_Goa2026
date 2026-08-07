import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Twitter, ArrowLeft, RefreshCw, Share2, 
  QrCode, ExternalLink, Calendar, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { getBadgeMetadata } from '../services/api';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

export default function Preview() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Trigger confetti if navigated from fresh generation
  useEffect(() => {
    if (location.state?.justGenerated) {
      // Fire confetti multiple times for celebration
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, animate a bit higher than random
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);
    }
  }, [location]);

  // Fetch Badge Metadata
  useEffect(() => {
    async function loadMetadata() {
      setLoading(true);
      try {
        const response = await getBadgeMetadata(shareId);
        setMetadata(response.data);
      } catch (err) {
        console.error('Failed to load badge metadata:', err);
        setError(err.response?.data?.error || 'Could not retrieve your badge. It may have expired.');
      } finally {
        setLoading(false);
      }
    }
    loadMetadata();
  }, [shareId]);

  // Download Image Handler
  const handleDownload = async () => {
    if (!metadata?.generatedImageUrl) return;
    setDownloading(true);
    try {
      const response = await fetch(metadata.generatedImageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `hh-goa-2026-${metadata.imageType === 'frame' ? 'pfp' : 'badge'}-${shareId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Download started successfully!');
    } catch (err) {
      console.error('AJAX blob download failed, falling back to direct tab:', err);
      // Fallback: open in new window
      window.open(metadata.generatedImageUrl, '_blank');
      toast.success('Opened image in a new tab for download.');
    } finally {
      setDownloading(false);
    }
  };

  // Copy shareable link to clipboard
  const handleCopyLink = () => {
    const frontendUrl = window.location.origin;
    const shareUrl = `${frontendUrl}/share/${shareId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Shareable link copied to clipboard!');
  };

  // Generate X (Twitter) Intent
  const handleShareToX = () => {
    // We point X to our server-side redirect route because that route serves the static Open Graph HTML tags for Twitter Cards!
    // E.g., http://localhost:5000/share/a1b2c3d4 or https://api-server.com/share/a1b2c3d4
    const apiBaseUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5000';
      
    const serverShareUrl = `${apiBaseUrl}/share/${shareId}`;
    
    const text = metadata?.imageType === 'card'
      ? `Excited for HH Goa 2026! Just created my official Builder Card 🚀\nJoin the wave and frame yours here:`
      : `Excited for HH Goa 2026! Just generated my official event profile frame 🌊\nJoin the wave and frame yours here:`;
      
    const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(serverShareUrl)}&hashtags=FrameInGoa,HHGoa2026`;
    window.open(twitterIntentUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center flex flex-col items-center justify-center">
        <div className="w-72 h-[360px] rounded-3xl glass-card shimmer-wrapper mb-8" />
        <p className="text-slate-400 font-semibold animate-pulse">Loading your custom badge...</p>
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="glass-card rounded-3xl p-8 border-red-500/20">
          <ShieldAlert className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Badge Not Found</h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            {error || 'The requested badge does not exist. Please note that all generated images automatically expire and are deleted after 24 hours.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full rounded-2xl bg-gradient-to-r from-brand-purple to-brand-blue py-3.5 text-sm font-bold text-white shadow-lg"
          >
            Create a New Badge
          </button>
        </div>
      </div>
    );
  }

  const { name, role, stack, builderTitle, imageType, generatedImageUrl } = metadata;
  const isPfp = imageType === 'frame';

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-20 lg:py-24 relative z-10">
      
      {/* Back button */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Generator
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Generated Badge/Frame View (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className={`relative rounded-3xl overflow-hidden glass-card p-3 border-white/10 shadow-2xl ${
              isPfp ? 'aspect-square w-80 sm:w-96' : 'aspect-[4/5] w-80 sm:w-96'
            }`}
          >
            {/* The generated high-res graphic */}
            <img
              src={generatedImageUrl}
              alt={name || 'HH Goa Generated Badge'}
              className="w-full h-full object-cover rounded-2xl border border-white/5 shadow-inner"
            />
          </motion.div>
        </div>

        {/* Right Side: Showcase info & Social actions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              GENERATE SUCCESS
            </span>
            
            <h1 className="text-3xl sm:text-5xl font-sans font-black text-white mt-4">
              {isPfp ? 'Your Official Profile Frame' : `${name}'s Builder Badge`}
            </h1>
            
            {!isPfp && (
              <p className="mt-2 text-base font-extrabold text-brand-orange tracking-widest font-mono">
                AUTO TITLE: {builderTitle}
              </p>
            )}
          </div>

          <div className="glass-card rounded-2xl p-6 border-white/5 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Calendar className="h-4.5 w-4.5 text-brand-purple" />
              <span>Expires in 24 hours (Automated TTL cleanup)</span>
            </div>
            
            {!isPfp && (
              <div className="text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-4 flex flex-col gap-1">
                <div><span className="font-semibold text-slate-300">Role:</span> {role}</div>
                <div><span className="font-semibold text-slate-300">Stack:</span> {stack}</div>
              </div>
            )}
          </div>

          {/* Action Buttons Grid */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
            
            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-blue py-4 text-base font-extrabold text-white shadow-xl shadow-brand-purple/20 hover:opacity-95 active:scale-95 transition-all duration-200"
            >
              <Download className="h-5 w-5" />
              {downloading ? 'Downloading...' : 'Download PNG'}
            </button>

            {/* Share to X Button */}
            <button
              onClick={handleShareToX}
              className="flex items-center justify-center gap-2.5 rounded-2xl bg-[#000000] border border-white/10 hover:border-white/20 py-4 text-base font-extrabold text-white hover:bg-white/[0.03] active:scale-95 transition-all duration-200"
            >
              <Twitter className="h-5 w-5 text-[#1DA1F2] fill-[#1DA1F2]" />
              Share to X
            </button>

            {/* Share Link Copier */}
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 py-4 text-sm font-bold text-white transition-all duration-200"
            >
              <Share2 className="h-4.5 w-4.5 text-brand-orange" />
              Copy Share Link
            </button>

            {/* QR Scanner Display */}
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center justify-center gap-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 py-4 text-sm font-bold text-white transition-all duration-200"
            >
              <QrCode className="h-4.5 w-4.5 text-brand-yellow" />
              View QR Scan Code
            </button>

          </div>

          <div className="border-t border-white/5 pt-6 flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-orange hover:text-white transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Generate Another Badge
            </button>
          </div>

        </div>

      </div>

      {/* QR Code Scanner Modal */}
      <AnimatePresence>
        {showQrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-card rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-white/10 text-center"
            >
              <h3 className="text-xl font-bold text-white mb-2">Scan on Your Phone</h3>
              <p className="text-xs text-slate-400 mb-6">
                Scan this QR code with your mobile camera to view, save, and share this badge directly from your phone.
              </p>

              {/* QR Image wrapper. We point directly to a dynamic online QR renderer or render inside canvas.
                  Since we want zero dependencies for QR rendering on client, we can construct the API url to fetch QR buffer, 
                  or use a free reliable QR API: https://api.qrserver.com/v1/create-qr-code/! This is standard and 100% reliable. */}
              <div className="bg-white p-4 rounded-2xl inline-block mx-auto mb-6">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    `${window.location.origin}/share/${shareId}`
                  )}`}
                  alt="QR Code Link"
                  className="h-48 w-48"
                  loading="lazy"
                />
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href={`${window.location.origin}/share/${shareId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10"
                >
                  Open sharing page
                  <ExternalLink className="h-3 w-3" />
                </a>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Close Modal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
