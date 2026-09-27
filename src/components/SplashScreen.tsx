import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

/**
 * C.9.8.1 — Visual Fidelity Correction Patch
 * Opening Splash Screen — BIDAYAT FAQIH
 *
 * Faithfully mirrors the visual reference (photo_2026-09-27_03-24-00.jpg):
 * - Upright oval Islamic manuscript cartouche (Tezhip style)
 * - Upper and lower three-lobed palmettes in deep noble emerald green (#1b5c36)
 * - Fine symmetrical golden ribbon scrollwork and contour lines (#c89f57)
 * - Pure ivory field (#f7f3e8 / #fcfaf3)
 * - Central title in noble emerald green: «بداية فقيه» (no Kufic, classical Thuluth/Naskh rounded curves)
 * - Hadith below: «مَن يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ»
 *
 * Cinematic Sequence:
 * 1. Deep calm darkness (0.0s - 1.0s)
 * 2. Hadith appears first as the origin of light (1.0s - 2.4s)
 * 3. Light continuously spreads from the Hadith outward (2.4s - 4.2s)
 * 4. Cartouche and «بداية فقيه» materialize peacefully from the light (4.2s - 5.8s)
 * 5. Screen gently fills with the reference ivory background (#f7f3e8) (5.8s - 7.2s)
 * 6. Slow, noble, subtle 3D rotation of the entire cartouche as one unit (7.2s - 10.2s)
 * 7. Soft receding into depth & seamless handover to the platform (10.2s - 11.8s)
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  // Cinematic Timeline Phases:
  // 0: darkness
  // 1: hadith-appears (at center, quiet, focused)
  // 2: hadith-glows (light emanates from the letters)
  // 3: light-spreads (continuous smooth expansion outward)
  // 4: cartouche-manifests (ornament + «بداية فقيه»)
  // 5: ivory-blossom (screen fills with warm ivory #f7f3e8)
  // 6: rotation-3d (very slow, majestic 3D axial rotation)
  // 7: recede-depth (smooth scale-down & fade)
  const [phase, setPhase] = useState<number>(0);
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);

  // Check prefers-reduced-motion & prevent body scrollbar
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Master Cinematic Timeline (~11.6s total)
  useEffect(() => {
    if (isReducedMotion) {
      const t1 = setTimeout(() => setPhase(1), 300);
      const t2 = setTimeout(() => setPhase(4), 1000);
      const t3 = setTimeout(() => setPhase(5), 1800);
      const t4 = setTimeout(() => setPhase(7), 3200);
      const t5 = setTimeout(() => onComplete(), 4000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        clearTimeout(t5);
      };
    }

    const timers: NodeJS.Timeout[] = [];

    // Phase 1: Hadith appears in the quiet darkness (1.0s)
    timers.push(setTimeout(() => setPhase(1), 1000));

    // Phase 2: Light originates directly from the Hadith letters (2.2s)
    timers.push(setTimeout(() => setPhase(2), 2200));

    // Phase 3: Light continuously spreads smoothly across the screen (3.5s)
    timers.push(setTimeout(() => setPhase(3), 3500));

    // Phase 4: Cartouche ornament and «بداية فقيه» emerge from the light (4.6s)
    timers.push(setTimeout(() => setPhase(4), 4600));

    // Phase 5: The ambient light fills the screen into the full soothing ivory background (5.8s)
    timers.push(setTimeout(() => setPhase(5), 5800));

    // Phase 6: Subtle, slow 3D rotation begins (7.2s)
    timers.push(setTimeout(() => setPhase(6), 7200));

    // Phase 7: Receding into depth (10.2s)
    timers.push(setTimeout(() => setPhase(7), 10200));

    // Finish and smooth handover to the main platform (11.8s)
    timers.push(setTimeout(() => onComplete(), 11800));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isReducedMotion, onComplete]);

  // Slow, subtle, graceful 3D rotation (1 full 360° turn lasting 3.0 seconds)
  useEffect(() => {
    if (phase !== 6 || isReducedMotion) return;

    const DURATION = 3000; // 3.0s for one very calm, slow, majestic turn
    const TARGET_DEG = 360;
    const startTime = performance.now();

    const animateRotation = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / DURATION, 1);

      // Smooth sine in-out curve: very soft start, gentle middle, imperceptible stop
      const eased = -(Math.cos(Math.PI * progress) - 1) / 2;
      setRotationDeg(eased * TARGET_DEG);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animateRotation);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateRotation);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [phase, isReducedMotion]);

  // Clean skip handler
  const handleSkip = () => {
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 z-[99999] overflow-hidden select-none flex flex-col items-center justify-center transition-colors duration-1000 ease-in-out"
      style={{
        // Seamless shift from midnight darkness to the reference warm ivory (#f7f3e8)
        backgroundColor: phase >= 5 ? '#f7f3e8' : '#070e17',
      }}
      dir="rtl"
    >
      {/* Skip Button (quiet, minimal, respectful) */}
      <button
        onClick={handleSkip}
        type="button"
        className={`absolute top-6 left-6 z-50 text-[11px] font-bold px-3.5 py-1.5 rounded-full border transition-all flex items-center gap-1.5 backdrop-blur-sm ${
          phase >= 5
            ? 'text-stone-600 hover:text-stone-900 bg-white/70 hover:bg-white border-stone-300 shadow-sm'
            : 'text-amber-200/60 hover:text-amber-200 bg-slate-900/60 hover:bg-slate-800/80 border-amber-500/20'
        }`}
        title="تخطي المقدمة"
        aria-label="تخطي المقدمة والانتقال للمنصة"
      >
        <span>تخطي</span>
        <ArrowRight className="w-3.5 h-3.5 transform rotate-180" />
      </button>

      {/* CONTINUOUS SMOOTH LIGHT SPREAD LAYERS */}
      {/* 1. Deep Midnight Base Vignette (Active in dark phases) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(16, 45, 30, 0.4) 0%, rgba(7, 14, 23, 0.98) 75%, #050a10 100%)',
          opacity: phase < 5 ? 1 : 0,
        }}
      />

      {/* 2. Expanding Light Aura emanating from the Hadith */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-out"
        style={{
          background:
            'radial-gradient(circle at 50% 52%, rgba(247, 243, 232, 0.95) 0%, rgba(235, 218, 178, 0.45) 35%, rgba(200, 159, 87, 0.2) 60%, transparent 85%)',
          transform:
            phase >= 5
              ? 'scale(2.5)'
              : phase >= 3
              ? 'scale(1.6)'
              : phase >= 2
              ? 'scale(0.9)'
              : 'scale(0.2)',
          opacity: phase >= 2 && phase < 5 ? 1 : phase >= 5 ? 0 : 0,
        }}
      />

      {/* 3. Soft Ivory Warm Ambient Wash (Reference Atmosphere) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          backgroundColor: '#f7f3e8',
          opacity: phase >= 5 ? 1 : 0,
        }}
      />

      {/* MAIN CINEMATIC COMPOSITION CONTAINER */}
      <div
        className="relative z-10 flex flex-col items-center justify-center w-full max-w-md px-4 transition-all duration-1000"
        style={{
          perspective: '1200px',
          transformStyle: 'preserve-3d',
          // Phase 7: Receding into depth with scale-down and soft fade
          transform:
            phase >= 7
              ? 'scale(0.18) translateZ(-650px)'
              : 'scale(1) translateZ(0px)',
          opacity: phase >= 7 ? 0 : 1,
          transition:
            phase >= 7
              ? 'all 1.6s cubic-bezier(0.4, 0, 0.2, 1)'
              : 'opacity 0.8s ease',
        }}
      >
        {/* ========================================================= */}
        {/* CARTOUCHE EMBLEM: Upright Oval Islamic Manuscript Frame  */}
        {/* Matching photo_2026-09-27_03-24-00.jpg with 100% Fidelity */}
        {/* (Turns as ONE RIGID UNIT in 3D: Frame, Palmettes, Word)   */}
        {/* ========================================================= */}
        <div
          className="relative transition-all duration-1000 ease-out flex items-center justify-center"
          style={{
            perspective: '1200px',
            transformStyle: 'preserve-3d',
            opacity: phase >= 4 ? 1 : 0,
            transform:
              phase >= 4
                ? 'scale(1) translateY(0px)'
                : 'scale(0.85) translateY(18px)',
            marginBottom: '2.5rem',
          }}
        >
          {/* Subtle warm halo behind the cartouche during dark phases */}
          <div
            className="absolute -inset-4 rounded-full pointer-events-none blur-xl transition-opacity duration-700"
            style={{
              background:
                'radial-gradient(circle, rgba(200, 159, 87, 0.35) 0%, rgba(27, 92, 54, 0.25) 50%, transparent 70%)',
              opacity: phase >= 4 && phase < 5 ? 1 : 0,
            }}
          />

          {/* 3D ROTATING CARTOUCHE CONTAINER (Rotates frame, scrolls, palmettes, word together) */}
          <div
            className="relative"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateY(${rotationDeg}deg)`,
              willChange: 'transform',
            }}
          >
            {/* Vector Artwork of the exact manuscript cartouche */}
            <svg
              className="w-56 h-72 sm:w-64 sm:h-80 md:w-72 md:h-92 drop-shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
              viewBox="0 0 240 310"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Reference Antiqued Gold Gradient */}
                <linearGradient id="refGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d8b26a" />
                  <stop offset="30%" stopColor="#c89f57" />
                  <stop offset="50%" stopColor="#e5ca89" />
                  <stop offset="70%" stopColor="#b68940" />
                  <stop offset="100%" stopColor="#c89f57" />
                </linearGradient>

                {/* Reference Noble Emerald Green */}
                <linearGradient id="refGreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#226a40" />
                  <stop offset="100%" stopColor="#185230" />
                </linearGradient>

                {/* Subtle soft specular sheen across the gold during 3D rotation */}
                <linearGradient id="refSheenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="48%" stopColor="rgba(255, 255, 255, 0)" />
                  <stop offset="50%" stopColor="rgba(255, 255, 255, 0.4)" />
                  <stop offset="52%" stopColor="rgba(255, 255, 255, 0)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>

              {/* 1. INNER IVORY MEDALLION FIELD */}
              <ellipse
                cx="120"
                cy="155"
                rx="78"
                ry="105"
                fill="#fcfaf3"
              />

              {/* 2. OUTER CONCENTRIC GOLDEN OVAL CONTOUR */}
              <path
                d="M 120 44 C 168 44 204 88 204 155 C 204 222 168 266 120 266 C 72 266 36 222 36 155 C 36 88 72 44 120 44 Z"
                stroke="url(#refGoldGrad)"
                strokeWidth="1.8"
                fill="none"
              />

              {/* 3. INNER CONCENTRIC GOLDEN OVAL CONTOUR */}
              <path
                d="M 120 52 C 162 52 195 93 195 155 C 195 217 162 258 120 258 C 78 258 45 217 45 155 C 45 93 78 52 120 52 Z"
                stroke="url(#refGoldGrad)"
                strokeWidth="1.2"
                fill="none"
              />

              {/* 4. UPPER GOLDEN SCROLLWORK (Otoman / Mamluk Tezhip Volutes) */}
              <g stroke="url(#refGoldGrad)" strokeWidth="1.4" fill="none">
                {/* Left scroll looping inwards */}
                <path d="M 52 110 C 58 75 80 58 108 58 C 118 58 120 68 114 74 C 108 80 98 75 98 67 C 98 60 106 58 112 58" />
                {/* Right scroll looping inwards (symmetrical) */}
                <path d="M 188 110 C 182 75 160 58 132 58 C 122 58 120 68 126 74 C 132 80 142 75 142 67 C 142 60 134 58 128 58" />
                {/* Subtle top arch connective ribbons */}
                <path d="M 102 54 C 114 47 126 47 138 54" />
                <path d="M 106 72 Q 120 65 134 72" />
              </g>

              {/* 5. TOP THREE-LOBED PALMETTE (Crest Motif in Emerald Green #1b5c36) */}
              <g transform="translate(120, 36)">
                {/* Central pointed petal */}
                <path
                  d="M 0 -16 C 5 -10 6 -2 0 4 C -6 -2 -5 -10 0 -16 Z"
                  fill="url(#refGreenGrad)"
                  stroke="url(#refGoldGrad)"
                  strokeWidth="0.8"
                />
                {/* Left side petal */}
                <path
                  d="M -2 2 C -8 -2 -14 0 -15 6 C -11 8 -5 6 -2 2 Z"
                  fill="url(#refGreenGrad)"
                  stroke="url(#refGoldGrad)"
                  strokeWidth="0.8"
                />
                {/* Right side petal */}
                <path
                  d="M 2 2 C 8 -2 14 0 15 6 C 11 8 5 6 2 2 Z"
                  fill="url(#refGreenGrad)"
                  stroke="url(#refGoldGrad)"
                  strokeWidth="0.8"
                />
                {/* Small gold core dot */}
                <circle cx="0" cy="5" r="1.5" fill="#e5ca89" />
              </g>

              {/* 6. LOWER GOLDEN SCROLLWORK & INTERLACED KNOT */}
              <g stroke="url(#refGoldGrad)" strokeWidth="1.4" fill="none">
                {/* Left bottom inward loop */}
                <path d="M 52 200 C 58 235 80 252 108 252 C 118 252 120 242 114 236 C 108 230 98 235 98 243 C 98 250 106 252 112 252" />
                {/* Right bottom inward loop */}
                <path d="M 188 200 C 182 235 160 252 132 252 C 122 252 120 242 126 236 C 132 230 142 235 142 243 C 142 250 134 252 128 252" />
                {/* Interlaced loops at bottom center */}
                <circle cx="106" cy="245" r="8" />
                <circle cx="134" cy="245" r="8" />
                <path d="M 102 256 C 114 263 126 263 138 256" />
              </g>

              {/* 7. BOTTOM THREE-LOBED PALMETTE (Inverted Crest in Emerald Green #1b5c36) */}
              <g transform="translate(120, 274)">
                {/* Central downward petal */}
                <path
                  d="M 0 16 C 5 10 6 2 0 -4 C -6 2 -5 10 0 16 Z"
                  fill="url(#refGreenGrad)"
                  stroke="url(#refGoldGrad)"
                  strokeWidth="0.8"
                />
                {/* Left side petal */}
                <path
                  d="M -2 -2 C -8 2 -14 0 -15 -6 C -11 -8 -5 -6 -2 -2 Z"
                  fill="url(#refGreenGrad)"
                  stroke="url(#refGoldGrad)"
                  strokeWidth="0.8"
                />
                {/* Right side petal */}
                <path
                  d="M 2 -2 C 8 2 14 0 15 -6 C 11 -8 5 -6 2 -2 Z"
                  fill="url(#refGreenGrad)"
                  stroke="url(#refGoldGrad)"
                  strokeWidth="0.8"
                />
                {/* Small gold core dot */}
                <circle cx="0" cy="-5" r="1.5" fill="#e5ca89" />
              </g>

              {/* 8. CENTRAL IDENTITY CALLIGRAPHY: «بداية فقيه» */}
              {/* Stacked Classical Rounded Manuscript Script (Thuluth/Naskh with Tashkeel) */}
              <g id="medallion-text-content">
                {/* Line 1: «بِدَايَةُ» */}
                <text
                  x="120"
                  y="142"
                  textAnchor="middle"
                  fontFamily="'Amiri', 'Noto Naskh Arabic', serif"
                  fontWeight="700"
                  fontSize="36"
                  fill="#1b5c36"
                  letterSpacing="1"
                >
                  بِدَايَةُ
                </text>

                {/* Line 2: «فَقِيه» */}
                <text
                  x="120"
                  y="186"
                  textAnchor="middle"
                  fontFamily="'Amiri', 'Noto Naskh Arabic', serif"
                  fontWeight="700"
                  fontSize="38"
                  fill="#1b5c36"
                  letterSpacing="1"
                >
                  فَقِيه
                </text>

                {/* Symmetrical fine gold dot accents beneath the text */}
                <circle cx="112" cy="198" r="1.8" fill="#c89f57" />
                <circle cx="128" cy="198" r="1.8" fill="#c89f57" />
              </g>

              {/* 9. SPECULAR HIGHLIGHT SHEEN (Plays softly across the gold during 3D rotation) */}
              <ellipse
                cx="120"
                cy="155"
                rx="85"
                ry="115"
                fill="url(#refSheenGrad)"
                pointerEvents="none"
                opacity={phase === 6 ? 0.65 : 0}
              />
            </svg>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SACRED HADITH: Origin of the Light                       */}
        {/* «مَن يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ» */}
        {/* Matching «إِنْ هُوَ إِلَّا وَحْيٌ يُوحَىٰ» in the Photo */}
        {/* ========================================================= */}
        <div
          className="relative text-center px-4 transition-all duration-1000 ease-out"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform:
              phase >= 4
                ? 'translateY(0px) scale(1)'
                : phase >= 1
                ? 'translateY(-16px) scale(1.03)'
                : 'translateY(15px) scale(0.95)',
          }}
        >
          {/* Golden luminous halo behind letters during the dark illumination phase */}
          <div
            className="absolute inset-0 blur-md pointer-events-none transition-opacity duration-1000"
            style={{
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(229, 202, 137, 0.6) 0%, transparent 70%)',
              opacity: phase >= 2 && phase < 5 ? 1 : 0,
            }}
          />

          {/* Hadith Typography:
              In dark phases (1-4): softly glows in luminous ivory/gold.
              In ivory phase (5+): becomes deep noble manuscript black/charcoal (#1a1a1a),
              exactly mirroring the reference subtitle! */}
          <p
            className="text-xl sm:text-2xl md:text-3xl font-serif font-bold tracking-wide leading-relaxed relative z-10 transition-colors duration-1000"
            style={{
              fontFamily: "'Amiri', 'Noto Naskh Arabic', serif",
              color: phase >= 5 ? '#1a1a1a' : phase >= 2 ? '#fffdf7' : '#c9c0b1',
              textShadow:
                phase >= 2 && phase < 5
                  ? '0 0 14px rgba(229, 202, 137, 0.85), 0 0 26px rgba(200, 159, 87, 0.6), 0 2px 4px rgba(0,0,0,0.8)'
                  : 'none',
            }}
          >
            «مَن يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ»
          </p>
        </div>
      </div>
    </div>
  );
};
