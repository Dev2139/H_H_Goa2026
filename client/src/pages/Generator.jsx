import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Camera, User, Sparkles, 
  Volume2, VolumeX, Eye, Maximize2, Download, Twitter, Award, Sliders, RefreshCw
} from 'lucide-react';
import { generateFrame, generateCard } from '../services/api';
import toast from 'react-hot-toast';

export default function Generator() {
  const navigate = useNavigate();
  
  // Base states
  const [activeTab, setActiveTab] = useState('card'); // Default to card tab
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isHeic, setIsHeic] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  // Position, zoom, & fine-tuning states
  const [zoom, setZoom] = useState(1.0);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [colorFilter, setColorFilter] = useState('normal');
  const [selectedStyle, setSelectedStyle] = useState('emerald'); // For PFP frame style selection

  // Drag-to-pan states
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Generation & progress state
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState(0);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      name: '',
      stack: 'React, Node.js, Python, MongoDB, Docker, Figma',
      builderTitle: 'merge conflictor'
    }
  });

  const watchedName = watch('name') || 'Dev Patel';
  const watchedStack = watch('stack') || 'React, Node.js, Python, MongoDB, Docker, Figma';
  const watchedTitle = watch('builderTitle') || 'merge conflictor';

  // Drag-to-pan handlers
  const handlePointerDown = (e) => {
    if (!file || !previewUrl) return;
    setIsDraggingPhoto(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setPanStart({ x: panX, y: panY });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingPhoto) return;
    const diffX = e.clientX - dragStart.x;
    const diffY = e.clientY - dragStart.y;
    
    const newPanX = Math.max(-180, Math.min(180, Math.round(panStart.x + diffX)));
    const newPanY = Math.max(-180, Math.min(180, Math.round(panStart.y + diffY)));
    
    setPanX(newPanX);
    setPanY(newPanY);
  };

  const handlePointerUp = () => {
    setIsDraggingPhoto(false);
  };

  // List of titles for the randomize feature
  const builderTitles = [
    'merge conflictor',
    'frontend wizard',
    'fullstack mechanic',
    'bug creator',
    'git destroyer',
    'coffee compiler',
    'css whisperer',
    'pixel pusher',
    'stackoverflower',
    'async awaiter',
    'console logger',
    'merge master'
  ];

  const handleRandomizeTitle = () => {
    if (soundOn) playClickSound();
    const randomIndex = Math.floor(Math.random() * builderTitles.length);
    setValue('builderTitle', builderTitles[randomIndex]);
  };

  // Retro sound trigger
  const playClickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
      console.warn('Audio synthesis failed:', e);
    }
  };

  const handleResetPhoto = () => {
    if (soundOn) playClickSound();
    setZoom(1.0);
    setPanX(0);
    setPanY(0);
    setBrightness(100);
    setColorFilter('normal');
    toast.success('Position and zoom reset.');
  };

  // Drag & Drop
  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      toast.error('Image size must be less than 10MB.');
      return;
    }
    if (acceptedFiles.length === 0) return;
    
    if (soundOn) playClickSound();
    const selectedFile = acceptedFiles[0];
    const extension = selectedFile.name.split('.').pop().toLowerCase();
    
    setFile(selectedFile);
    setIsHeic(extension === 'heic' || extension === 'heif');

    if (extension !== 'heic' && extension !== 'heif') {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl('');
    }
    toast.success('Photo loaded successfully.');
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
    maxSize: 10 * 1024 * 1024,
    multiple: false
  });

  const generationSteps = [
    'Reading metadata configurations...',
    'Uploading image stream to buffer...',
    'Applying filters and canvas transformations...',
    'Rendering certified bubble badges...',
    'Mapping skills indicators...',
    'Generating secure pass layout...',
    'Exporting final badge card...'
  ];

  useEffect(() => {
    let interval;
    if (isGenerating) {
      setGenerationStep(0);
      interval = setInterval(() => {
        setGenerationStep((prev) => {
          if (prev < generationSteps.length - 1) return prev + 1;
          return prev;
        });
      }, 550);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Form submit handler
  const onSubmit = async (data) => {
    if (!file) {
      toast.error('Please upload a photo first.');
      return;
    }

    setIsGenerating(true);
    setUploadProgress(0);

    const params = {
      zoom,
      panX,
      panY,
      brightness,
      filter: colorFilter,
      style: selectedStyle
    };

    try {
      let res;
      const fileOrUrl = file === 'sample' ? previewUrl : file;
      
      if (activeTab === 'frame') {
        res = await generateFrame(fileOrUrl, params, (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        });
      } else {
        // Role is fixed to 'Builder @ HH Goa 2026' on every card
        res = await generateCard(fileOrUrl, {
          name: data.name,
          role: 'Builder @ HH Goa 2026',
          stack: data.stack,
          builderTitle: data.builderTitle
        }, params, (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        });
      }

      toast.success('Pass generated successfully!');
      navigate(`/share/${res.data.shareId}`, { state: { justGenerated: true } });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to render badge card.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Color mappings for Format A: PFP frame preview styles
  const themeColors = {
    emerald: { gradients: ['#10B981', '#059669', '#047857', '#065F46'] },
    sunset: { gradients: ['#FF4E50', '#F9D423', '#FF5E62', '#E11D48'] },
    cyber: { gradients: ['#00F2FE', '#4FACFE', '#38BDF8', '#0284C7'] },
    coastal: { gradients: ['#3B82F6', '#06B6D4', '#2563EB', '#1E40AF'] },
    retro: { gradients: ['#D946EF', '#8B5CF6', '#F59E0B', '#FF0844'] },
    gold: { gradients: ['#B45309', '#D97706', '#FBBF24', '#FCD34D'] }
  };

  // Real-time CSS adjustments matching slider states
  const previewImageStyle = {
    transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
    filter: `brightness(${brightness}%) ${
      colorFilter === 'grayscale' ? 'grayscale(100%)' :
      colorFilter === 'sepia' ? 'sepia(100%)' :
      colorFilter === 'cool' ? 'hue-rotate(30deg) saturate(125%)' :
      colorFilter === 'warm' ? 'hue-rotate(-30deg) saturate(125%)' : ''
    }`,
    transition: isDraggingPhoto ? 'none' : 'transform 0.05s ease-out'
  };

  const hasPhoto = file && previewUrl;

  return (
    <div className="min-h-screen bg-[#080B16] text-[#00F2FE] font-mono px-4 py-8 relative select-none">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />

      {/* Main Studio Frame Layout - Twilight Ocean Style */}
      <div className="mx-auto max-w-7xl flex flex-col gap-6">
        
        {/* ================= HEADER BAR ================= */}
        <div className="border border-[#00F2FE]/20 bg-[#0F1322] rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#00F2FE]" />
          <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#00F2FE]" />
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#00F2FE]" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#00F2FE]" />

          {/* Logo Brand Title */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="bg-[#FDE047] text-black font-black px-3 py-1.5 rounded text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 shadow-[3px_3px_0px_0px_#000]">
              <Sparkles className="h-4 w-4 animate-pulse" />
              2:47PM STUDIO
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-sans font-black text-xl sm:text-2xl tracking-tighter text-white uppercase">
                  HACKER HOUSE
                </span>
                <span className="bg-[#EC4899] text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded shadow-[1.5px_1.5px_0px_0px_#000]">
                  गोवा
                </span>
                <span className="border border-[#EAB308]/40 text-[#EAB308] text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded bg-[#EAB308]/5 tracking-widest font-sans">
                  28-31 OCT 2026
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-cyan-400 tracking-widest mt-1">
                GOA, INDIA &bull; OFFICIAL BUILDER GRAPHIC GENERATOR
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => setSoundOn(!soundOn)}
              className="p-2.5 rounded border border-[#00F2FE]/20 bg-cyan-950/20 text-[#00F2FE] hover:bg-cyan-950/40"
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Custom Tab Selector */}
            <div className="flex rounded-lg border border-[#00F2FE]/20 bg-black/40 p-1">
              <button
                type="button"
                onClick={() => { if(soundOn) playClickSound(); setActiveTab('frame'); }}
                className={`flex items-center gap-1.5 rounded-md py-2 px-4 text-xs font-black transition-all ${
                  activeTab === 'frame'
                    ? 'bg-[#FDE047] text-black shadow-md font-bold'
                    : 'text-[#00F2FE] hover:bg-[#00F2FE]/5'
                }`}
              >
                PFP Frame
              </button>
              
              <button
                type="button"
                onClick={() => { if(soundOn) playClickSound(); setActiveTab('card'); }}
                className={`flex items-center gap-1.5 rounded-md py-2 px-4 text-xs font-black transition-all ${
                  activeTab === 'card'
                    ? 'bg-[#FDE047] text-black shadow-md font-bold'
                    : 'text-[#00F2FE] hover:bg-[#00F2FE]/5'
                }`}
              >
                <Award className="h-3.5 w-3.5" />
                Builder ID Card
              </button>
            </div>
          </div>
        </div>

        {/* ================= WORKSPACE GRID ================= */}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT WORKSPACE PANELS (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* PANEL 1: EDIT PROFILE / FORM FIELDS */}
            <div className="border border-[#00F2FE]/20 bg-[#0F1322] rounded-xl p-5 flex flex-col gap-5 relative">
              <h2 className="text-xs sm:text-sm font-black text-white flex items-center gap-2 pb-2 border-b border-[#00F2FE]/10 uppercase">
                <Sparkles className="h-4 w-4 text-[#FDE047]" />
                EDIT PROFILE
              </h2>

              {/* Your photo Upload zone */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-slate-400 tracking-wider">YOUR PHOTO</span>
                <div
                  {...getRootProps()}
                  className={`border border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    isDragActive 
                      ? 'border-[#00F2FE] bg-[#00F2FE]/5' 
                      : 'border-white/10 bg-black/20 hover:bg-black/35 hover:border-white/20'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-6 w-6 text-[#00F2FE] mx-auto mb-2" />
                  <p className="text-xs font-extrabold text-white uppercase">
                    Tap to upload or drag a photo here
                  </p>
                  <p className="text-[9px] text-slate-500 mt-1 uppercase">
                    JPG, PNG, or HEIC - any crop or ratio works
                  </p>
                </div>

                {/* Clear Photo Action Button */}
                {file && (
                  <div className="mt-2.5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => { if(soundOn) playClickSound(); setFile(null); setPreviewUrl(''); }}
                      className="text-[9px] font-extrabold text-red-400 uppercase tracking-widest bg-red-950/10 border border-red-500/25 px-2.5 py-1 rounded hover:bg-red-950/20"
                    >
                      Clear photo
                    </button>
                  </div>
                )}
              </div>

              {/* Name input */}
              <div className="flex flex-col gap-1.5 mt-2">
                <label htmlFor="name" className="text-[10px] font-black text-slate-400 tracking-wider">
                  NAME
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="e.g. Dev Patel"
                  {...register('name', { 
                    required: 'Name is required.'
                  })}
                  className={`rounded bg-black border px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE] ${
                    errors.name ? 'border-red-500/50' : 'border-white/10'
                  }`}
                />
                {errors.name && <span className="text-[10px] text-red-400">{errors.name.message}</span>}
                
                {/* Fixed role label */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-[#1e293b] text-slate-300 text-[10px] font-black px-3 py-1 rounded border border-white/5">
                    Builder @ HH Goa 2026
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                    fixed on every card
                  </span>
                </div>
              </div>

              {/* Skills input */}
              {activeTab === 'card' && (
                <div className="flex flex-col gap-1.5 mt-2">
                  <label htmlFor="stack" className="text-[10px] font-black text-slate-400 tracking-wider">
                    TOP 6 SKILLS (COMMA SEPARATED - SHOWN AS ICONS)
                  </label>
                  <input
                    id="stack"
                    type="text"
                    placeholder="React, Node.js, Python, MongoDB, Docker, Figma"
                    {...register('stack', { 
                      required: 'Skills list is required.'
                    })}
                    className={`rounded bg-black border px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE] ${
                      errors.stack ? 'border-red-500/50' : 'border-white/10'
                    }`}
                  />
                  {errors.stack && <span className="text-[10px] text-red-400">{errors.stack.message}</span>}
                </div>
              )}

              {/* Builder Title input with randomize button */}
              {activeTab === 'card' && (
                <div className="flex flex-col gap-1.5 mt-2">
                  <label htmlFor="builderTitle" className="text-[10px] font-black text-slate-400 tracking-wider">
                    BUILDER TITLE
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="builderTitle"
                      type="text"
                      placeholder="e.g. merge conflictor"
                      {...register('builderTitle', { 
                        required: 'Title is required.',
                        maxLength: { value: 25, message: 'Title must not exceed 25 characters.' }
                      })}
                      className={`flex-grow rounded bg-black border px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE] ${
                        errors.builderTitle ? 'border-red-500/50' : 'border-white/10'
                      }`}
                    />
                    
                    <button
                      type="button"
                      onClick={handleRandomizeTitle}
                      className="bg-[#FDE047] text-black border border-black hover:opacity-90 active:scale-95 px-3.5 rounded flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                      title="Randomize title"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                  {errors.builderTitle && <span className="text-[10px] text-red-400">{errors.builderTitle.message}</span>}
                </div>
              )}
            </div>

            {/* PANEL 2: OVERLAYS (For PFP Frame) */}
            {activeTab === 'frame' && (
              <div className="border border-[#00F2FE]/20 bg-[#0F1322] rounded-xl p-5 flex flex-col gap-5">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 tracking-widest mb-3 uppercase">
                    SELECT PFP STYLE OVERLAY
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'emerald', label: '2:47 PM EMERALD', dot: 'bg-emerald-500' },
                      { id: 'sunset', label: 'NEON SUNSET', dot: 'bg-pink-500' },
                      { id: 'cyber', label: 'HACKER CYBER', dot: 'bg-cyan-500' },
                      { id: 'coastal', label: 'COASTAL WAVE', dot: 'bg-blue-400' },
                      { id: 'retro', label: 'RETRO SYNTH', dot: 'bg-purple-500' },
                      { id: 'gold', label: 'GOLD BUILDER', dot: 'bg-amber-500' }
                    ].map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => { if(soundOn) playClickSound(); setSelectedStyle(style.id); }}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border text-[10px] font-black tracking-wide leading-none transition-all gap-2 ${
                          selectedStyle === style.id
                            ? 'bg-[#FDE047] text-black border-black shadow-md scale-102'
                            : 'border-white/10 text-slate-300 bg-black/25 hover:bg-black/35 hover:border-white/25'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 3: POSITION ADJUSTMENTS SLIDERS */}
            <div className="border border-[#00F2FE]/20 bg-[#0F1322] rounded-xl p-5 flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <h3 className="text-xs sm:text-sm font-black flex items-center gap-2 uppercase">
                  <span className="bg-[#00F2FE]/10 text-[#00F2FE] px-2 py-0.5 rounded">⚙️</span>
                  PHOTO POSITION, ZOOM & FINE-TUNING
                </h3>
                <button
                  type="button"
                  onClick={handleResetPhoto}
                  className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors"
                >
                  Reset Photo
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {/* Zoom Scale */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Zoom Scale</span>
                    <span>{zoom.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-1 bg-black rounded-lg appearance-none cursor-pointer accent-[#FDE047]"
                  />
                </div>

                {/* Pan X and Pan Y */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pan X */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>Pan X</span>
                      <span>{panX}px</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="2"
                      value={panX}
                      onChange={(e) => setPanX(parseInt(e.target.value))}
                      className="w-full h-1 bg-black rounded-lg appearance-none cursor-pointer accent-[#FDE047]"
                    />
                  </div>

                  {/* Pan Y */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>Pan Y</span>
                      <span>{panY}px</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="2"
                      value={panY}
                      onChange={(e) => setPanY(parseInt(e.target.value))}
                      className="w-full h-1 bg-black rounded-lg appearance-none cursor-pointer accent-[#FDE047]"
                    />
                  </div>
                </div>

                {/* Brightness */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Brightness</span>
                    <span>{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full h-1 bg-black rounded-lg appearance-none cursor-pointer accent-[#FDE047]"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                    COLOR FILTER PRESET
                  </span>
                  <select
                    value={colorFilter}
                    onChange={(e) => { if(soundOn) playClickSound(); setColorFilter(e.target.value); }}
                    className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-[#00F2FE] focus:outline-none focus:border-[#00F2FE]/50"
                  >
                    <option value="normal">Normal (No Filter)</option>
                    <option value="grayscale">Grayscale</option>
                    <option value="sepia">Sepia Retro</option>
                    <option value="cool">Cool Matrix</option>
                    <option value="warm">Warm Sunset</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT PREVIEW COLUMN (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
            
            {/* Preview Box Container */}
            <div className="border border-[#00F2FE]/20 bg-[#0F1322] rounded-xl p-5 flex flex-col gap-5">
              
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-xs font-black tracking-wide flex items-center gap-1.5 text-white">
                  <Eye className="h-4 w-4 text-[#00F2FE]" />
                  LIVE GRAPHIC PREVIEW
                </span>
                
                <div className="flex items-center gap-1 rounded bg-[#00F2FE]/10 border border-[#00F2FE]/25 px-2 py-0.5 text-[8px] font-black text-[#00F2FE] tracking-widest uppercase">
                  <Maximize2 className="h-2 w-2" />
                  {activeTab === 'frame' ? '1080 x 1080 PX HD' : '1080 x 1350 PX HD'}
                </div>
              </div>

              {/* Centered Graphic Container */}
              <div className="flex items-center justify-center p-3 bg-black/40 rounded-xl min-h-[300px]">
                
                {/* RENDER FOR tab: 'frame' */}
                {activeTab === 'frame' ? (
                  <div 
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className={`relative h-64 w-64 rounded-full overflow-hidden flex items-center justify-center border-4 border-dashed border-white/10 transition-all duration-300 cursor-move select-none ${
                      hasPhoto ? 'bg-transparent' : 'bg-slate-900'
                    }`}
                  >
                    
                    {/* User Photo */}
                    {hasPhoto ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        style={previewImageStyle}
                        draggable="false"
                        className="h-full w-full object-contain pointer-events-none" 
                      />
                    ) : (
                      <div className="text-center p-4 flex flex-col items-center">
                        <Camera className="h-8 w-8 text-slate-700 mb-2" />
                        <span className="text-[7px] text-slate-500 font-extrabold tracking-widest uppercase">Circular Crop</span>
                      </div>
                    )}
                    
                    {/* PFP SVG Overlay */}
                    <div className="absolute inset-0 pointer-events-none w-full h-full">
                      <svg width="100%" height="100%" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <defs>
                          <linearGradient id="pfpLiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color={themeColors[selectedStyle].gradients[0]} />
                            <stop offset="35%" stop-color={themeColors[selectedStyle].gradients[1]} />
                            <stop offset="70%" stop-color={themeColors[selectedStyle].gradients[2]} />
                            <stop offset="100%" stop-color={themeColors[selectedStyle].gradients[3]} />
                          </linearGradient>
                        </defs>
                        <circle cx="540" cy="540" r="515" stroke="url(#pfpLiveGrad)" stroke-width="36" fill="none" />
                        <path d="M120,400 Q80,500 130,600 Q180,500 120,400 Z" fill="url(#pfpLiveGrad)" opacity="0.8" />
                        <path d="M960,400 Q1000,500 950,600 Q900,500 960,400 Z" fill="url(#pfpLiveGrad)" opacity="0.8" />
                        <path d="M160,780 Q320,830 540,780 T920,780 L920,850 L160,850 Z" fill="url(#pfpLiveGrad)" opacity="0.2" />
                        <rect x="340" y="910" width="400" height="76" rx="38" fill="#0A0F1D" fill-opacity="0.9" stroke="url(#pfpLiveGrad)" stroke-width="5" />
                        <text x="540" y="958" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="30" font-weight="900" letter-spacing="6" text-anchor="middle">HH GOA 2026</text>
                        <rect x="440" y="66" width="200" height="42" rx="21" fill="#0A0F1D" fill-opacity="0.9" stroke="url(#pfpLiveGrad)" stroke-width="3" />
                        <text x="540" y="92" fill="#EAB308" font-family="system-ui, sans-serif" font-size="16" font-weight="800" letter-spacing="3" text-anchor="middle">BUILDER</text>
                      </svg>
                    </div>
                  </div>
                ) : (
                  // RENDER FOR tab: 'card' (STRICTLY matches first image layout: RECTANGULAR PHOTO & NO QR)
                  <div className="relative w-72 h-[360px] rounded-[24px] bg-[#F3F4F0] text-black shadow-2xl relative p-4 flex flex-col justify-between select-none overflow-hidden border-[6px] border-[#006B3F] z-10">
                    
                    {/* Inner black border line */}
                    <div className="absolute inset-[2px] border border-black rounded-[18px] pointer-events-none z-15" />
                    
                    {/* Lanyard punch hole at top */}
                    <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-10 h-2.5 bg-[#1E293B] border border-black rounded-full z-20" />

                    {/* Speech Bubble Logo (गोवा certified - Matches first image) */}
                    <div className="flex flex-col items-center mt-3.5 z-10">
                      <div className="bg-[#FDE047] border-2 border-black rounded-lg px-2.5 py-0.5 text-xs font-black tracking-wide leading-tight shadow-[2px_2px_0px_0px_#000]">
                        गोवा
                      </div>
                      <span className="text-[8px] font-extrabold text-black tracking-widest mt-0.5 uppercase">certified</span>
                    </div>

                    {/* Title (lowercase text with dot - Matches first image) */}
                    <div className="text-center mt-1 z-10">
                      <h3 className="text-sm font-black tracking-tight leading-none text-black truncate uppercase">
                        {watchedTitle}.
                      </h3>
                    </div>

                    {/* Highlighted Name & Role section */}
                    <div className="flex flex-col items-center z-10 mt-1">
                      <div className="bg-[#FDE047] border-[1.5px] border-black rounded-md px-4 py-0.5 shadow-[1.5px_1.5px_0px_0px_#000] max-w-[210px] truncate">
                        <span className="text-xs font-black uppercase text-black">
                          {watchedName}
                        </span>
                      </div>
                      <span className="text-[9px] font-extrabold text-slate-700 mt-1 leading-none uppercase truncate max-w-[210px]">
                        Builder @ HH Goa 2026
                      </span>
                    </div>

                    {/* Middle Panel: Left vertical skills column & Right photo card box */}
                    <div className="flex gap-2 items-center my-auto z-10 px-1 mt-1 flex-grow">
                      
                      {/* Left Column Skills Badges (Spaced vertically, displays all 6 capsules) */}
                      <div className="flex flex-col gap-1 justify-center w-8 items-center">
                        {watchedStack.split(',').map((skill, index) => {
                          if (index >= 6) return null;
                          const cleanSkill = skill.trim().toUpperCase() || 'SK';
                          
                          let fill = 'bg-white';
                          let textColor = 'text-black';
                          
                          if (index === 0) { fill = 'bg-[#FDE047]'; }
                          else if (index === 1) { fill = 'bg-[#006B3F]'; textColor = 'text-white'; }
                          else if (index === 2) { fill = 'bg-[#3B82F6]'; textColor = 'text-white'; }
                          else if (index === 3) { fill = 'bg-[#EC4899]'; textColor = 'text-white'; }
                          else if (index === 4) { fill = 'bg-[#10B981]'; textColor = 'text-white'; }
                          else if (index === 5) { fill = 'bg-[#8B5CF6]'; textColor = 'text-white'; }
                          
                          return (
                            <div 
                              key={index} 
                              className={`min-w-[18px] h-4.5 px-1.5 rounded-full border border-black flex items-center justify-center text-[5px] font-black shadow-[0.5px_0.5px_0px_0px_#000] whitespace-nowrap ${fill} ${textColor}`}
                            >
                              {cleanSkill}
                            </div>
                          );
                        })}
                      </div>

                      {/* Right Photo Box Container (Rounded rectangle crop, CONTAIN-FIT, DRAGGABLE) */}
                      <div 
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        className={`flex-grow h-[180px] rounded-2xl border-2 border-black relative flex items-center justify-center overflow-hidden shadow-[2px_2px_0px_0px_#000] cursor-move select-none transition-colors ${
                          hasPhoto ? 'bg-transparent' : 'bg-slate-900'
                        }`}
                      >
                        {hasPhoto ? (
                          <img 
                            src={previewUrl} 
                            alt="Selfie" 
                            style={previewImageStyle}
                            draggable="false"
                            className="h-full w-full object-contain pointer-events-none" 
                          />
                        ) : (
                          // Default Silhouette preview
                          <div className="flex flex-col items-center justify-center w-full h-full relative opacity-60">
                            <div className="h-12 w-12 rounded-full bg-black/10 flex items-center justify-center">
                              <User className="h-7 w-7 text-black/30" />
                            </div>
                            <span className="text-[5px] font-black text-amber-950 tracking-wider uppercase mt-1">upload photo</span>
                          </div>
                        )}
                        
                        {/* Pink Sparkle Star Decoration */}
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                            <path d="M12 0L14 8L22 10L14 12L12 20L10 12L2 10L10 8Z" fill="#F43F5E" stroke="#000" strokeWidth="2.5" />
                          </svg>
                        </div>
                      </div>

                    </div>

                    {/* Footer Section */}
                    <div className="flex justify-between items-end border-t border-black/10 pt-1.5 z-10 text-[7px] text-slate-700 font-mono mt-1">
                      <div className="flex flex-col leading-none font-bold">
                        <span className="text-[#006B3F] text-[8px]">#FrameInGoa</span>
                        <span className="text-slate-400 text-[6px] mt-0.5">hh-goa-2026</span>
                      </div>
                      
                      <div className="text-right leading-tight font-black italic text-slate-700 font-sans scale-90 origin-bottom-right">
                        <div>Ideas shipped,</div>
                        <div>sleep skipped,</div>
                        <div className="text-[#006B3F]">Goa lived.</div>
                      </div>
                    </div>

                  </div>
                )}

              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-white/5">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex-1 rounded-lg bg-[#FDE047] text-black font-black hover:opacity-90 active:scale-98 py-3.5 text-xs sm:text-sm shadow-[3px_3px_0px_0px_#000] border-2 border-black flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  {isGenerating ? 'GENERATING...' : 'Download card'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    if (soundOn) playClickSound();
                    toast.error('Download your card first to enable sharing on X.');
                  }}
                  className="flex-1 rounded-lg bg-[#EC4899] text-white font-black hover:opacity-90 active:scale-98 py-3.5 text-xs sm:text-sm shadow-[3px_3px_0px_0px_#000] border-2 border-black flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Twitter className="h-4 w-4" />
                  Share to X
                </button>
              </div>

            </div>
          </div>

        </form>
      </div>

      {/* RENDER LOADER MODAL */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <div className="border border-[#00F2FE]/25 bg-[#0F1322] rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#00F2FE]" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#00F2FE]" />
              
              <div className="h-14 w-14 rounded-full border border-dashed border-[#00F2FE] border-t-transparent animate-spin mx-auto mb-6" />
              
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">
                HACKER PIPELINE RENDERING
              </h3>
              
              <p className="text-[10px] text-slate-400 font-bold uppercase h-5 tracking-widest mb-6">
                {generationSteps[generationStep]}
              </p>

              {/* Progress bar */}
              <div className="w-full h-1 bg-[#00F2FE]/10 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-gradient-to-r from-[#FDE047] to-[#EC4899] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              
              <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                <span>Upload progress</span>
                <span>{uploadProgress}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
