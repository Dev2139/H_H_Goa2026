import { motion } from 'framer-motion';
import { Calendar, MapPin, Terminal, Compass, ShieldCheck } from 'lucide-react';

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-20 lg:py-24 relative z-10 text-left">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-5xl font-sans font-black text-white"
        >
          About <span className="text-gradient">HH Goa 2026</span>
        </motion.h1>
        <p className="mt-4 text-sm sm:text-base text-slate-400">
          Learn about the premier developer hackathon and the story behind the badge generator.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        
        {/* The Hackathon Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex-shrink-0">
            <Compass className="h-6 w-6 text-brand-purple" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-3">The Event: Hackathon Goa 2026</h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-4">
              HH Goa 2026 is India's flagship beachside hackathon, bringing together thousands of developers, designers, product managers, and builders. Over three days, teams compete to design, develop, and deploy innovative solutions across Web3, AI, Cloud Infrastructure, and Core Software engineering.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 border border-white/5">
                <Calendar className="h-3.5 w-3.5 text-brand-orange" />
                <span>Spring 2026</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 border border-white/5">
                <MapPin className="h-3.5 w-3.5 text-brand-blue" />
                <span>Goa, India</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* The Tool Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex-shrink-0">
            <Terminal className="h-6 w-6 text-brand-orange" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-3">The Badge & Frame Generator</h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              This application was engineered to let participants easily claim their visual hacker identity. Whether joining as an attendee, mentor, or sponsor, you can showcase your profile with:
            </p>
            <ul className="mt-4 list-disc pl-5 text-sm text-slate-400 space-y-2">
              <li>
                <strong className="text-slate-300">Profile Picture Frame:</strong> A circular cutout that seamlessly embeds your photo inside the official HH Goa 2026 tropical frame design, including palm leaf vectors and glowing sun gradients.
              </li>
              <li>
                <strong className="text-slate-300">Builder ID Card:</strong> A digital badge resembling a premium physical tech conference pass. It displays your stack, role, and generates an automated title badge (e.g. Frontend Wizard, AI Explorer) along with a scanning code linking others to your profile.
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Technical Architecture Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex-shrink-0">
            <ShieldCheck className="h-6 w-6 text-brand-blue" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-3">Architected for Speed & Reliability</h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Built on the high-performance MERN stack, the application processes image scaling, conversions, and rendering directly on the server utilizing the lightning-fast <span className="text-brand-orange font-semibold">Sharp</span> engine. It takes less than 3 seconds to crop, mask, and output your final 1080px high-resolution card. 
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
