import React, { useEffect, useRef, useState } from 'react';

const VIDEO_SRC = '/assets/aistudio/coffee_scroll_sequence.mp4';
// ponytail: skip redundant seeks under this threshold — avoids seek thrash on some browsers
const SEEK_EPSILON = 0.03;

/**
 * Full-site background video, fixed behind every section, whose playback
 * position is driven by scroll depth (not autoplay/loop): frame 0 at the top
 * of the page, last frame at the bottom, scrubbing forward/back as the user
 * scrolls — visible behind every section, not just the hero.
 */
export function ScrollVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const handleLoadedData = () => setReady(true);
    video.addEventListener('loadeddata', handleLoadedData);

    if (reducedMotion) {
      // Respect reduced-motion: show a static first frame, no scroll scrubbing.
      video.currentTime = 0;
      return () => video.removeEventListener('loadeddata', handleLoadedData);
    }

    const state = { needsUpdate: true, scrollY: window.scrollY };
    const onScrollOrResize = () => {
      state.needsUpdate = true;
      state.scrollY = window.scrollY;
    };
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    let rafId = requestAnimationFrame(function tick() {
      rafId = requestAnimationFrame(tick);
      if (!state.needsUpdate || !video.duration || Number.isNaN(video.duration)) return;

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, state.scrollY / maxScroll)) : 0;
      const targetTime = progress * video.duration;

      if (Math.abs(video.currentTime - targetTime) > SEEK_EPSILON) {
        video.currentTime = targetTime;
      }
      state.needsUpdate = false;
    });

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      video.removeEventListener('loadeddata', handleLoadedData);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-10] overflow-hidden pointer-events-none bg-[#1C120E]">
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover opacity-90"
        src={VIDEO_SRC}
      />
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.3px]" />
      {!ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1C120E] transition-opacity duration-300">
          <div className="w-10 h-10 border-2 border-[#C89B5C]/30 border-t-[#C89B5C] rounded-full animate-spin" />
          <p className="text-xs tracking-[0.2em] uppercase text-[#C89B5C]/80">Brewing your experience…</p>
        </div>
      )}
    </div>
  );
}
