import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Code, Sparkles } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Create Badge', path: '/generate' },
    { name: 'About', path: '/about' },
    { name: 'Privacy', path: '/privacy' }
  ];

  const isActive = (path) => location.pathname === path;

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
              FRAME GENERATOR
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative font-sans text-sm font-semibold tracking-wide transition-colors duration-200 hover:text-white ${
                isActive(item.path) ? 'text-white' : 'text-slate-400'
              }`}
            >
              {item.name}
              {isActive(item.path) && (
                <span className="absolute left-0 -bottom-[21px] h-[2px] w-full bg-gradient-to-r from-brand-purple to-brand-orange" />
              )}
            </Link>
          ))}
        </nav>

        {/* CTA Button (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/generate"
            className="group relative flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-5 py-2 text-sm font-bold tracking-wide text-white transition-all duration-300 hover:bg-white/10 hover:border-brand-purple/50"
          >
            <Sparkles className="h-4 w-4 text-brand-yellow group-hover:rotate-12 transition-transform duration-300" />
            Build Badge
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-slate-300 hover:text-white"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#05070f]/95 px-4 py-4 backdrop-blur-lg">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block text-base font-semibold py-2 px-3 rounded-xl ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-brand-purple/20 to-brand-orange/20 text-white border-l-2 border-brand-orange'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/generate"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-brand-purple to-brand-orange py-3 text-center text-sm font-bold text-white shadow-lg shadow-brand-purple/20 hover:opacity-90"
            >
              <Sparkles className="h-4 w-4 text-brand-yellow" />
              Build Badge
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
