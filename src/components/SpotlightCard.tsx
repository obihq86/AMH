import React, { useRef, useEffect } from 'react';

const activeSpotlightRegistry = new Set();
let spotlightGlobalPointer = { x: -9999, y: -9999 };
let spotlightLastPointerType = 'mouse';
let spotlightGlobalFrame = 0;
let spotlightListenersAttached = false;

function isMobileOrTouchViewport() {
  if (typeof window === 'undefined') return false;
  return (
    window.innerWidth <= 768 ||
    'ontouchstart' in window ||
    (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)
  );
}

function ensureInitialMobilePointer() {
  if (typeof window === 'undefined') return;
  if (spotlightGlobalPointer.x < -1000 && isMobileOrTouchViewport()) {
    spotlightGlobalPointer = {
      x: Math.round(window.innerWidth * 0.5),
      y: Math.round(window.innerHeight * 0.36)
    };
  }
}

function scheduleGlobalSpotlightTick() {
  if (spotlightGlobalFrame || typeof window === 'undefined') return;
  spotlightGlobalFrame = window.requestAnimationFrame(() => {
    spotlightGlobalFrame = 0;
    ensureInitialMobilePointer();
    const px = spotlightGlobalPointer.x;
    const py = spotlightGlobalPointer.y;
    const isTouchMode = spotlightLastPointerType === 'touch' || isMobileOrTouchViewport();

    activeSpotlightRegistry.forEach((entry) => {
      const el = entry.el;
      if (!el || !el.isConnected) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      const dx = Math.max(rect.left - px, 0, px - rect.right);
      const dy = Math.max(rect.top - py, 0, py - rect.bottom);
      const effectiveDistance = isTouchMode ? Math.max(entry.distance, 130) : entry.distance;
      const isNear = Math.hypot(dx, dy) <= effectiveDistance;

      // Clamp or project coordinates on touch so the border closest to the touch point always glows brightly
      const localX = px - rect.left;
      const localY = py - rect.top;
      el.style.setProperty('--mouse-x', `${localX}px`);
      el.style.setProperty('--mouse-y', `${localY}px`);
      el.classList.toggle('is-glowing', isNear);
    });
  });
}

function attachGlobalSpotlightListeners() {
  if (spotlightListenersAttached || typeof window === 'undefined') return;
  if (isMobileOrTouchViewport()) return;
  spotlightListenersAttached = true;

  const updatePointerCoords = (clientX, clientY, pointerType = 'mouse') => {
    if (typeof clientX !== 'number' || typeof clientY !== 'number') return;
    spotlightLastPointerType = pointerType;
    spotlightGlobalPointer = { x: clientX, y: clientY };
    scheduleGlobalSpotlightTick();
  };

  const handlePointerEvent = (event) => {
    updatePointerCoords(event.clientX, event.clientY, event.pointerType || 'mouse');
  };

  const handleTouchEvent = (event) => {
    const touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
    if (touch) {
      updatePointerCoords(touch.clientX, touch.clientY, 'touch');
    }
  };

  const handleFocusIn = (event) => {
    const target = event.target;
    if (target && typeof target.getBoundingClientRect === 'function') {
      const rect = target.getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) {
        updatePointerCoords(rect.left + rect.width / 2, rect.top + rect.height / 2, spotlightLastPointerType);
      }
    }
  };

  const handleScroll = () => {
    ensureInitialMobilePointer();
    if (spotlightGlobalPointer.x < -1000) return;
    scheduleGlobalSpotlightTick();
  };

  const hideAllGlowsOnMouseLeave = () => {
    if (spotlightLastPointerType === 'touch' || isMobileOrTouchViewport()) return;
    spotlightGlobalPointer = { x: -9999, y: -9999 };
    activeSpotlightRegistry.forEach((entry) => {
      if (entry.el) entry.el.classList.remove('is-glowing');
    });
  };

  window.addEventListener('pointerdown', handlePointerEvent, { passive: true });
  window.addEventListener('pointermove', handlePointerEvent, { passive: true });
  window.addEventListener('touchstart', handleTouchEvent, { passive: true });
  window.addEventListener('touchmove', handleTouchEvent, { passive: true });
  window.addEventListener('focusin', handleFocusIn, { passive: true });
  window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
  window.addEventListener('resize', handleScroll, { passive: true });
  document.documentElement.addEventListener('mouseleave', hideAllGlowsOnMouseLeave);
}

export function QueueSpotlightCard({ children, className = '', surfaceClassName = '' }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return undefined;
    if (isMobileOrTouchViewport()) return undefined;
    attachGlobalSpotlightListeners();
    const entry = { el: card, distance: 80 };
    activeSpotlightRegistry.add(entry);
    scheduleGlobalSpotlightTick();
    return () => {
      activeSpotlightRegistry.delete(entry);
    };
  }, []);

  return (
    <div ref={cardRef} className={`queue-spotlight-card ${className}`}>
      <div className={`queue-spotlight-card__surface ${surfaceClassName}`}>{children}</div>
    </div>
  );
}

export function SpotlightCard({ children, className = '', surfaceClassName = '', variant = 'panel', dark = false, allowOverflow = false, ...rest }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return undefined;
    // পারফরম্যান্স: মোবাইল/টাচ ডিভাইসে কার্সর-গ্লো বন্ধ (স্ক্রলে layout thrash এড়াতে)
    if (isMobileOrTouchViewport()) return undefined;
    attachGlobalSpotlightListeners();
    const entry = { el: card, distance: variant === 'sub' ? 75 : 95 };
    activeSpotlightRegistry.add(entry);
    scheduleGlobalSpotlightTick();
    return () => {
      activeSpotlightRegistry.delete(entry);
    };
  }, [variant]);

  const variantClasses = [
    'spotlight-card',
    variant === 'sub' ? 'spotlight-card--sub' : '',
    dark ? 'spotlight-card--dark' : '',
    allowOverflow ? 'spotlight-card--overflow' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div ref={cardRef} className={variantClasses} {...rest}>
      <div className={`spotlight-card__surface ${surfaceClassName}`}>{children}</div>
    </div>
  );
}
