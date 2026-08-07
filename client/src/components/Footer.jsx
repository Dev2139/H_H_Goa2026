import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-[#05070f] py-12 relative overflow-hidden">
      {/* Background glow strip */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-purple to-transparent opacity-50" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 border-b border-white/5 pb-8 mb-8">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-sans font-black text-lg tracking-wider text-white">
              HH GOA <span className="text-brand-orange">2026</span>
            </span>
            <p className="text-xs font-bold text-slate-500 tracking-wider mt-1 text-center md:text-left">
              The official developer badge and profile frame generator.
            </p>
          </div>
          
          <div className="flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link to="/" className="hover:text-white transition-colors duration-200">Home</Link>
            <Link to="/generate" className="hover:text-white transition-colors duration-200">Generator</Link>
            <Link to="/about" className="hover:text-white transition-colors duration-200">About</Link>
            <Link to="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} HH Goa Frame Generator. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5 justify-center">
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 text-brand-orange fill-brand-orange animate-pulse" />
            <span>for the developer community.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
