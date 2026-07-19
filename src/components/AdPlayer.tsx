import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, X, Sparkles, Trophy, Play, ShieldAlert } from 'lucide-react';

interface AdPlayerProps {
  isOpen: boolean;
  onComplete: () => void;
  onCancel: () => void;
  adUrl?: string;
}

const FICTIONAL_ADS = [
  {
    id: 'ad_quantum_code',
    title: 'Quantum Code Studio',
    tagline: 'The AI pairing agent of the future. Build apps in seconds.',
    bgColor: 'from-violet-950 via-indigo-950 to-slate-950',
    accentColor: 'text-violet-400',
    buttonColor: 'bg-violet-600 hover:bg-violet-500',
    badgeText: 'HOT SPONSOR',
    logo: '⚡',
    interactive: true,
  },
  {
    id: 'ad_pixel_odyssey',
    title: 'Pixel Craft Odyssey',
    tagline: 'Retro styled 2D side-scroller. Pre-register for exclusive skins!',
    bgColor: 'from-emerald-950 via-teal-950 to-slate-950',
    accentColor: 'text-emerald-400',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-500',
    badgeText: 'TRENDING GAME',
    logo: '🎮',
    interactive: true,
  },
  {
    id: 'ad_neon_cloud',
    title: 'Neon Cloud Database',
    tagline: 'Fully managed serverless relational DBs. Scale to zero instantly.',
    bgColor: 'from-cyan-950 via-sky-950 to-slate-950',
    accentColor: 'text-cyan-400',
    buttonColor: 'bg-cyan-600 hover:bg-cyan-500',
    badgeText: 'DEV UTILITY',
    logo: '☁️',
    interactive: true,
  }
];

export default function AdPlayer({ isOpen, onComplete, onCancel, adUrl }: AdPlayerProps) {
  const [adIndex, setAdIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(6); // 6-second simulated ad
  const [isMuted, setIsMuted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [clicksCount, setClicksCount] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Pick a random ad when the player opens
  useEffect(() => {
    if (isOpen) {
      setAdIndex(Math.floor(Math.random() * FICTIONAL_ADS.length));
      setTimeLeft(6);
      setIsCompleted(false);
      setShowWarning(false);
      setClicksCount(0);

      // Trigger popunder / new window redirect
      if (adUrl && adUrl.startsWith('http')) {
        try {
          window.open(adUrl, '_blank', 'noopener,noreferrer');
        } catch (e) {
          console.warn("Popup block prevented automatic ad redirection. User click required.", e);
        }
      }
    }
  }, [isOpen, adUrl]);

  useEffect(() => {
    if (!isOpen) return;

    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      setIsCompleted(true);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, timeLeft]);

  if (!isOpen) return null;

  const currentAd = FICTIONAL_ADS[adIndex];

  const handleCloseAttempt = () => {
    if (isCompleted) {
      onComplete();
    } else {
      // Pause timer and show warning
      if (timerRef.current) clearTimeout(timerRef.current);
      setShowWarning(true);
    }
  };

  const resumeAd = () => {
    setShowWarning(false);
    // Restart timer
    setTimeLeft((prev) => {
      // Small tick to trigger useEffect countdown
      return prev;
    });
    // Trigger tick again by decrementing
    setTimeout(() => {
      if (timeLeft > 0) {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }
    }, 100);
  };

  const handleQuitEarly = () => {
    setShowWarning(false);
    onCancel();
  };

  const handleFictionalClick = () => {
    setClicksCount((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      {/* Ad Container */}
      <div className={`relative w-full max-w-2xl aspect-[16/10] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col bg-gradient-to-br ${currentAd.bgColor} transition-all duration-500`}>
        
        {/* Top Header Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="bg-white/10 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-[10px] tracking-wider text-white font-semibold uppercase">
              {currentAd.badgeText}
            </span>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/5 transition text-white"
              id="btn-ad-mute"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown / Status Indicator */}
            {!isCompleted ? (
              <span className="bg-black/40 backdrop-blur-md border border-white/5 text-xs text-slate-300 px-3 py-1 rounded-full font-mono font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Reward in {timeLeft}s
              </span>
            ) : (
              <span className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-xs text-emerald-400 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 animate-bounce">
                <Sparkles className="w-3.5 h-3.5" />
                Reward Unlocked!
              </span>
            )}

            {/* Close Button */}
            <button
              onClick={handleCloseAttempt}
              className={`p-1.5 rounded-full border transition-all ${
                isCompleted 
                  ? 'bg-emerald-600 border-emerald-400 text-white hover:scale-105 hover:bg-emerald-500' 
                  : 'bg-black/40 border-white/5 text-slate-300 hover:bg-black/60 hover:text-white'
              }`}
              id="btn-ad-close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ad Central Visual Workspace */}
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 mt-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="space-y-4 max-w-md"
          >
            {/* Ad Logo Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-4xl mx-auto shadow-inner shadow-white/10">
              {currentAd.logo}
            </div>

            {/* Title & Tagline */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm font-sans">
                {currentAd.title}
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed px-4">
                {currentAd.tagline}
              </p>
            </div>

            {/* Interactive Simulated Target (Simulates app demo) */}
            <div className="p-1">
              {adUrl && adUrl.startsWith('http') ? (
                <div className="space-y-3">
                  <a
                    href={adUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setClicksCount((prev) => prev + 1)}
                    className="inline-flex items-center gap-2 bg-[#00ff87] hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-xl font-bold tracking-wider text-xs uppercase shadow-[0_0_15px_rgba(0,255,135,0.35)] transition-all transform active:scale-95"
                    id="btn-ad-cta-link"
                  >
                    <Play className="w-4 h-4" /> Load Sponsor Ad Link
                  </a>
                  <p className="text-[10px] text-[#00ff87]/80">
                    If pop-up did not open, click above to visit sponsor offer and unlock your reward.
                  </p>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleFictionalClick}
                    className={`px-5 py-2.5 rounded-xl font-semibold shadow-lg text-sm transition-all duration-200 transform active:scale-95 ${currentAd.buttonColor} text-white`}
                    id="btn-ad-cta"
                  >
                    {clicksCount === 0 && "Try Instant Demo"}
                    {clicksCount > 0 && clicksCount < 3 && `Testing Demo... Click count: ${clicksCount}/3`}
                    {clicksCount >= 3 && "🚀 Sandbox Loaded Successfully!"}
                  </button>
                  <p className="text-[10px] text-slate-500 mt-2">
                    Clicking sponsor buttons simulates real user engagement metrics.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Progress Bar Track at bottom */}
        <div className="w-full bg-slate-950/80 h-1.5">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-1000 ease-linear"
            style={{ width: `${((6 - timeLeft) / 6) * 100}%` }}
          />
        </div>

        {/* Warning Modal Overlay for Early Closers */}
        <AnimatePresence>
          {showWarning && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm text-center space-y-4 shadow-2xl"
              >
                <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white font-sans">Skip Rewarded Video?</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    If you close this ad now, you will lose your reward of <strong>15 virtual coins</strong>.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={resumeAd}
                    className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold transition"
                    id="btn-ad-resume"
                  >
                    Keep Watching
                  </button>
                  <button
                    onClick={handleQuitEarly}
                    className="flex-1 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-500 text-xs font-semibold transition"
                    id="btn-ad-skip-confirm"
                  >
                    Skip & Lose Reward
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
