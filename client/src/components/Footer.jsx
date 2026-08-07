import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-[#05070f] py-8 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-purple to-transparent opacity-50" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} HH Goa Frame & Badge Generator. All rights reserved.
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
