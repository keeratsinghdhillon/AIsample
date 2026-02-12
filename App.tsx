
import React, { useState, useEffect, useRef } from 'react';
import { checkApiKey, openKeySelector, generateHeroVideo } from './geminiService';
import { AspectRatio, GenerationStatus, VideoResult } from './types';

const DEFAULT_PROMPT = "A cinematic, slow-motion hero shot of the CEO of IOLCP. He is walking confidently through a high-tech, sun-drenched corporate glass atrium. He wears a sharp, charcoal three-piece tailored suit with a subtle 'IOLCP' gold pin on his lapel. The camera performs a dynamic low-angle tracking shot, moving backward as he approaches, emphasizing his stature. His expression is determined and visionary. As he walks, the sun catches the glass behind him, creating a warm lens flare. In the background, a blurred, bustling team of professionals and digital data displays suggest a global operation. The lighting is dramatic 'golden hour' rim lighting, highlighting his silhouette. The video ends with him coming to a stop, looking slightly off-camera with a confident smile. Ultra-realistic skin textures, 4k, cinematic film stock, professional color grading.";

const App: React.FC = () => {
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [status, setStatus] = useState<GenerationStatus>({ isGenerating: false, message: '' });
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      const isSelected = await checkApiKey();
      setApiKeySelected(isSelected);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    await openKeySelector();
    setApiKeySelected(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerGeneration = async () => {
    if (!selectedImage) return;

    setStatus({ isGenerating: true, message: "Initializing..." });
    setVideoResult(null);

    try {
      const videoUrl = await generateHeroVideo(
        selectedImage,
        prompt,
        aspectRatio,
        (msg) => setStatus(prev => ({ ...prev, message: msg }))
      );
      
      setVideoResult({
        url: videoUrl,
        prompt: prompt,
        aspectRatio: aspectRatio
      });
      setStatus({ isGenerating: false, message: '' });
    } catch (error: any) {
      console.error(error);
      setStatus({ 
        isGenerating: false, 
        message: '', 
        error: error.message || "An unexpected error occurred during generation." 
      });
      
      if (error.message?.includes("re-select")) {
        setApiKeySelected(false);
      }
    }
  };

  if (!apiKeySelected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-2xl shadow-2xl text-center">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 text-amber-500">
            <i className="fa-solid fa-key text-4xl"></i>
          </div>
          <h1 className="text-3xl font-bold mb-4 tracking-tight">Access Required</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            To use the advanced Veo Video Generation engine, you must select a valid API Key from a paid GCP project.
          </p>
          <button 
            onClick={handleSelectKey}
            className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-bolt"></i>
            Select API Key
          </button>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block mt-6 text-sm text-slate-500 hover:text-amber-500 transition-colors underline"
          >
            Learn about API billing requirements
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-lg">
              <i className="fa-solid fa-film text-slate-950 text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-none">IOLCP Hero</h1>
              <p className="text-xs text-slate-500 font-medium">Veo 3.1 Cinema Engine</p>
            </div>
          </div>
          <button 
            onClick={handleSelectKey}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Switch API Key
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 pt-8">
        
        {/* Input Controls */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-slate-800/40 rounded-2xl border border-slate-700 p-6 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <i className="fa-solid fa-image text-amber-500"></i>
              Base Visuals
            </h2>
            
            {/* Image Upload Area */}
            <div 
              onClick={() => !status.isGenerating && fileInputRef.current?.click()}
              className={`relative h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
                ${selectedImage ? 'border-amber-500/50' : 'border-slate-600 hover:border-slate-500'}
                ${status.isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {selectedImage ? (
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6">
                  <i className="fa-solid fa-cloud-arrow-up text-4xl text-slate-500 mb-3"></i>
                  <p className="text-slate-400 font-medium">Upload CEO Portrait</p>
                  <p className="text-xs text-slate-600 mt-1">PNG or JPEG supported</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>

            {/* Prompt Config */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-400 block">Cinematic Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={status.isGenerating}
                className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none disabled:opacity-50"
                placeholder="Describe the cinematic sequence..."
              />
            </div>

            {/* Aspect Ratio & Action */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Aspect Ratio</label>
                <div className="flex gap-2">
                  {(['16:9', '9:16'] as AspectRatio[]).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      disabled={status.isGenerating}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all
                        ${aspectRatio === ratio 
                          ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}
                        ${status.isGenerating ? 'opacity-50' : ''}
                      `}
                    >
                      {ratio} {ratio === '16:9' ? 'Landscape' : 'Portrait'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              disabled={!selectedImage || status.isGenerating}
              onClick={triggerGeneration}
              className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-3 transition-all
                ${!selectedImage || status.isGenerating 
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:shadow-xl hover:shadow-amber-500/20 active:scale-95'}
              `}
            >
              {status.isGenerating ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-slate-950 border-t-transparent rounded-full"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  <span>Animate Hero Shot</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Output Display */}
        <section className="lg:col-span-7">
          <div className="bg-slate-800/40 rounded-2xl border border-slate-700 overflow-hidden min-h-[500px] flex flex-col">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <i className="fa-solid fa-display text-amber-500"></i>
                Cinematic Output
              </h2>
              {videoResult && (
                <a 
                  href={videoResult.url} 
                  download="iolcp-hero-shot.mp4"
                  className="text-sm font-medium text-amber-500 hover:text-amber-400 flex items-center gap-2"
                >
                  <i className="fa-solid fa-download"></i>
                  Download MP4
                </a>
              )}
            </div>

            <div className="flex-1 relative flex items-center justify-center bg-black/40 p-4">
              {status.isGenerating ? (
                <div className="flex flex-col items-center text-center max-w-sm">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 blur-2xl bg-amber-500/20 animate-pulse rounded-full"></div>
                    <div className="relative animate-spin-slow">
                      <svg className="w-24 h-24" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-700" />
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="283" strokeDashoffset="210" className="text-amber-500" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-amber-500 font-bold text-lg mb-2 animate-pulse">{status.message}</p>
                  <p className="text-slate-500 text-sm italic">"Corporate visionary in progress..."</p>
                </div>
              ) : videoResult ? (
                <div className={`w-full h-full flex items-center justify-center ${videoResult.aspectRatio === '9:16' ? 'max-w-md mx-auto' : ''}`}>
                  <video 
                    src={videoResult.url} 
                    controls 
                    autoPlay 
                    loop 
                    className="max-w-full max-h-full rounded-xl shadow-2xl shadow-black/60 border border-slate-700"
                  />
                </div>
              ) : status.error ? (
                <div className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-2xl max-w-sm">
                  <i className="fa-solid fa-triangle-exclamation text-4xl text-red-500 mb-4"></i>
                  <h3 className="text-lg font-bold text-red-500 mb-2">Generation Failed</h3>
                  <p className="text-sm text-slate-400">{status.error}</p>
                  <button 
                    onClick={triggerGeneration}
                    className="mt-6 text-sm font-bold text-slate-100 bg-red-500/20 hover:bg-red-500/30 px-6 py-2 rounded-lg transition-all"
                  >
                    Retry Render
                  </button>
                </div>
              ) : (
                <div className="text-center text-slate-600 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border border-slate-700 flex items-center justify-center mb-4">
                    <i className="fa-solid fa-clapperboard text-3xl opacity-20"></i>
                  </div>
                  <p className="text-lg font-medium">Ready to produce.</p>
                  <p className="text-sm">Upload an image and click generate to begin the sequence.</p>
                </div>
              )}
            </div>
            
            {/* Legend / Info Footer */}
            <div className="p-4 bg-slate-900/50 border-t border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Model</span>
                <span className="text-xs text-slate-300 font-medium">Veo 3.1 Fast</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Resolution</span>
                <span className="text-xs text-slate-300 font-medium">720p HD Master</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">FPS</span>
                <span className="text-xs text-slate-300 font-medium">24 (Film Standard)</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Color Space</span>
                <span className="text-xs text-slate-300 font-medium">Rec.709 Cinematic</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
             <i className="fa-solid fa-circle-info text-amber-500 mt-0.5"></i>
             <div className="text-xs text-slate-400 leading-relaxed">
               <span className="text-amber-500 font-bold block mb-1 uppercase">Production Notes:</span>
               Video generation typically takes 2-5 minutes depending on queue load. For best results, use a clear portrait with a simple background. The model will extrapolate movement based on your visionary prompt.
             </div>
          </div>
        </section>
      </main>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
