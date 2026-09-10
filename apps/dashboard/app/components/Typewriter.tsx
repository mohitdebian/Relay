'use client';

import { useState, useEffect } from 'react';

export default function Typewriter({
  text,
  delay = 0,
  speed = 40,
  className = '',
}: {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setDisplayedText(text);
      setIsTyping(false);
      setShowCursor(false);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);
    setShowCursor(true);
    let timeout: NodeJS.Timeout;

    // Total typing time should be ~300-400ms for short texts like titles
    // Speed could be computed dynamically based on text length, but fixed speed is simple
    const dynamicSpeed = Math.max(10, Math.min(speed, 400 / (text.length || 1)));

    timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(text.substring(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setIsTyping(false);
          // Cursor stays briefly before disappearing
          setTimeout(() => setShowCursor(false), 800);
        }
      }, dynamicSpeed);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay, speed]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && <span className="cursor-blink"></span>}
    </span>
  );
}
