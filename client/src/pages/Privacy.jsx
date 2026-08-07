import { motion } from 'framer-motion';
import { ShieldCheck, EyeOff, FileLock2, Trash2 } from 'lucide-react';

export default function Privacy() {
  const points = [
    {
      icon: EyeOff,
      title: 'No Tracking or Analytics',
      description: 'We do not run tracking cookies, analytics trackers, or display advertisements. Your name and details are only used to construct the badge.',
      color: 'text-brand-purple'
    },
    {
      icon: Trash2,
      title: 'Automatic 24-Hour TTL Deletion',
      description: 'To protect your privacy and reduce storage footprint, all generated badges, metadata records, and uploaded files are automatically deleted from MongoDB and Cloudinary/local disks exactly 24 hours after creation.',
      color: 'text-brand-orange'
    },
    {
      icon: FileLock2,
      title: 'Secure In-Memory Processing',
      description: 'Photos are uploaded via secure memory-storage buffers. File type validation is enforced on all APIs to prevent execution vulnerability.',
      color: 'text-brand-blue'
    }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-20 lg:py-24 relative z-10 text-left">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-5xl font-sans font-black text-white"
        >
          Privacy <span className="text-gradient">Policy</span>
        </motion.h1>
        <p className="mt-4 text-sm sm:text-base text-slate-400">
          How we securely process your photo and manage your data.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-10 border-white/5 flex flex-col gap-8">
        
        <div className="flex items-center gap-3 pb-6 border-b border-white/5">
          <ShieldCheck className="h-8 w-8 text-emerald-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">Your Privacy is Our Priority</h2>
        </div>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          The HH Goa 2026 Frame Generator is built as an open, community utility tool. We understand that uploading photos requires high levels of trust, which is why we enforce strict, privacy-first security boundaries on our servers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
          {points.map((point, idx) => {
            const Icon = point.icon;
            return (
              <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                  <Icon className={`h-5 w-5 ${point.color}`} />
                </div>
                <h3 className="text-sm font-bold text-white">{point.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{point.description}</p>
              </div>
            );
          })}
        </div>

        <div className="border-t border-white/5 pt-6 text-xs text-slate-500 flex flex-col gap-2">
          <p>Last updated: August 2026</p>
          <p>For inquiries, codebase source references, or direct support regarding your badge records, feel free to reach out to the HH Goa 2026 organizing team.</p>
        </div>

      </div>
    </div>
  );
}
