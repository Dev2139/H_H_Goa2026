import { Link } from 'react-router-dom';
import { Code } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#05070f]/75 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-purple to-brand-orange p-[1.5px] transition-transform duration-300 group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-brand-dark">
              <Code className="h-5 w-5 text-brand-orange group-hover:text-brand-purple transition-colors duration-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-black text-lg tracking-wider text-white">
              HH GOA <span className="text-brand-orange">2026</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest -mt-1">
              BADGE MAKER
            </span>
          </div>
        </Link>

        {/* Small version tag to fill space elegantly */}
        <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3.5 py-1 text-xs font-bold text-slate-400">
          <span>v1.0.0</span>
        </div>
      </div>
    </header>
  );
}
