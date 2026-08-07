import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Camera, User, Briefcase, Cpu, Sparkles, 
  RefreshCw, CheckCircle, AlertCircle, ArrowRight
} from 'lucide-react';
import { generateFrame, generateCard } from '../services/api';
import toast from 'react-hot-toast';

export default function Generator() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Set tab based on landing page selection or default to 'frame'
  const [activeTab, setActiveTab] = useState('frame');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isHeic, setIsHeic] = useState(false);
  
  // Generation & progress state
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState(0);
  const [enhanceColors, setEnhanceColors] = useState(true);
  const [removeBg, setRemoveBg] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: '',
      role: '',
      stack: ''
    }
  });

  useEffect(() => {
    if (location.state?.initialTab) {
      setActiveTab(location.state.initialTab);
    }
  }, [location]);

  // Handle file drop validation
  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      const err = rejectedFiles[0].errors[0];
      if (err.code === 'file-too-large') {
        toast.error('Image is too large. Maximum size allowed is 10MB.');
      } else {
        toast.error(err.message || 'File upload rejected.');
      }
      return;
    }

    if (acceptedFiles.length === 0) return;

    const selectedFile = acceptedFiles[0];
    const extension = selectedFile.name.split('.').pop().toLowerCase();
    
    setFile(selectedFile);
    setIsHeic(extension === 'heic' || extension === 'heif');

    // Create object URL for standard images, HEIC can't be rendered directly by browsers
    if (extension !== 'heic' && extension !== 'heif') {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(''); // Clear preview but store file
    }
    toast.success('Image loaded successfully.');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic'],
      'image/heif': ['.heif']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const clearFile = () => {
    setFile(null);
    setPreviewUrl('');
    setIsHeic(false);
  };

  // Generation progress steps list
  const pfpSteps = [
    'Reading image details...',
    'Uploading image (HEIC conversion auto-run)...',
    'Applying smart center cover-crop...',
    'Executing circular mask cutout...',
    'Rendering HH Goa 2026 beach frame overlay...',
    'Compressing PNG and finalizing upload...'
  ];

  const cardSteps = [
    'Reading metadata and image data...',
    'Uploading content to image pipeline...',
    'Drawing neon gradients and glassmorphism borders...',
    'Engraving name, role, and tech stack details...',
    'Rolling randomized builder title badge...',
    'Generating QR code pointing to public share page...',
    'Compositing all badge layers and graphics...'
  ];

  const stepsList = activeTab === 'frame' ? pfpSteps : cardSteps;

  // Set up ticker to update loading description text
  useEffect(() => {
    let interval;
    if (isGenerating) {
      setGenerationStep(0);
      interval = setInterval(() => {
        setGenerationStep((prev) => {
          if (prev < stepsList.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 700);
    } else {
      setGenerationStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating, activeTab, stepsList.length]);

  const onSubmit = async (data) => {
    if (!file) {
      toast.error('Please upload a photo first.');
      return;
    }

    setIsGenerating(true);
    setUploadProgress(0);

    try {
      let res;
      if (activeTab === 'frame') {
        res = await generateFrame(
          file, 
          enhanceColors, 
          (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        );
      } else {
        res = await generateCard(
          file, 
          {
            name: data.name,
            role: data.role,
            stack: data.stack
          },
          enhanceColors, 
          (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        );
      }

      toast.success('Successfully generated badge!');
      // Navigate to share/preview page passing state so we know it was freshly generated (confetti trigger)
      navigate(`/share/${res.data.shareId}`, { state: { justGenerated: true } });
    } catch (err) {
      console.error('Generation failed:', err);
      toast.error(err.response?.data?.error || 'Failed to generate frame. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-20 lg:py-24 relative z-10">
      
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
        <h1 className="text-3xl sm:text-5xl font-sans font-black text-white">
          Create Your <span className="text-gradient">HH Goa 2026</span> Badge
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-400">
          Upload a selfie or profile picture, choose your configuration, and get your beautiful branded image instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Upload & Customization Form (8 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Tab Selector */}
          <div className="flex rounded-2xl border border-white/5 bg-brand-card p-1">
            <button
              onClick={() => { if(!isGenerating) setActiveTab('frame'); }}
              disabled={isGenerating}
              className={`flex-1 rounded-xl py-3.5 text-sm font-extrabold transition-all duration-300 ${
                activeTab === 'frame'
                  ? 'bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Profile Frame (Format A)
            </button>
            <button
              onClick={() => { if(!isGenerating) setActiveTab('card'); }}
              disabled={isGenerating}
              className={`flex-1 rounded-xl py-3.5 text-sm font-extrabold transition-all duration-300 ${
                activeTab === 'card'
                  ? 'bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Builder ID Card (Format B)
            </button>
          </div>

          {/* Form and Configuration Box */}
          <div className="glass-card rounded-3xl p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              
              {/* Photo Upload Section */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-extrabold text-slate-300 tracking-wide">
                  UPLOAD PHOTO <span className="text-brand-orange">*</span>
                </label>
                
                {!file ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
                      isDragActive 
                        ? 'border-brand-purple bg-brand-purple/5' 
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-10 w-10 text-slate-400 mx-auto mb-4 animate-bounce" />
                    <p className="text-sm sm:text-base font-bold text-white">
                      Drag & drop your profile photo
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Supports JPG, PNG, WEBP, and HEIC/HEIF (max 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-brand-dark border border-white/10 flex items-center justify-center">
                        {isHeic ? (
                          <Camera className="h-6 w-6 text-brand-orange" />
                        ) : (
                          <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; {isHeic ? 'iPhone HEIC Format (Auto-conversion enabled)' : 'Ready'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearFile}
                      disabled={isGenerating}
                      className="rounded-xl border border-white/10 px-3.5 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Text Fields for Card (Only shown if card tab active) */}
              <AnimatePresence mode="wait">
                {activeTab === 'card' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-5 overflow-hidden"
                  >
                    {/* Name Input */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="name" className="text-sm font-extrabold text-slate-300 tracking-wide flex items-center gap-1.5">
                        <User className="h-4 w-4 text-brand-purple" />
                        FULL NAME <span className="text-brand-orange">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="E.g., Dev Hacker"
                        {...register('name', { 
                          required: 'Full name is required for badge card generation.',
                          maxLength: { value: 24, message: 'Name must not exceed 24 characters.' }
                        })}
                        className={`rounded-xl border bg-brand-dark px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-purple ${
                          errors.name ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10'
                        }`}
                      />
                      {errors.name && <span className="text-xs text-red-400 font-medium">{errors.name.message}</span>}
                    </div>

                    {/* Role Input */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="role" className="text-sm font-extrabold text-slate-300 tracking-wide flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4 text-brand-blue" />
                        ROLE <span className="text-brand-orange">*</span>
                      </label>
                      <input
                        id="role"
                        type="text"
                        placeholder="E.g., Full Stack Engineer"
                        {...register('role', { 
                          required: 'Role is required for badge card generation.',
                          maxLength: { value: 30, message: 'Role must not exceed 30 characters.' }
                        })}
                        className={`rounded-xl border bg-brand-dark px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-purple ${
                          errors.role ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10'
                        }`}
                      />
                      {errors.role && <span className="text-xs text-red-400 font-medium">{errors.role.message}</span>}
                    </div>

                    {/* Tech Stack Input */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="stack" className="text-sm font-extrabold text-slate-300 tracking-wide flex items-center gap-1.5">
                        <Cpu className="h-4 w-4 text-brand-orange" />
                        TECH STACK <span className="text-brand-orange">*</span>
                      </label>
                      <input
                        id="stack"
                        type="text"
                        placeholder="E.g., React, Node, Tailwind, Mongo"
                        {...register('stack', { 
                          required: 'Tech stack is required.',
                          maxLength: { value: 45, message: 'Stack list must not exceed 45 characters.' }
                        })}
                        className={`rounded-xl border bg-brand-dark px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-purple ${
                          errors.stack ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10'
                        }`}
                      />
                      {errors.stack && <span className="text-xs text-red-400 font-medium">{errors.stack.message}</span>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Toggles (Nice Extras!) */}
              <div className="border-t border-white/5 pt-5 flex flex-col gap-4">
                
                {/* Auto Color Enhancement Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-brand-yellow fill-brand-yellow/20" />
                      Auto Color Enhancement
                    </span>
                    <span className="text-xs text-slate-500">Corrects brightness, saturation, and exposure automatically</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnhanceColors(!enhanceColors)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      enhanceColors ? 'bg-brand-purple' : 'bg-white/15'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        enhanceColors ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* AI Background Removal Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      <RefreshCw className="h-4 w-4 text-brand-orange" />
                      Client-Side Background Removal (Preview)
                    </span>
                    <span className="text-xs text-slate-500">Simulates cutout effect inside the live preview box</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRemoveBg(!removeBg)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      removeBg ? 'bg-brand-orange' : 'bg-white/15'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        removeBg ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

              </div>

              {/* Submit Buttons */}
              <div className="border-t border-white/5 pt-5">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full relative flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand-purple via-brand-blue to-brand-orange py-4 text-base font-extrabold text-white shadow-xl shadow-brand-purple/20 hover:opacity-95 active:scale-98 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isGenerating ? 'Processing...' : activeTab === 'frame' ? 'Generate Profile Frame' : 'Generate Builder Card'}
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Right Side: Real-time Live Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
          <h3 className="text-sm font-extrabold text-slate-300 tracking-wide">
            LIVE PREVIEW (REAL-TIME)
          </h3>

          <div className="glass-card rounded-3xl p-5 relative overflow-hidden flex items-center justify-center aspect-square md:aspect-[4/5] lg:aspect-auto min-h-[400px]">
            
            {/* Live mockup render depending on tab selection */}
            {activeTab === 'frame' ? (
              // Profile Frame Mockup
              <div className="relative w-72 h-72 rounded-full overflow-hidden flex items-center justify-center border-4 border-dashed border-white/10 bg-brand-dark">
                {file && previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Selfie" 
                    className={`h-full w-full object-cover transition-all duration-300 ${
                      removeBg ? 'brightness-110 saturate-[1.05] contrast-105 filter hue-rotate-15' : ''
                    } ${enhanceColors ? 'brightness-105 saturate-[1.1]' : ''}`}
                  />
                ) : (
                  <div className="text-center p-4 flex flex-col items-center">
                    <Camera className="h-10 w-10 text-slate-600 mb-2" />
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Circular Crop Area</span>
                  </div>
                )}
                
                {/* SVG Overlay representing the frame */}
                <div className="absolute inset-0 pointer-events-none w-full h-full">
                  <svg width="100%" height="100%" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <defs>
                      <linearGradient id="liveBeach" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#8B5CF6" />
                        <stop offset="35%" stop-color="#3B82F6" />
                        <stop offset="70%" stop-color="#F97316" />
                        <stop offset="100%" stop-color="#EAB308" />
                      </linearGradient>
                    </defs>
                    {/* Glowing ring */}
                    <circle cx="540" cy="540" r="515" stroke="url(#liveBeach)" stroke-width="36" fill="none" />
                    {/* Palm Leaves */}
                    <path d="M120,400 Q80,500 130,600 Q180,500 120,400 Z" fill="url(#liveBeach)" opacity="0.8" />
                    <path d="M960,400 Q1000,500 950,600 Q900,500 960,400 Z" fill="url(#liveBeach)" opacity="0.8" />
                    {/* Wave bottom lines */}
                    <path d="M160,780 Q320,830 540,780 T920,780 L920,850 L160,850 Z" fill="url(#liveBeach)" opacity="0.2" />
                    {/* Banner */}
                    <rect x="340" y="910" width="400" height="76" rx="38" fill="#0A0F1D" fill-opacity="0.9" stroke="url(#liveBeach)" stroke-width="5" />
                    <text x="540" y="958" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="30" font-weight="900" letter-spacing="6" text-anchor="middle">HH GOA 2026</text>
                    {/* Top Tag */}
                    <rect x="440" y="66" width="200" height="42" rx="21" fill="#0A0F1D" fill-opacity="0.9" stroke="url(#liveBeach)" stroke-width="3" />
                    <text x="540" y="92" fill="#EAB308" font-family="system-ui, sans-serif" font-size="16" font-weight="800" letter-spacing="3" text-anchor="middle">BUILDER</text>
                  </svg>
                </div>
              </div>
            ) : (
              // Builder Badge Card Mockup (w-72, aspect-ratio matching 4:5)
              <div className="relative w-72 h-[360px] rounded-3xl overflow-hidden bg-brand-dark border border-white/10 flex flex-col justify-between p-4 shadow-xl">
                {/* Beach Glowing Background orbs */}
                <div className="absolute inset-0 bg-[#0C0F1D] z-0" />
                <div className="absolute top-10 left-4 h-32 w-32 rounded-full bg-brand-purple/15 blur-2xl z-0" />
                <div className="absolute bottom-10 right-4 h-32 w-32 rounded-full bg-brand-orange/10 blur-2xl z-0" />
                <div className="absolute inset-0 border border-white/5 rounded-3xl z-0" />

                {/* Header branding */}
                <div className="flex justify-between items-center z-10 border-b border-white/5 pb-2">
                  <span className="text-[10px] font-black text-white tracking-widest">HH GOA 2026</span>
                  <span className="text-[8px] font-bold text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full border border-brand-orange/20 tracking-wider">BUILDER</span>
                </div>

                {/* Photo space */}
                <div className="my-auto mx-auto h-32 w-32 rounded-2xl overflow-hidden border-2 border-brand-purple relative z-10 flex items-center justify-center bg-slate-900 shadow-md">
                  {file && previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Selfie" 
                      className={`h-full w-full object-cover transition-all duration-300 ${
                        removeBg ? 'brightness-110 saturate-[1.05]' : ''
                      } ${enhanceColors ? 'brightness-105 saturate-[1.1]' : ''}`}
                    />
                  ) : (
                    <Camera className="h-8 w-8 text-slate-700" />
                  )}
                </div>

                {/* User Info (Live feedback) */}
                <div className="text-center z-10 flex flex-col gap-0.5 mt-2">
                  <h4 className="text-base font-extrabold text-white leading-tight truncate">
                    {/* Live update of name */}
                    {errors.name ? 'Invalid Name' : 'YOUR NAME'}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold truncate">ROLE / TITLE</p>
                  <p className="text-[8px] text-slate-500 font-medium truncate mt-0.5">REACT, NODE, TAILWIND</p>
                </div>

                {/* Footer details + QR representation */}
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 z-10 text-[8px] text-slate-500 font-mono">
                  <div className="text-left leading-relaxed">
                    <div>SYS: HH-GOA-2026</div>
                    <div>STATUS: <span className="text-emerald-500 font-bold">VERIFIED</span></div>
                  </div>
                  <div className="h-10 w-10 rounded border border-white/10 bg-slate-900 p-0.5 flex items-center justify-center">
                    {/* QR Placeholder */}
                    <div className="grid grid-cols-3 gap-0.5 w-full h-full opacity-60">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className={`bg-white rounded-[1px] ${i % 3 === 0 || i % 4 === 0 ? 'opacity-100' : 'opacity-25'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>

      </div>

      {/* Loading Modal Overlay during generation */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card rounded-3xl p-8 max-w-md w-full border border-white/10 text-center relative overflow-hidden"
            >
              {/* Animated loading ring */}
              <div className="relative h-20 w-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                <div className="absolute inset-0 rounded-full border-4 border-t-brand-purple border-r-brand-orange animate-spin" />
                <Sparkles className="absolute inset-0 m-auto h-7 w-7 text-brand-yellow animate-pulse" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Generating Your Badge</h3>
              
              {/* Dynamic steps ticker */}
              <p className="text-sm text-slate-400 font-medium h-6 mb-6">
                {stepsList[generationStep]}
              </p>

              {/* Progress bar */}
              <div className="relative w-full h-2 rounded-full bg-white/5 overflow-hidden mb-2">
                <div 
                  className="h-full bg-gradient-to-r from-brand-purple to-brand-orange rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>Upload Progress</span>
                <span>{uploadProgress}%</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
