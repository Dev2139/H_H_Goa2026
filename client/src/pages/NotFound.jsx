import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center relative z-10">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="glass-card rounded-3xl p-8 border-white/5 shadow-2xl relative overflow-hidden"
      >
        {/* Glowing floating decorative element */}
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-brand-orange/10 blur-2xl animate-pulse" />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mx-auto mb-6">
          <Compass className="h-8 w-8 text-brand-orange animate-spin" style={{ animationDuration: '10s' }} />
        </div>

        <h1 className="text-6xl font-black text-white">404</h1>
        <h2 className="text-xl font-bold text-white mt-4">Lost at Sea</h2>
        
        <p className="text-sm text-slate-400 mt-2 mb-8 leading-relaxed">
          It looks like you've drifted off the coast of Goa. The page you are looking for does not exist or has expired.
        </p>

        <button
          onClick={() => navigate('/')}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-blue py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-purple/20 hover:opacity-95 active:scale-95 transition-all duration-200"
        >
          <Home className="h-4 w-4" />
          Return Home
        </button>
      </motion.div>
    </div>
  );
}
