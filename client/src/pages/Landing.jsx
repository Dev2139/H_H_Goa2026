import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Camera, Shield, Zap, Smartphone, ArrowRight } from 'lucide-react';
import { getRecentBadges } from '../services/api';
import toast from 'react-hot-toast';

export default function Landing() {
  const navigate = useNavigate();
  const [recentBadges, setRecentBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const response = await getRecentBadges();
        setRecentBadges(response.data);
      } catch (err) {
        console.error('Failed to fetch recent gallery:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  const features = [
    {
      icon: Zap,
      title: 'Fast Generation',
      description: 'Create your high-resolution badge or frame in under 3 seconds.',
      color: 'text-brand-orange'
    },
    {
      icon: Smartphone,
      title: 'Works on iPhone',
      description: 'Full iPhone support including automatic HEIC image conversion.',
      color: 'text-brand-blue'
    },
    {
      icon: Shield,
      title: 'Privacy Focused',
      description: 'Your uploaded photos are automatically deleted after 24 hours.',
      color: 'text-brand-purple'
    },
    {
      icon: Camera,
      title: 'Smart Crop',
      description: 'Auto-alignment, zoom, and framing. No manual cropping needed.',
      color: 'text-brand-yellow'
    }
  ];

  // Fallback demo gallery items
  const mockupGallery = [
    { shareId: 'demo1', imageType: 'card', name: 'Alice Dev', builderTitle: 'CODE ALCHEMIST' },
    { shareId: 'demo2', imageType: 'frame', name: '', builderTitle: '' },
    { shareId: 'demo3', imageType: 'card', name: 'Bob Hacker', builderTitle: 'FRONTEND WIZARD' },
    { shareId: 'demo4', imageType: 'frame', name: '', builderTitle: '' },
  ];

  const galleryItems = recentBadges.length > 0 ? recentBadges.slice(0, 4) : mockupGallery;

  return (
    <div className="relative w-full py-12 sm:py-20 lg:py-24">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-brand-purple/5 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Glowing Announcement Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-brand-purple/20 bg-brand-purple/5 px-4 py-1.5 text-xs font-semibold text-brand-purple mb-8 sm:mb-10 shadow-lg shadow-brand-purple/5"
        >
          <Sparkles className="h-3.5 w-3.5 text-brand-yellow fill-brand-yellow/20" />
          <span>HH GOA 2026 OFFICIAL TOOL</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-sans font-black tracking-tight leading-[1.1] text-white max-w-4xl mx-auto"
        >
          Frame Yourself for <br className="hidden sm:inline" />
          <span className="text-gradient">HH Goa 2026</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          Generate your official, premium event frame or customizable builder ID card in seconds. Join the developer community and showcase your stack!
        </motion.p>

        {/* Call to Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
        >
          <button
            onClick={() => navigate('/generate', { state: { initialTab: 'frame' } })}
            className="w-full sm:w-auto group relative flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-blue px-8 py-4 text-base font-bold text-white shadow-xl shadow-brand-purple/20 hover:opacity-95 active:scale-95 transition-all duration-200"
          >
            Generate Frame
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          
          <button
            onClick={() => navigate('/generate', { state: { initialTab: 'card' } })}
            className="w-full sm:w-auto group flex items-center justify-center gap-2.5 rounded-2xl bg-white/5 border border-white/10 px-8 py-4 text-base font-bold text-white hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all duration-200"
          >
            Create Builder Card
          </button>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 sm:mt-32 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx}
                className="glass-card rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:border-white/10 group"
              >
                <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-brand-purple/5 blur-2xl pointer-events-none group-hover:bg-brand-purple/10 transition-colors" />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 mb-5">
                  <Icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-base font-bold text-white tracking-wide">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Showcase Gallery */}
        <div className="mt-24 sm:mt-36 border-t border-white/5 pt-20">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-sans font-extrabold tracking-tight text-white"
          >
            Recent Builder Badges
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm text-slate-400 mt-2 mb-12"
          >
            See badges recently generated by hackers attending HH Goa 2026.
          </motion.p>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square glass-card rounded-2xl shimmer-wrapper" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {galleryItems.map((item, index) => (
                <motion.div
                  key={item.shareId + index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    if (item.shareId.startsWith('demo')) {
                      toast.error('This is a demo card. Build your own badge below!');
                    } else {
                      navigate(`/share/${item.shareId}`);
                    }
                  }}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl glass-card border border-white/5 p-2 transition-transform duration-300 hover:-translate-y-2"
                >
                  <div className="aspect-[4/5] relative rounded-xl overflow-hidden bg-brand-dark flex items-center justify-center">
                    {item.shareId.startsWith('demo') ? (
                      <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-br from-brand-card to-black">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                          <span>HH GOA 2026</span>
                          <span className="text-emerald-500 font-mono">VERIFIED</span>
                        </div>
                        <div className="h-20 w-20 rounded-full bg-slate-800 mx-auto border border-brand-purple" />
                        <div className="text-center">
                          <h4 className="text-xs font-bold text-white">{item.name}</h4>
                          <span className="text-[8px] font-black text-brand-orange mt-0.5 tracking-wider">{item.builderTitle}</span>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={item.generatedImageUrl} 
                        alt={item.name || 'HH Goa Badge'} 
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    )}
                  </div>
                  {item.name && (
                    <div className="p-2 text-left">
                      <p className="text-xs font-bold text-white truncate">{item.name}</p>
                      <p className="text-[10px] text-brand-orange font-semibold truncate">{item.builderTitle}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-10">
            <button
              onClick={() => navigate('/generate')}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 hover:border-brand-purple/50 bg-white/5 px-6 py-3 text-sm font-bold text-white transition-all duration-200"
            >
              Generate Your Own Badge
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
